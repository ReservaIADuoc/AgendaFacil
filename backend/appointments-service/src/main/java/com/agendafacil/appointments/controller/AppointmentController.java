package com.agendafacil.appointments.controller;

import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.dto.BookingRequest;
import com.agendafacil.appointments.dto.AvailabilityResponse;
import com.agendafacil.appointments.dto.AppointmentListItem;
import com.agendafacil.appointments.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    /**
     * Listar todas las citas almacenadas en el sistema.
     * Usado por el dashboard para mostrar la agenda del profesional.
     */
    @GetMapping("/appointments")
    public List<AppointmentListItem> list(
            @RequestHeader(value = "X-Professional-Email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String resolvedEmail = resolveEmail(email, authHeader);
        if (resolvedEmail != null) {
            return service.listEnrichedByProfessionalEmail(resolvedEmail);
        }
        return service.listEnrichedAll();
    }

    /**
     * Obtener una sola cita por su UUID.
     * Usado para ver o editar los detalles de una cita específica.
     */
    @GetMapping("/appointments/{id}")
    public ResponseEntity<Appointment> get(@PathVariable String id) {
        return service.get(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crear un nuevo registro de cita.
     * Usado por el flujo del admin/dashboard para agendar una cita.
     */
    @PostMapping("/appointments")
    public ResponseEntity<Appointment> create(
            @RequestBody Appointment a,
            @RequestHeader(value = "X-Professional-Email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String resolvedEmail = resolveEmail(email, authHeader);
        if (resolvedEmail != null) {
            service.getProfessionalIdByEmail(resolvedEmail).ifPresent(a::setProfessionalId);
        }
        Appointment created = service.create(a);
        return ResponseEntity.ok(created);
    }

    /**
     * Actualizar una cita existente por su UUID.
     * Usado para modificar detalles como hora, estado o notas.
     */
    @PutMapping("/appointments/{id}")
    public ResponseEntity<Appointment> update(@PathVariable String id, @RequestBody Appointment a) {
        return service.update(id,a).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Eliminar una cita por su UUID.
     * Usado para remover citas canceladas o inválidas.
     */
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint público de reserva para la página de booking.
     * Crea una nueva cita a partir de los datos del formulario.
     */
    @PostMapping("/bookings")
    public ResponseEntity<Appointment> booking(@RequestBody BookingRequest req) {
        Appointment created = service.createBooking(req);
        return ResponseEntity.ok(created);
    }

    /**
     * Obtener horarios disponibles para un profesional en una fecha específica.
     * Usado por el flujo público de booking para mostrar franjas libres.
     */
    @GetMapping("/professionals/{username}/availability")
    public AvailabilityResponse availability(
            @PathVariable String username,
            @RequestParam String date,
            @RequestParam(required = false) String serviceId) {
        List<String> times = service.getAvailability(username, date, serviceId);
        return new AvailabilityResponse(date, times);
    }

    /**
     * Obtener servicios públicos ofrecidos por un profesional.
     * Usado en la página de booking para mostrar las opciones de servicio.
     */
    @GetMapping("/professionals/{username}/services")
    public List<Map<String,Object>> services(@PathVariable String username) {
        return service.getServices(username);
    }

    /**
     * Obtener los detalles públicos del perfil de un profesional.
     */
    @GetMapping("/professionals/{username}")
    public ResponseEntity<Map<String,Object>> getProfile(@PathVariable String username) {
        Map<String,Object> profile = service.getProfessionalProfile(username);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    /**
     * Obtener horarios configurados del profesional logueado.
     */
    @GetMapping("/appointments/schedules")
    public ResponseEntity<List<Map<String, Object>>> getMySchedules(
            @RequestHeader(value = "X-Professional-Email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String resolvedEmail = resolveEmail(email, authHeader);
        if (resolvedEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(service.getSchedulesByProfessionalEmail(resolvedEmail));
    }

    /**
     * Guardar/actualizar horarios configurados del profesional logueado.
     */
    @PutMapping("/appointments/schedules")
    public ResponseEntity<Void> saveMySchedules(
            @RequestBody List<Map<String, Object>> schedulesList,
            @RequestHeader(value = "X-Professional-Email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String resolvedEmail = resolveEmail(email, authHeader);
        if (resolvedEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        service.saveSchedulesByProfessionalEmail(schedulesList, resolvedEmail);
        return ResponseEntity.ok().build();
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
