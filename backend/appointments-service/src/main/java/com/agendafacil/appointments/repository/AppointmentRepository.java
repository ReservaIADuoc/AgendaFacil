package com.agendafacil.appointments.repository;

import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByProfessionalId(UUID professionalId);

    @Query(value = "SELECT id FROM professionals WHERE email = :email", nativeQuery = true)
    java.util.Optional<UUID> findProfessionalIdByEmail(@Param("email") String email);

    @Query("SELECT a FROM Appointment a WHERE a.professionalId = :profId AND a.startAt < :end AND a.endAt > :start AND a.status NOT IN :excluded")
    List<Appointment> findOverlapping(@Param("profId") UUID professionalId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end, @Param("excluded") List<AppointmentStatus> excluded);

    @Query(value = "SELECT id FROM professionals WHERE username_slug = :slug", nativeQuery = true)
    java.util.Optional<UUID> findProfessionalIdByUsernameSlug(@Param("slug") String slug);

    @Query(value = "SELECT CAST(id AS VARCHAR), first_name, last_name, bio, specialty, email FROM professionals WHERE username_slug = :slug", nativeQuery = true)
    List<Object[]> findProfessionalProfileBySlug(@Param("slug") String slug);

    @Query(value = "SELECT CAST(id AS VARCHAR), name, description, duration_minutes, price, CAST(modality AS VARCHAR), color_hex, icon_name FROM services WHERE professional_id = :profId AND is_active = true", nativeQuery = true)
    List<Object[]> findActiveServicesByProfessionalId(@Param("profId") UUID professionalId);

    @Query(value = "SELECT CAST(start_time AS VARCHAR), CAST(end_time AS VARCHAR) FROM schedules WHERE professional_id = :profId AND day_of_week = CAST(:dayOfWeek AS day_of_week) AND is_active = true", nativeQuery = true)
    List<Object[]> findActiveScheduleForDay(@Param("profId") UUID professionalId, @Param("dayOfWeek") String dayOfWeek);

    @Query(value = "SELECT CAST(start_time AS VARCHAR), CAST(end_time AS VARCHAR) FROM schedule_exceptions WHERE professional_id = :profId AND exception_date = CAST(:date AS DATE)", nativeQuery = true)
    List<Object[]> findScheduleExceptionForDate(@Param("profId") UUID professionalId, @Param("date") String date);

    @Query(value = "SELECT id FROM clients WHERE professional_id = :profId AND email = :email", nativeQuery = true)
    java.util.Optional<UUID> findClientIdByEmailAndProfessionalId(@Param("profId") UUID professionalId, @Param("email") String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "INSERT INTO clients (id, professional_id, first_name, last_name, email, phone, status, created_at, updated_at) VALUES (:id, :profId, :firstName, :lastName, :email, :phone, 'NEW', NOW(), NOW())", nativeQuery = true)
    void insertClient(@Param("id") UUID id, @Param("profId") UUID professionalId, @Param("firstName") String firstName, @Param("lastName") String lastName, @Param("email") String email, @Param("phone") String phone);

    @Query(value = "SELECT duration_minutes FROM services WHERE id = :serviceId", nativeQuery = true)
    java.util.Optional<Integer> findServiceDuration(@Param("serviceId") UUID serviceId);

    @Query(value = "SELECT CAST(id AS VARCHAR), CAST(day_of_week AS VARCHAR), CAST(start_time AS VARCHAR), CAST(end_time AS VARCHAR), is_active FROM schedules WHERE professional_id = :profId", nativeQuery = true)
    List<Object[]> findSchedulesByProfessionalId(@Param("profId") UUID professionalId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "INSERT INTO schedules (id, professional_id, day_of_week, start_time, end_time, is_active) VALUES (gen_random_uuid(), :profId, CAST(:dayOfWeek AS day_of_week), CAST(:startTime AS TIME), CAST(:endTime AS TIME), :isActive) ON CONFLICT (professional_id, day_of_week) DO UPDATE SET start_time = CAST(:startTime AS TIME), end_time = CAST(:endTime AS TIME), is_active = :isActive", nativeQuery = true)
    void upsertSchedule(@Param("profId") UUID professionalId, @Param("dayOfWeek") String dayOfWeek, @Param("startTime") String startTime, @Param("endTime") String endTime, @Param("isActive") boolean isActive);

    @Query(value = """
        SELECT CAST(a.id AS VARCHAR), CAST(a.professional_id AS VARCHAR), CAST(a.client_id AS VARCHAR),
               CAST(a.service_id AS VARCHAR), a.start_at, a.end_at, CAST(a.status AS VARCHAR),
               CAST(a.payment_status AS VARCHAR),
               TRIM(COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '')) AS client_name,
               COALESCE(s.name, 'Cita') AS service_name,
               s.color_hex
        FROM appointments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN services s ON s.id = a.service_id
        WHERE a.professional_id = :profId
        ORDER BY a.start_at
        """, nativeQuery = true)
    List<Object[]> findEnrichedByProfessionalId(@Param("profId") UUID professionalId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "INSERT INTO ai_interactions (id, professional_id, session_id, intent, user_message, ai_response, action_taken, action_entity_id, created_at) " +
                   "VALUES (gen_random_uuid(), :profId, :sessionId, CAST(:intent AS ai_intent), :userMsg, :aiResp, :actionTaken, :actionEntityId, NOW())", nativeQuery = true)
    void saveAiInteraction(@Param("profId") UUID professionalId,
                            @Param("sessionId") UUID sessionId,
                            @Param("intent") String intent,
                            @Param("userMsg") String userMessage,
                            @Param("aiResp") String aiResponse,
                            @Param("actionTaken") String actionTaken,
                            @Param("actionEntityId") UUID actionEntityId);

    @Query(value = "SELECT CAST(id AS VARCHAR) FROM clients WHERE professional_id = :profId AND LOWER(TRIM(first_name || ' ' || last_name)) = LOWER(TRIM(:name)) LIMIT 1", nativeQuery = true)
    java.util.Optional<String> findClientIdByName(@Param("profId") UUID professionalId, @Param("name") String name);

    @Query(value = "SELECT CAST(id AS VARCHAR), duration_minutes FROM services WHERE professional_id = :profId AND LOWER(TRIM(name)) = LOWER(TRIM(:name)) AND is_active = true LIMIT 1", nativeQuery = true)
    List<Object[]> findServiceByName(@Param("profId") UUID professionalId, @Param("name") String name);
}
