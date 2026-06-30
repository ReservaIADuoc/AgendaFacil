package com.agendafacil.clients.repository;

import com.agendafacil.clients.model.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<ClientEntity, UUID> {
    List<ClientEntity> findByProfessionalId(UUID professionalId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT id FROM professionals WHERE email = :email", nativeQuery = true)
    java.util.Optional<UUID> findProfessionalIdByEmail(@org.springframework.data.repository.query.Param("email") String email);
}
