package com.agendafacil.clients.controller;

import com.agendafacil.clients.model.ClinicalNoteEntity;
import com.agendafacil.clients.repository.ClinicalNoteRepository;
import com.agendafacil.clients.service.JpaClientCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Gestiona las notas clínicas de un cliente.
 * GET  /api/clients/{clientUuid}/notes
 * POST /api/clients/{clientUuid}/notes
 */
@RestController
@RequestMapping("/api/clients/{clientUuid}/notes")
public class ClinicalNoteController {

    private final ClinicalNoteRepository repo;
    private final JpaClientCatalogService clientService;

    public ClinicalNoteController(ClinicalNoteRepository repo, JpaClientCatalogService clientService) {
        this.repo = repo;
        this.clientService = clientService;
    }

    @GetMapping
    public ResponseEntity<List<ClinicalNoteEntity>> findAll(
            @PathVariable String clientUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            UUID clientId = UUID.fromString(clientUuid);
            List<ClinicalNoteEntity> notes = repo.findByClientIdOrderByCreatedAtDesc(clientId);
            return ResponseEntity.ok(notes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<ClinicalNoteEntity> create(
            @PathVariable String clientUuid,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        try {
            UUID clientId = UUID.fromString(clientUuid);
            String content = (String) body.getOrDefault("content", "");
            Boolean isAiAssisted = (Boolean) body.getOrDefault("isAiAssisted", false);

            // Resolve professionalId from the client record
            UUID professionalId = clientService.getProfessionalIdByClientUuid(clientId);

            ClinicalNoteEntity note = new ClinicalNoteEntity();
            note.setClientId(clientId);
            note.setProfessionalId(professionalId);
            note.setContentMarkdown(content);
            note.setIsAiAssisted(isAiAssisted != null && isAiAssisted);

            if (body.containsKey("appointmentId")) {
                try {
                    note.setAppointmentId(UUID.fromString((String) body.get("appointmentId")));
                } catch (Exception ignored) {}
            }

            ClinicalNoteEntity saved = repo.save(note);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
