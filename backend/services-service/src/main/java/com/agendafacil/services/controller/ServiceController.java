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
    public Collection<ServiceItem> findAll() {
        return catalogService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceItem> findById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(catalogService.findById(id));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceItem create(@RequestBody ServiceItem item) {
        item.setId(null); // aseguramos que el id lo asigna el backend, nunca el cliente
        return catalogService.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceItem> update(@PathVariable Long id, @RequestBody ServiceItem item) {
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
