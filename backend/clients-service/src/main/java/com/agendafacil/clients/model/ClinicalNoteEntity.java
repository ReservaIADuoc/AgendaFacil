package com.agendafacil.clients.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_notes")
public class ClinicalNoteEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "client_id", columnDefinition = "uuid", nullable = false)
    private UUID clientId;

    @Column(name = "professional_id", columnDefinition = "uuid", nullable = false)
    private UUID professionalId;

    @Column(name = "appointment_id", columnDefinition = "uuid")
    private UUID appointmentId;

    @Column(name = "content_markdown", columnDefinition = "text", nullable = false)
    private String contentMarkdown;

    @Column(name = "is_ai_assisted", nullable = false)
    private Boolean isAiAssisted = false;

    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }

    public UUID getProfessionalId() { return professionalId; }
    public void setProfessionalId(UUID professionalId) { this.professionalId = professionalId; }

    public UUID getAppointmentId() { return appointmentId; }
    public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }

    public String getContentMarkdown() { return contentMarkdown; }
    public void setContentMarkdown(String contentMarkdown) { this.contentMarkdown = contentMarkdown; }

    public Boolean getIsAiAssisted() { return isAiAssisted; }
    public void setIsAiAssisted(Boolean isAiAssisted) { this.isAiAssisted = isAiAssisted; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
