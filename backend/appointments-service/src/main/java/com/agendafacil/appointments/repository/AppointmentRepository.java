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

    @Query("SELECT a FROM Appointment a WHERE a.professionalId = :profId AND a.startAt < :end AND a.endAt > :start AND a.status NOT IN :excluded")
    List<Appointment> findOverlapping(@Param("profId") UUID professionalId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end, @Param("excluded") List<AppointmentStatus> excluded);
}
