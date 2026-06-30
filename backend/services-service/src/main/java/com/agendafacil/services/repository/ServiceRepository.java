package com.agendafacil.services.repository;

import com.agendafacil.services.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ServiceRepository extends JpaRepository<ServiceEntity, UUID> {
    java.util.List<ServiceEntity> findByProfessionalId(UUID professionalId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT id FROM professionals WHERE email = :email", nativeQuery = true)
    java.util.Optional<UUID> findProfessionalIdByEmail(@org.springframework.data.repository.query.Param("email") String email);
}
