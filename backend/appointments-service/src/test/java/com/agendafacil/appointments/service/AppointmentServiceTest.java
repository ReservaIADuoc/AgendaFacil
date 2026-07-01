package com.agendafacil.appointments.service;

import com.agendafacil.appointments.dto.AppointmentListItem;
import com.agendafacil.appointments.dto.BookingRequest;
import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.model.AppointmentStatus;
import com.agendafacil.appointments.model.PaymentStatus;
import com.agendafacil.appointments.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository repo;

    @InjectMocks
    private AppointmentService service;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void listAll_returnsChronologicallySorted() {
        Appointment a1 = new Appointment();
        a1.setStartAt(OffsetDateTime.parse("2026-07-01T12:00:00Z"));
        Appointment a2 = new Appointment();
        a2.setStartAt(OffsetDateTime.parse("2026-07-01T10:00:00Z"));

        when(repo.findAll()).thenReturn(Arrays.asList(a1, a2));

        List<Appointment> result = service.listAll();
        assertEquals(2, result.size());
        assertEquals(a2.getStartAt(), result.get(0).getStartAt()); // Should be first
    }

    @Test
    public void listByProfessionalEmail_filtersAndSorts() {
        UUID profId = UUID.randomUUID();
        when(repo.findProfessionalIdByEmail("prof@test.com")).thenReturn(Optional.of(profId));

        Appointment a1 = new Appointment();
        a1.setStartAt(OffsetDateTime.parse("2026-07-01T15:00:00Z"));
        Appointment a2 = new Appointment();
        a2.setStartAt(OffsetDateTime.parse("2026-07-01T14:00:00Z"));

        when(repo.findByProfessionalId(profId)).thenReturn(Arrays.asList(a1, a2));

        List<Appointment> result = service.listByProfessionalEmail("prof@test.com");
        assertEquals(2, result.size());
        assertEquals(a2.getStartAt(), result.get(0).getStartAt());

        // Test non-existent professional email
        when(repo.findProfessionalIdByEmail("none@test.com")).thenReturn(Optional.empty());
        List<Appointment> emptyResult = service.listByProfessionalEmail("none@test.com");
        assertTrue(emptyResult.isEmpty());
    }

    @Test
    public void get_validUuid_returnsAppointment() {
        UUID uuid = UUID.randomUUID();
        Appointment a = new Appointment();
        a.setId(uuid);

        when(repo.findById(uuid)).thenReturn(Optional.of(a));

        Optional<Appointment> result = service.get(uuid.toString());
        assertTrue(result.isPresent());
        assertEquals(uuid, result.get().getId());
    }

    @Test
    public void get_invalidUuid_returnsEmpty() {
        Optional<Appointment> result = service.get("not-a-valid-uuid");
        assertFalse(result.isPresent());
    }

    @Test
    public void create_generatesUuidIfNull() {
        Appointment a = new Appointment();
        a.setId(null);

        when(repo.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment created = service.create(a);
        assertNotNull(created.getId());
        verify(repo, times(1)).save(a);
    }

    @Test
    public void update_validUuid_mergesAndSaves() {
        UUID uuid = UUID.randomUUID();
        Appointment existing = new Appointment();
        existing.setId(uuid);
        existing.setStatus(AppointmentStatus.PENDING);

        Appointment changes = new Appointment();
        changes.setStatus(AppointmentStatus.CONFIRMED);
        changes.setPaymentStatus(PaymentStatus.PAID);
        changes.setClientNotes("Notes");

        when(repo.findById(uuid)).thenReturn(Optional.of(existing));
        when(repo.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Appointment> updated = service.update(uuid.toString(), changes);
        assertTrue(updated.isPresent());
        assertEquals(AppointmentStatus.CONFIRMED, updated.get().getStatus());
        assertEquals(PaymentStatus.PAID, updated.get().getPaymentStatus());
        assertEquals("Notes", updated.get().getClientNotes());
    }

    @Test
    public void update_invalidUuid_returnsEmpty() {
        Appointment changes = new Appointment();
        Optional<Appointment> result = service.update("invalid-uuid", changes);
        assertFalse(result.isPresent());
    }

    @Test
    public void delete_validUuid_callsDeleteById() {
        UUID uuid = UUID.randomUUID();
        service.delete(uuid.toString());
        verify(repo, times(1)).deleteById(uuid);
    }

    @Test
    public void getAvailability_excludesOccupiedSlots() {
        UUID profId = UUID.randomUUID();
        String username = "prof-slug";
        String date = "2026-07-01";

        when(repo.findProfessionalIdByUsernameSlug(username)).thenReturn(Optional.of(profId));
        // Schedule: 09:00 to 11:00
        when(repo.findActiveScheduleForDay(eq(profId), anyString()))
                .thenReturn(Collections.singletonList(new Object[]{"09:00:00", "11:00:00"}));

        // Confirmed Appointment: 09:30 to 10:30
        Appointment appt = new Appointment();
        appt.setStatus(AppointmentStatus.CONFIRMED);
        appt.setStartAt(OffsetDateTime.parse("2026-07-01T09:30:00-04:00")); // America/Santiago
        appt.setEndAt(OffsetDateTime.parse("2026-07-01T10:30:00-04:00"));

        when(repo.findByProfessionalId(profId)).thenReturn(Collections.singletonList(appt));
        when(repo.findServiceDuration(any())).thenReturn(Optional.of(30)); // 30 min duration

        List<String> available = service.getAvailability(username, date);

        // Candidate slots starting every 30 mins: 09:00, 09:30, 10:00, 10:30
        // Appointment is 09:30-10:30.
        // Slot 09:00-09:30 does not overlap.
        // Slot 09:30-10:00 overlaps.
        // Slot 10:00-10:30 overlaps.
        // Slot 10:30-11:00 does not overlap.
        // Available should be: ["09:00", "10:30"]
        assertTrue(available.contains("09:00"));
        assertTrue(available.contains("10:30"));
        assertFalse(available.contains("09:30"));
        assertFalse(available.contains("10:00"));
    }

    @Test
    public void getAvailability_emptyIfNoSchedule() {
        UUID profId = UUID.randomUUID();
        String username = "prof-slug";
        when(repo.findProfessionalIdByUsernameSlug(username)).thenReturn(Optional.of(profId));
        when(repo.findActiveScheduleForDay(eq(profId), anyString())).thenReturn(Collections.emptyList());

        List<String> available = service.getAvailability(username, "2026-07-01");
        assertTrue(available.isEmpty());
    }

    @Test
    public void getAvailability_respectsExceptions() {
        UUID profId = UUID.randomUUID();
        String username = "prof-slug";
        String date = "2026-07-01";

        when(repo.findProfessionalIdByUsernameSlug(username)).thenReturn(Optional.of(profId));
        // Exception: 14:00 to 15:00
        when(repo.findScheduleExceptionForDate(profId, date))
                .thenReturn(Collections.singletonList(new Object[]{"14:00:00", "15:00:00"}));

        when(repo.findByProfessionalId(profId)).thenReturn(Collections.emptyList());

        List<String> available = service.getAvailability(username, date);
        // Candidate slots for 30-min duration: 14:00, 14:30
        assertEquals(2, available.size());
        assertTrue(available.contains("14:00"));
        assertTrue(available.contains("14:30"));
    }

    @Test
    public void createBooking_success() {
        BookingRequest req = new BookingRequest();
        req.setProfessionalUsername("prof-slug");
        req.setServiceId(UUID.randomUUID().toString());
        req.setClientEmail("client@test.com");
        req.setClientName("Juan Perez");
        req.setDate("2026-07-01");
        req.setTime("10:00");
        req.setPhone("+56912345678");

        UUID profId = UUID.randomUUID();
        when(repo.findProfessionalIdByUsernameSlug("prof-slug")).thenReturn(Optional.of(profId));
        when(repo.findServiceDuration(any())).thenReturn(Optional.of(60));
        when(repo.findClientIdByEmailAndProfessionalId(profId, "client@test.com")).thenReturn(Optional.empty()); // Client does not exist

        when(repo.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment appointment = service.createBooking(req);
        assertNotNull(appointment);
        assertEquals(profId, appointment.getProfessionalId());
        assertEquals(AppointmentStatus.CONFIRMED, appointment.getStatus());
        assertEquals(PaymentStatus.UNPAID, appointment.getPaymentStatus());

        // Verify client was inserted
        verify(repo, times(1)).insertClient(any(UUID.class), eq(profId), eq("Juan"), eq("Perez"), eq("client@test.com"), eq("+56912345678"));
    }
}
