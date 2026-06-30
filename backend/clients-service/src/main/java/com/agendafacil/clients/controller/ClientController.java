package com.agendafacil.clients.controller;

import com.agendafacil.clients.model.ClientItem;
import com.agendafacil.clients.service.ClientCatalogService;
import com.agendafacil.clients.service.JpaClientCatalogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.NoSuchElementException;

/** crud de clientes, el gateway-api enruta /api/clients hacia aquí. */
@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientCatalogService catalogService;

    public ClientController(ClientCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public Collection<ClientItem> findAll(@RequestHeader(value = "X-Professional-Email", required = false) String email) {
        if (email != null && catalogService instanceof JpaClientCatalogService) {
            return ((JpaClientCatalogService) catalogService).findAllByProfessionalEmail(email);
        }
        return catalogService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientItem> findById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(catalogService.findById(id));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientItem create(
            @RequestBody ClientItem item,
            @RequestHeader(value = "X-Professional-Email", required = false) String email) {
        item.setId(null);
        if (email != null && catalogService instanceof JpaClientCatalogService) {
            return ((JpaClientCatalogService) catalogService).saveByProfessionalEmail(item, email);
        }
        return catalogService.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientItem> update(@PathVariable Long id, @RequestBody ClientItem item) {
        try {
            return ResponseEntity.ok(catalogService.update(id, item));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            catalogService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
