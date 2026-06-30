package com.agendafacil.services.controller;

import com.agendafacil.services.model.ServiceItem;
import com.agendafacil.services.service.ServiceCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.NoSuchElementException;

/**
 * Expone el catálogo de servicios ofrecidos.
 * El gateway-api enruta las peticiones que llegan a /api/services hacia aquí.
 */
@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceCatalogService catalogService;

    public ServiceController(ServiceCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public Collection<ServiceItem> findAll(
            @RequestHeader(value = "X-Professional-Email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String resolvedEmail = resolveEmail(email, authHeader);
        if (resolvedEmail != null && catalogService instanceof com.agendafacil.services.service.JpaServiceCatalogService) {
            return ((com.agendafacil.services.service.JpaServiceCatalogService) catalogService).findAllByProfessionalEmail(resolvedEmail);
        }
        return catalogService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceItem> findById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(catalogService.findById(resolveId(id)));
        } catch (NoSuchElementException | NumberFormatException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceItem create(
            @RequestBody ServiceItem item,
            @RequestHeader(value = "X-Professional-Email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        item.setId(null); // aseguramos que el id lo asigna el backend, nunca el cliente
        String resolvedEmail = resolveEmail(email, authHeader);
        if (resolvedEmail != null && catalogService instanceof com.agendafacil.services.service.JpaServiceCatalogService) {
            return ((com.agendafacil.services.service.JpaServiceCatalogService) catalogService).saveByProfessionalEmail(item, resolvedEmail);
        }
        return catalogService.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceItem> update(@PathVariable String id, @RequestBody ServiceItem item) {
        try {
            return ResponseEntity.ok(catalogService.update(resolveId(id), item));
        } catch (NoSuchElementException | NumberFormatException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            catalogService.deleteById(resolveId(id));
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException | NumberFormatException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    private Long resolveId(String idStr) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(idStr);
            long key = Math.abs(uuid.getMostSignificantBits() ^ uuid.getLeastSignificantBits());
            if (catalogService instanceof com.agendafacil.services.service.JpaServiceCatalogService) {
                com.agendafacil.services.service.JpaServiceCatalogService.registerUuid(uuid);
            }
            return key;
        } catch (IllegalArgumentException e) {
            return Long.parseLong(idStr);
        }
    }

    private String resolveEmail(String email, String authHeader) {
        if (email != null && !email.trim().isEmpty()) {
            return email;
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                return com.auth0.jwt.JWT.decode(token).getSubject();
            } catch (Exception e) {
                // Ignore decoding errors
            }
        }
        return null;
    }
}
