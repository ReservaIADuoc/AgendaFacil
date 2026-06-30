package com.agendafacil.services.service;

import com.agendafacil.services.model.ServiceItem;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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
@ConditionalOnProperty(name = "agendafacil.db.enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryServiceCatalogService implements ServiceCatalogService {

    private final Map<Long, ServiceItem> storage = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(0);

    public InMemoryServiceCatalogService() {
        ServiceItem s1 = new ServiceItem(null, "Consulta General", "Consulta clínica", new BigDecimal("50000"), 60);
        s1.setUuid("b1c2d3e4-0002-0002-0002-000000000001");
        save(s1);

        ServiceItem s2 = new ServiceItem(null, "Terapia de Pareja", "Sesión de pareja", new BigDecimal("80000"), 90);
        s2.setUuid("b1c2d3e4-0002-0002-0002-000000000002");
        save(s2);

        ServiceItem s3 = new ServiceItem(null, "Evaluación Inicial", "Primera evaluación", new BigDecimal("40000"), 45);
        s3.setUuid("b1c2d3e4-0002-0002-0002-000000000003");
        save(s3);
    }

    @Override
    public Collection<ServiceItem> findAll() {
        return storage.values();
    }

    @Override
    public ServiceItem findById(Long id) {
        ServiceItem item = storage.get(id);
        if (item == null) {
            throw new NoSuchElementException("Servicio no encontrado: " + id);
        }
        return item;
    }

    @Override
    public ServiceItem save(ServiceItem item) {
        if (item.getId() == null) {
            item.setId(sequence.incrementAndGet());
        }
        if (item.getUuid() == null) {
            item.setUuid(java.util.UUID.randomUUID().toString());
        }
        storage.put(item.getId(), item);
        return item;
    }

    @Override
    public ServiceItem update(Long id, ServiceItem changes) {
        ServiceItem existing = findById(id);
        existing.setName(changes.getName());
        existing.setDescription(changes.getDescription());
        existing.setPrice(changes.getPrice());
        existing.setDurationMinutes(changes.getDurationMinutes());
        return existing;
    }

    @Override
    public void deleteById(Long id) {
        if (storage.remove(id) == null) {
            throw new NoSuchElementException("Servicio no encontrado: " + id);
        }
    }
}
