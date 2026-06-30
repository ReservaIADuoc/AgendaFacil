package com.agendafacil.auth.repository;

import com.agendafacil.auth.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "INSERT INTO schedules (id, professional_id, day_of_week, start_time, end_time, is_active) VALUES " +
            "(gen_random_uuid(), :profId, 'MONDAY', '09:00', '18:00', true)," +
            "(gen_random_uuid(), :profId, 'TUESDAY', '09:00', '18:00', true)," +
            "(gen_random_uuid(), :profId, 'WEDNESDAY', '09:00', '18:00', true)," +
            "(gen_random_uuid(), :profId, 'THURSDAY', '09:00', '18:00', true)," +
            "(gen_random_uuid(), :profId, 'FRIDAY', '09:00', '18:00', true)", nativeQuery = true)
    void seedDefaultSchedules(@org.springframework.data.repository.query.Param("profId") UUID professionalId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "INSERT INTO services (id, professional_id, name, description, duration_minutes, price, modality, color_hex, icon_name, is_active) VALUES " +
            "(gen_random_uuid(), :profId, 'Consulta General', 'Sesión estándar para tratar diversos temas.', 60, 50000, 'VIDEO', '#C0987A', 'video', true)," +
            "(gen_random_uuid(), :profId, 'Evaluación Inicial', 'Primera entrevista para entender tu caso.', 45, 40000, 'VIDEO', '#A9B3A2', 'activity', true)", nativeQuery = true)
    void seedDefaultServices(@org.springframework.data.repository.query.Param("profId") UUID professionalId);
}
