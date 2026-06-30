package com.agendafacil.clients.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Archivos adjuntos de un cliente (PDFs, imágenes, exámenes, etc.).
 * El contenido real del archivo se guarda en Base64 en la columna content_base64
 * para mantener el sistema autocontenido sin dependencias de S3.
 */
@Entity
@Table(name = "client_attachments")
public class AttachmentEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "client_id", columnDefinition = "uuid", nullable = false)
    private UUID clientId;

    @Column(name = "professional_id", columnDefinition = "uuid", nullable = false)
    private UUID professionalId;

    @Column(name = "original_filename", length = 255, nullable = false)
    private String originalFilename;

    @Column(name = "mime_type", length = 100, nullable = false)
    private String mimeType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    /** Contenido del archivo en Base64 */
    @Column(name = "content_base64", columnDefinition = "text", nullable = false)
    private String contentBase64;

    @Column(name = "uploaded_at", nullable = false)
    private OffsetDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (uploadedAt == null) uploadedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }

    public UUID getProfessionalId() { return professionalId; }
    public void setProfessionalId(UUID professionalId) { this.professionalId = professionalId; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getContentBase64() { return contentBase64; }
    public void setContentBase64(String contentBase64) { this.contentBase64 = contentBase64; }

    public OffsetDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(OffsetDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
