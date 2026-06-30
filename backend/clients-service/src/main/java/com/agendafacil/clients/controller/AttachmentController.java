package com.agendafacil.clients.controller;

import com.agendafacil.clients.model.AttachmentEntity;
import com.agendafacil.clients.repository.AttachmentRepository;
import com.agendafacil.clients.service.JpaClientCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Gestiona los archivos adjuntos de un cliente.
 * GET  /api/clients/{clientUuid}/attachments
 * POST /api/clients/{clientUuid}/attachments  (body: { filename, mimeType, sizeBytes, contentBase64 })
 */
@RestController
@RequestMapping("/api/clients/{clientUuid}/attachments")
public class AttachmentController {

    private final AttachmentRepository repo;
    private final JpaClientCatalogService clientService;

    public AttachmentController(AttachmentRepository repo, JpaClientCatalogService clientService) {
        this.repo = repo;
        this.clientService = clientService;
    }

    @GetMapping
    public ResponseEntity<List<AttachmentEntity>> findAll(@PathVariable String clientUuid) {
        try {
            UUID clientId = UUID.fromString(clientUuid);
            // Return metadata only (without full base64 content to keep response lean)
            List<AttachmentEntity> attachments = repo.findByClientIdOrderByUploadedAtDesc(clientId);
            // Clear base64 content for list view – frontend only needs metadata
            attachments.forEach(a -> a.setContentBase64("[BINARY]"));
            return ResponseEntity.ok(attachments);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<AttachmentEntity> upload(
            @PathVariable String clientUuid,
            @RequestBody Map<String, Object> body) {
        try {
            UUID clientId = UUID.fromString(clientUuid);
            UUID professionalId = clientService.getProfessionalIdByClientUuid(clientId);

            AttachmentEntity attachment = new AttachmentEntity();
            attachment.setClientId(clientId);
            attachment.setProfessionalId(professionalId);
            attachment.setOriginalFilename((String) body.getOrDefault("filename", "archivo"));
            attachment.setMimeType((String) body.getOrDefault("mimeType", "application/octet-stream"));

            Object sizeObj = body.get("sizeBytes");
            long size = sizeObj instanceof Number ? ((Number) sizeObj).longValue() : 0L;
            attachment.setFileSizeBytes(size);
            attachment.setContentBase64((String) body.getOrDefault("contentBase64", ""));

            AttachmentEntity saved = repo.save(attachment);
            // Don't return base64 content in the response
            saved.setContentBase64("[BINARY]");
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
