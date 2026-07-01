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
        String slug = repository.findUsernameSlugByEmail(resolvedEmail).orElse("valentina-rojas");

        String userMessage = (String) body.get("message");
        String sessionIdStr = (String) body.get("sessionId");
        List<Map<String, Object>> history = (List<Map<String, Object>>) body.get("history");

        UUID sessionId = sessionIdStr != null ? UUID.fromString(sessionIdStr) : UUID.randomUUID();

        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El mensaje no puede estar vacío"));
        }

        try {
            // Load professional profile details to build context
            Map<String, Object> profile = appointmentService.getProfessionalProfile(slug);
            String profName = profile != null ? (String) profile.get("first_name") + " " + (String) profile.get("last_name") : "Profesional";

            // Load services offered
            List<Map<String, Object>> activeServices = appointmentService.getServices(slug);
            StringBuilder servicesStr = new StringBuilder();
            for (Map<String, Object> s : activeServices) {
                servicesStr.append("- ").append(s.get("name")).append(" (").append(s.get("duration_minutes")).append(" min)\n");
            }

            String systemInstructionText = "Eres el Copiloto IA de Agenda Fácil, el panel de control de " + profName + ". Eres un asistente útil y amigable para el profesional. Ayúdales a gestionar su disponibilidad, su agenda y sus citas.\n\n" +
                    "Tus funciones clave son:\n" +
                    "1. Configurar o cambiar su horario de disponibilidad: Si el profesional te pide configurar, actualizar o cambiar sus horarios (por ejemplo, 'los lunes atiendo de 09:00 a 17:00', o 'los domingos no atiendo'), debes responder amigablemente confirmando el cambio y, OBLIGATORIAMENTE al final de tu respuesta, debes incluir una sola línea con el siguiente formato JSON exacto:\n" +
                    "[SET_SCHEDULE_ACTION] {\"dayOfWeek\": \"MONDAY\", \"startTime\": \"09:00\", \"endTime\": \"17:00\", \"isActive\": true}\n" +
                    "Los días permitidos son: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY. Si indica que no atiende un día, pon \"isActive\": false, \"startTime\": \"09:00\", \"endTime\": \"18:00\".\n\n" +
                    "2. Agendar citas: Si te pide agendar una cita con un cliente (ej: 'agenda una Consulta General con Carlos López para el jueves a las 10:00'), responde amigablemente y pon al final de tu respuesta:\n" +
                    "[SCHEDULE_ACTION] {\"clientName\": \"Nombre del Cliente\", \"serviceName\": \"Nombre del Servicio\", \"dateTime\": \"YYYY-MM-DDTHH:mm:00Z\"}\n\n" +
                    "3. Cancelar citas: Si te pide cancelar una cita existente (ej: 'cancela la cita del jueves a las 10:00' o 'cancela la cita de Carlos López de mañana'), confirma amigablemente y pon al final de tu respuesta:\n" +
                    "[CANCEL_ACTION] {\"clientName\": \"Nombre del Cliente\", \"dateTime\": \"YYYY-MM-DDTHH:mm:00Z\"}\n" +
                    "Si no se menciona el nombre del cliente en la cancelación, pon \"clientName\": null.\n\n" +
                    "Los servicios disponibles son:\n" + servicesStr.toString() + "\n" +
                    "Hoy es lunes 30 de junio de 2026. Responde brevemente y en español.";

            // Call Gemini API
            String geminiResponse = callGeminiWithInstruction(userMessage, history, systemInstructionText);

            // Parse response
            String cleanResponse = geminiResponse;
            String scheduleJson = null;
            int scheduleIndex = geminiResponse.indexOf("[SCHEDULE_ACTION]");
            if (scheduleIndex != -1) {
                scheduleJson = geminiResponse.substring(scheduleIndex + "[SCHEDULE_ACTION]".length()).trim();
                cleanResponse = geminiResponse.substring(0, scheduleIndex).trim();
            }

            String setScheduleJson = null;
            int setScheduleIndex = geminiResponse.indexOf("[SET_SCHEDULE_ACTION]");
            if (setScheduleIndex != -1) {
                setScheduleJson = geminiResponse.substring(setScheduleIndex + "[SET_SCHEDULE_ACTION]".length()).trim();
                cleanResponse = geminiResponse.substring(0, setScheduleIndex).trim();
            }

            String cancelJson = null;
            int cancelIndex = geminiResponse.indexOf("[CANCEL_ACTION]");
            if (cancelIndex != -1) {
                cancelJson = geminiResponse.substring(cancelIndex + "[CANCEL_ACTION]".length()).trim();
                cleanResponse = geminiResponse.substring(0, cancelIndex).trim();
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
                        // Find or create client
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

                        // Find service
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

            if (setScheduleJson != null) {
                try {
                    Map<String, Object> schedData = objectMapper.readValue(setScheduleJson, Map.class);
                    String dayOfWeek = (String) schedData.get("dayOfWeek");
                    String startTime = (String) schedData.get("startTime");
                    String endTime = (String) schedData.get("endTime");
                    Boolean isActive = (Boolean) schedData.get("isActive");

                    if (dayOfWeek != null && startTime != null && endTime != null) {
                        repository.upsertSchedule(professionalId, dayOfWeek, startTime, endTime, isActive != null ? isActive : true);
                        actionTaken = "SET_SCHEDULE";
                    }
                } catch (Exception ex) {
                    System.err.println("Error setting schedule from AI response: " + ex.getMessage());
                }
            }

            if (cancelJson != null) {
                try {
                    Map<String, Object> cancelData = objectMapper.readValue(cancelJson, Map.class);
                    String clientName = (String) cancelData.get("clientName");
                    String dateTimeStr = (String) cancelData.get("dateTime");

                    if (dateTimeStr != null) {
                        OffsetDateTime targetTime = OffsetDateTime.parse(dateTimeStr);
                        OffsetDateTime start = targetTime.minusMinutes(5);
                        OffsetDateTime end = targetTime.plusMinutes(5);

                        Optional<String> apptIdOpt;
                        if (clientName != null && !clientName.trim().isEmpty()) {
                            apptIdOpt = repository.findAppointmentByClientAndDateRange(professionalId, clientName, start, end);
                        } else {
                            apptIdOpt = repository.findAppointmentByDateRange(professionalId, start, end);
                        }

                        if (apptIdOpt.isPresent()) {
                            UUID apptId = UUID.fromString(apptIdOpt.get());
                            repository.updateAppointmentStatus(apptId, "CANCELLED_BY_PROFESSIONAL");
                            actionTaken = "CANCEL_APPOINTMENT";
                            actionEntityId = apptId;
                            intent = "CANCEL_APPOINTMENT";
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Error cancelling appointment from AI response: " + ex.getMessage());
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

    @PostMapping("/appointments/public/ai/chat")
    public ResponseEntity<Map<String, Object>> publicChat(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        String userMessage = (String) body.get("message");
        String sessionIdStr = (String) body.get("sessionId");
        List<Map<String, Object>> history = (List<Map<String, Object>>) body.get("history");

        if (username == null || username.trim().isEmpty()) {
            username = "valentina-rojas";
        }
        Optional<UUID> profIdOpt = repository.findProfessionalIdByUsernameSlug(username);
        if (profIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Profesional no encontrado"));
        }
        UUID professionalId = profIdOpt.get();
        UUID sessionId = sessionIdStr != null ? UUID.fromString(sessionIdStr) : UUID.randomUUID();

        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El mensaje no puede estar vacío"));
        }

        try {
            // Load professional profile details
            Map<String, Object> profile = appointmentService.getProfessionalProfile(username);
            String profName = profile != null ? (String) profile.get("first_name") + " " + (String) profile.get("last_name") : "el profesional";

            // Load services offered
            List<Map<String, Object>> activeServices = appointmentService.getServices(username);
            StringBuilder servicesStr = new StringBuilder();
            for (Map<String, Object> s : activeServices) {
                servicesStr.append("- ").append(s.get("name")).append(" (").append(s.get("duration_minutes")).append(" min, ").append(s.get("price")).append(" ").append(s.get("currency")).append(")\n");
            }

            // Get availability for the next 3 days
            java.time.LocalDate today = java.time.LocalDate.now();
            StringBuilder availabilityStr = new StringBuilder();
            for (int i = 0; i < 3; i++) {
                java.time.LocalDate date = today.plusDays(i);
                String dateStr = date.toString();
                List<String> times = appointmentService.getAvailability(username, dateStr, null);
                availabilityStr.append(dateStr).append(": ").append(times.toString()).append("\n");
            }

            String systemInstructionText = "Eres el Asistente Virtual de Reservas de " + profName + " en Agenda Fácil. Tu función es ayudar a los clientes/pacientes que visitan su página pública de reservas. Debes ser muy servicial, educado y responder en español.\n\n" +
                    "Los servicios ofrecidos son:\n" + servicesStr.toString() + "\n" +
                    "La disponibilidad para los próximos 3 días es (hoy es lunes 30 de junio de 2026):\n" + availabilityStr.toString() + "\n" +
                    "Ayuda al cliente a seleccionar un servicio, día y hora de los que están disponibles.\n\n" +
                    "Tus funciones clave son:\n" +
                    "1. Agendar una hora: necesitas pedirle obligatoriamente al cliente su Nombre Completo y Correo Electrónico. Una vez que tengas el servicio, el día, la hora (dentro de los rangos disponibles), su nombre y su correo, confirma la reserva amigablemente y, OBLIGATORIAMENTE al final de tu respuesta, debes incluir una sola línea con el siguiente formato JSON exacto:\n" +
                    "[SCHEDULE_ACTION] {\"clientName\": \"Nombre Completo Cliente\", \"clientEmail\": \"correo@cliente.com\", \"serviceName\": \"Nombre exacto del Servicio\", \"dateTime\": \"YYYY-MM-DDTHH:mm:00Z\"}\n\n" +
                    "2. Cancelar una hora: Si el cliente te pide cancelar su cita (ej: 'cancela mi cita de mañana a las 10:00' o 'quiero cancelar mi hora'), pídele confirmación, nombre completo del cliente y correo. Una vez obtenido, confirma la cancelación y pon al final:\n" +
                    "[CANCEL_ACTION] {\"clientName\": \"Nombre Completo Cliente\", \"dateTime\": \"YYYY-MM-DDTHH:mm:00Z\"}\n\n" +
                    "Asegúrate de deducir el formato ISO de fecha y hora basándote en el día seleccionado. Si te preguntan otra cosa, responde de manera amigable y breve, usando emojis y saltos de línea sencillos.";

            // Call Gemini
            String geminiResponse = callGeminiWithInstruction(userMessage, history, systemInstructionText);

            // Parse response
            String cleanResponse = geminiResponse;
            String scheduleJson = null;
            int scheduleIndex = geminiResponse.indexOf("[SCHEDULE_ACTION]");
            if (scheduleIndex != -1) {
                scheduleJson = geminiResponse.substring(scheduleIndex + "[SCHEDULE_ACTION]".length()).trim();
                cleanResponse = geminiResponse.substring(0, scheduleIndex).trim();
            }

            String cancelJson = null;
            int cancelIndex = geminiResponse.indexOf("[CANCEL_ACTION]");
            if (cancelIndex != -1) {
                cancelJson = geminiResponse.substring(cancelIndex + "[CANCEL_ACTION]".length()).trim();
                cleanResponse = geminiResponse.substring(0, cancelIndex).trim();
            }

            String intent = "GENERAL_SUPPORT";
            String actionTaken = null;
            UUID actionEntityId = null;

            if (scheduleJson != null) {
                try {
                    Map<String, Object> scheduleData = objectMapper.readValue(scheduleJson, Map.class);
                    String clientName = (String) scheduleData.get("clientName");
                    String clientEmail = (String) scheduleData.get("clientEmail");
                    String serviceName = (String) scheduleData.get("serviceName");
                    String dateTimeStr = (String) scheduleData.get("dateTime");

                    if (clientName != null && serviceName != null && dateTimeStr != null) {
                        if (clientEmail == null) {
                            clientEmail = clientName.toLowerCase().replace(" ", "") + "@example.com";
                        }
                        // Find or create client
                        Optional<String> clientIdOpt = repository.findClientIdByName(professionalId, clientName);
                        UUID clientId;
                        if (clientIdOpt.isPresent()) {
                            clientId = UUID.fromString(clientIdOpt.get());
                        } else {
                            clientId = UUID.randomUUID();
                            String[] nameParts = clientName.split(" ", 2);
                            String firstName = nameParts[0];
                            String lastName = nameParts.length > 1 ? nameParts[1] : "";
                            repository.insertClient(clientId, professionalId, firstName, lastName, clientEmail, "+56912345678");
                        }

                        // Find service
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
                        appt.setClientNotes("Agendado por cliente vía Asistente Virtual");

                        Appointment saved = appointmentService.create(appt);
                        actionEntityId = saved.getId();
                        actionTaken = "SCHEDULE_APPOINTMENT";
                        intent = "SCHEDULE_APPOINTMENT";
                    }
                } catch (Exception ex) {
                    System.err.println("Error scheduling appointment from public AI response: " + ex.getMessage());
                }
            }

            if (cancelJson != null) {
                try {
                    Map<String, Object> cancelData = objectMapper.readValue(cancelJson, Map.class);
                    String clientName = (String) cancelData.get("clientName");
                    String dateTimeStr = (String) cancelData.get("dateTime");

                    if (dateTimeStr != null) {
                        OffsetDateTime targetTime = OffsetDateTime.parse(dateTimeStr);
                        OffsetDateTime start = targetTime.minusMinutes(5);
                        OffsetDateTime end = targetTime.plusMinutes(5);

                        Optional<String> apptIdOpt;
                        if (clientName != null && !clientName.trim().isEmpty()) {
                            apptIdOpt = repository.findAppointmentByClientAndDateRange(professionalId, clientName, start, end);
                        } else {
                            apptIdOpt = repository.findAppointmentByDateRange(professionalId, start, end);
                        }

                        if (apptIdOpt.isPresent()) {
                            UUID apptId = UUID.fromString(apptIdOpt.get());
                            repository.updateAppointmentStatus(apptId, "CANCELLED_BY_CLIENT");
                            actionTaken = "CANCEL_APPOINTMENT";
                            actionEntityId = apptId;
                            intent = "CANCEL_APPOINTMENT";
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Error cancelling appointment from public AI response: " + ex.getMessage());
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
                    .body(Map.of("error", "Error al procesar consulta pública con IA: " + e.getMessage()));
        }
    }

    @GetMapping("/appointments/ai/analytics/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyAnalytics(
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

        try {
            // Get enriched appointments
            List<Object[]> enrichedAppointments = repository.findEnrichedByProfessionalId(professionalId);
            
            java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
            java.time.OffsetDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            
            List<Map<String, Object>> appointmentsData = new ArrayList<>();
            for (Object[] row : enrichedAppointments) {
                Object startAtObj = row[4];
                java.time.OffsetDateTime startAt = null;
                if (startAtObj instanceof java.time.OffsetDateTime) {
                    startAt = (java.time.OffsetDateTime) startAtObj;
                } else if (startAtObj instanceof java.time.Instant) {
                    startAt = java.time.OffsetDateTime.ofInstant((java.time.Instant) startAtObj, java.time.ZoneId.of("UTC"));
                } else if (startAtObj instanceof java.sql.Timestamp) {
                    startAt = java.time.OffsetDateTime.ofInstant(((java.sql.Timestamp) startAtObj).toInstant(), java.time.ZoneId.of("UTC"));
                }

                if (startAt != null && (startAt.isAfter(startOfMonth) || startAt.isEqual(startOfMonth))) {
                    Map<String, Object> appt = new HashMap<>();
                    appt.put("id", row[0]);
                    appt.put("start_at", startAt.toString());
                    
                    Object endAtObj = row[5];
                    String endAtStr = null;
                    if (endAtObj instanceof java.time.OffsetDateTime) {
                        endAtStr = ((java.time.OffsetDateTime) endAtObj).toString();
                    } else if (endAtObj instanceof java.time.Instant) {
                        endAtStr = java.time.OffsetDateTime.ofInstant((java.time.Instant) endAtObj, java.time.ZoneId.of("UTC")).toString();
                    } else if (endAtObj instanceof java.sql.Timestamp) {
                        endAtStr = java.time.OffsetDateTime.ofInstant(((java.sql.Timestamp) endAtObj).toInstant(), java.time.ZoneId.of("UTC")).toString();
                    }
                    
                    appt.put("end_at", endAtStr);
                    appt.put("status", row[6]);
                    appt.put("payment_status", row[7]);
                    appt.put("client_name", row[8]);
                    appt.put("service_name", row[9]);
                    appointmentsData.add(appt);
                }
            }

            String jsonData = objectMapper.writeValueAsString(appointmentsData);
            String systemInstructionText = "Eres el Analista de Datos Experto de 'Agenda Fácil', el software SaaS líder de gestión de agendas y reservas. \n" +
                    "Tu objetivo es analizar los datos transaccionales (citas, servicios y clientes) de un profesional de la salud o servicios, identificar patrones de comportamiento y extraer métricas clave que le ayuden a tomar decisiones de negocio para aumentar sus ingresos. \n\n" +
                    "No inventes datos; básate estrictamente en el JSON proporcionado en el mensaje del usuario.\n\n" +
                    "Por favor, analiza los datos y devuelve siempre un reporte estructurado, amigable y motivador en formato Markdown que incluya EXACTAMENTE las siguientes secciones:\n\n" +
                    "1. **Servicios/Productos Estrella 🌟**: Identifica cuáles fueron los servicios más agendados. Menciona su volumen, duración y cómo impactan en los ingresos totales.\n" +
                    "2. **Picos de Demanda 📈**: Detecta los momentos de mayor actividad (días de la semana, horas del día o fechas específicas de mayor volumen). Dale al profesional un consejo sobre cómo aprovechar estos horarios.\n" +
                    "3. **Rendimiento Financiero 💰**: Identifica los ingresos totales generados en el periodo y destaca si hay muchas citas marcadas como UNPAID para sugerirle cobrar por adelantado.\n" +
                    "4. **Tendencias y Comportamientos 🔍**: Menciona 2 o 3 insights adicionales (ej. clientes más recurrentes, anomalías, tasa de cancelación, o tiempos muertos).\n\n" +
                    "Habla directamente al profesional en un tono consultivo, profesional pero cercano. Utiliza emojis para hacer la lectura más agradable.";

            String userMessage = "Analiza los siguientes datos de citas de este mes: \n" + jsonData;
            String geminiResponse = callGeminiWithInstruction(userMessage, null, systemInstructionText);

            return ResponseEntity.ok(Map.of("report", geminiResponse));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al generar análisis: " + e.getMessage()));
        }
    }

    private String callGeminiWithInstruction(String userMessage, List<Map<String, Object>> history, String systemInstructionText) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;

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
