package com.agendafacil.appointments.controller;

import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.model.AppointmentStatus;
import com.agendafacil.appointments.model.PaymentStatus;
import com.agendafacil.appointments.repository.AppointmentRepository;
import com.agendafacil.appointments.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api")
public class AiChatController {

    private final AppointmentService appointmentService;
    private final AppointmentRepository repository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public AiChatController(AppointmentService appointmentService, AppointmentRepository repository, ObjectMapper objectMapper) {
        this.appointmentService = appointmentService;
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    @PostMapping("/appointments/ai/chat")
    public ResponseEntity<Map<String, Object>> chat(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Professional-Email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String resolvedEmail = resolveEmail(email, authHeader);
        if (resolvedEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<UUID> profIdOpt = repository.findProfessionalIdByEmail(resolvedEmail);
        if (profIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Profesional no encontrado"));
        }
        UUID professionalId = profIdOpt.get();

        String userMessage = (String) body.get("message");
        String sessionIdStr = (String) body.get("sessionId");
        List<Map<String, Object>> history = (List<Map<String, Object>>) body.get("history");

        UUID sessionId = sessionIdStr != null ? UUID.fromString(sessionIdStr) : UUID.randomUUID();

        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El mensaje no puede estar vacío"));
        }

        try {
            // Call Gemini API
            String geminiResponse = callGemini(userMessage, history);

            // Parse response to check for schedule directive: [SCHEDULE_ACTION] { ... }
            String cleanResponse = geminiResponse;
            String scheduleJson = null;
            int scheduleIndex = geminiResponse.indexOf("[SCHEDULE_ACTION]");
            if (scheduleIndex != -1) {
                scheduleJson = geminiResponse.substring(scheduleIndex + "[SCHEDULE_ACTION]".length()).trim();
                cleanResponse = geminiResponse.substring(0, scheduleIndex).trim();
            }

            String intent = "GENERAL_SUPPORT";
            String actionTaken = null;
            UUID actionEntityId = null;

            if (scheduleJson != null) {
                try {
                    Map<String, Object> scheduleData = objectMapper.readValue(scheduleJson, Map.class);
                    String clientName = (String) scheduleData.get("clientName");
                    String serviceName = (String) scheduleData.get("serviceName");
                    String dateTimeStr = (String) scheduleData.get("dateTime");

                    if (clientName != null && serviceName != null && dateTimeStr != null) {
                        // 1. Find or create client
                        Optional<String> clientIdOpt = repository.findClientIdByName(professionalId, clientName);
                        UUID clientId;
                        if (clientIdOpt.isPresent()) {
                            clientId = UUID.fromString(clientIdOpt.get());
                        } else {
                            clientId = UUID.randomUUID();
                            String[] nameParts = clientName.split(" ", 2);
                            String firstName = nameParts[0];
                            String lastName = nameParts.length > 1 ? nameParts[1] : "";
                            String clientEmail = firstName.toLowerCase() + "@example.com";
                            repository.insertClient(clientId, professionalId, firstName, lastName, clientEmail, "+56912345678");
                        }

                        // 2. Find service
                        List<Object[]> services = repository.findServiceByName(professionalId, serviceName);
                        UUID serviceId;
                        int duration = 60;
                        if (!services.isEmpty()) {
                            Object[] svc = services.get(0);
                            serviceId = UUID.fromString((String) svc[0]);
                            duration = ((Number) svc[1]).intValue();
                        } else {
                            serviceId = UUID.fromString("b1c2d3e4-0002-0002-0002-000000000001");
                        }

                        // 3. Create appointment
                        OffsetDateTime startAt = OffsetDateTime.parse(dateTimeStr);
                        OffsetDateTime endAt = startAt.plusMinutes(duration);

                        Appointment appt = new Appointment();
                        appt.setId(UUID.randomUUID());
                        appt.setProfessionalId(professionalId);
                        appt.setClientId(clientId);
                        appt.setServiceId(serviceId);
                        appt.setStartAt(startAt);
                        appt.setEndAt(endAt);
                        appt.setStatus(AppointmentStatus.CONFIRMED);
                        appt.setPaymentStatus(PaymentStatus.UNPAID);
                        appt.setClientNotes("Agendado automáticamente por Copiloto IA");

                        Appointment saved = appointmentService.create(appt);
                        actionEntityId = saved.getId();
                        actionTaken = "SCHEDULE_APPOINTMENT";
                        intent = "SCHEDULE_APPOINTMENT";
                    }
                } catch (Exception ex) {
                    System.err.println("Error scheduling appointment from AI response: " + ex.getMessage());
                }
            }

            // Save AI interaction
            repository.saveAiInteraction(professionalId, sessionId, intent, userMessage, cleanResponse, actionTaken, actionEntityId);

            Map<String, Object> result = new HashMap<>();
            result.put("response", cleanResponse);
            result.put("sessionId", sessionId.toString());
            result.put("actionTaken", actionTaken);
            if (actionEntityId != null) {
                result.put("actionEntityId", actionEntityId.toString());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al procesar IA: " + e.getMessage()));
        }
    }

    private String callGemini(String userMessage, List<Map<String, Object>> history) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        List<Map<String, Object>> contents = new ArrayList<>();

        if (history != null) {
            for (Map<String, Object> msg : history) {
                String role = "user".equals(msg.get("role")) ? "user" : "model";
                String text = (String) msg.get("text");
                if (text != null && !text.isEmpty()) {
                    contents.add(Map.of(
                            "role", role,
                            "parts", List.of(Map.of("text", text))
                    ));
                }
            }
        }

        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage))
        ));

        String systemInstructionText = "Eres el Copiloto IA de Agenda Fácil, una aplicación moderna de gestión de citas para profesionales independientes (psicólogos, coaches, fisioterapeutas, médicos, etc.). Eres un asistente útil y amigable. Ayuda al profesional a organizar su agenda, responder dudas sobre su negocio, redactar recordatorios o mensajes para clientes, estructurar notas de citas y proponer mejoras en su agenda.\n\n" +
                "Si el profesional te pide agendar una cita (por ejemplo, 'agenda una cita con Carlos López para el jueves a las 10:00 para una Consulta General' o similar), debes responder con tu confirmación amigable en español y, OBLIGATORIAMENTE al final de tu respuesta, debes incluir una sola línea con el siguiente formato JSON exacto:\n" +
                "[SCHEDULE_ACTION] {\"clientName\": \"Nombre del Cliente\", \"serviceName\": \"Nombre del Servicio\", \"dateTime\": \"YYYY-MM-DDTHH:mm:00Z\"}\n\n" +
                "Asegúrate de deducir el formato ISO de fecha y hora basándote en la fecha actual (hoy es lunes 30 de junio de 2026). Si el servicio solicitado no es exacto, aproxima al más parecido o usa 'Consulta General'.\n\n" +
                "Si te piden cualquier otra cosa, responde de manera normal, sé muy breve, amigable y responde siempre en español. No utilices formato markdown complejo, solo texto simple, saltos de línea y emojis.";

        Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemInstructionText))
                )
        );

        String jsonString = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonString))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini returned status code " + response.statusCode() + ": " + response.body());
        }

        Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> candidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            if (content != null) {
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }

        return "No se pudo obtener respuesta del modelo.";
    }

    private String resolveEmail(String email, String authHeader) {
        if (email != null && !email.trim().isEmpty()) {
            return email;
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                return com.auth0.jwt.JWT.decode(token).getSubject();
            } catch (Exception e) {
                // Silently ignore decoding errors
            }
        }
        return null;
    }
}
