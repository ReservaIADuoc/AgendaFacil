package com.agendafacil.appointments.controller;

import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.dto.BookingRequest;
import com.agendafacil.appointments.dto.AvailabilityResponse;
import com.agendafacil.appointments.service.AppointmentService;
import org.springframework.http.ResponseEntity;
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
    public List<Appointment> list() {
        return service.listAll();
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
    public ResponseEntity<Appointment> create(@RequestBody Appointment a) {
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
        Appointment a = new Appointment();
        // Preferir professionalId (UUID); si no existe, aceptar username como legacy
        if (req.getProfessionalId() != null && !req.getProfessionalId().isEmpty()) {
            try {
                a.setProfessionalId(java.util.UUID.fromString(req.getProfessionalId()));
            } catch (IllegalArgumentException ignored) {}
        }
        // Campos mínimos requeridos: serviceId; clientId se genera como placeholder
        if (req.getServiceId() != null) {
            try { a.setServiceId(java.util.UUID.fromString(req.getServiceId())); } catch (IllegalArgumentException ignored) {}
        }
        // Para demostración creamos un clientId temporal
        a.setClientId(java.util.UUID.randomUUID());
        // Parsear fecha y hora a startAt/endAt en UTC
        try {
            java.time.OffsetDateTime start = java.time.OffsetDateTime.parse(req.getDate() + "T" + req.getTime() + ":00Z");
            a.setStartAt(start);
            a.setEndAt(start.plusHours(1));
        } catch (Exception ignored) {}
        Appointment created = service.create(a);
        return ResponseEntity.ok(created);
    }

    /**
     * Obtener horarios disponibles para un profesional en una fecha específica.
     * Usado por el flujo público de booking para mostrar franjas libres.
     */
    @GetMapping("/professionals/{username}/availability")
    public AvailabilityResponse availability(@PathVariable String username, @RequestParam String date) {
        List<String> times = service.getAvailability(username, date);
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
}
