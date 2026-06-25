package com.agendafacil.services.service;

import com.agendafacil.services.model.ServiceItem;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Repositorio en memoria (ConcurrentHashMap) mientras no hay base de datos conectada.
 * Se inicializa con un par de servicios de ejemplo para poder probar el endpoint
 * apenas se levanta el contenedor.
 */
@Service
public class ServiceCatalogService {

    private final Map<Long, ServiceItem> storage = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(0);

    public ServiceCatalogService() {
        save(new ServiceItem(null, "Corte de pelo", "Corte clásico", new BigDecimal("8000"), 30));
        save(new ServiceItem(null, "Manicure", "Manicure tradicional", new BigDecimal("6000"), 45));
    }

    public Collection<ServiceItem> findAll() {
        return storage.values();
    }

    public ServiceItem findById(Long id) {
        ServiceItem item = storage.get(id);
        if (item == null) {
            throw new NoSuchElementException("Servicio no encontrado: " + id);
        }
        return item;
    }

    public ServiceItem save(ServiceItem item) {
        if (item.getId() == null) {
            item.setId(sequence.incrementAndGet());
        }
        storage.put(item.getId(), item);
        return item;
    }

    public ServiceItem update(Long id, ServiceItem changes) {
        ServiceItem existing = findById(id);
        existing.setName(changes.getName());
        existing.setDescription(changes.getDescription());
        existing.setPrice(changes.getPrice());
        existing.setDurationMinutes(changes.getDurationMinutes());
        return existing;
    }

    public void deleteById(Long id) {
        if (storage.remove(id) == null) {
            throw new NoSuchElementException("Servicio no encontrado: " + id);
        }
    }
}
