package com.agendafacil.clients.repository;

import com.agendafacil.clients.model.AttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<AttachmentEntity, UUID> {
    List<AttachmentEntity> findByClientIdOrderByUploadedAtDesc(UUID clientId);
}
