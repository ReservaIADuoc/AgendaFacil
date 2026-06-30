package com.agendafacil.clients.service;

import com.agendafacil.clients.model.ClientItem;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/** repositorio en memoria, igual patrón que services-service. */
@Service
@ConditionalOnProperty(name = "agendafacil.db.enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryClientCatalogService implements ClientCatalogService {

    private final Map<Long, ClientItem> storage = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(0);

    public InMemoryClientCatalogService() {
        ClientItem seed = new ClientItem(null, "Cliente de ejemplo", "cliente@mail.com", "+56900000000");
        seed.setUuid("c1d2e3f4-0003-0003-0003-000000000001");
        save(seed);
    }

    @Override
    public Collection<ClientItem> findAll() {
        return storage.values();
    }

    @Override
    public ClientItem findById(Long id) {
        ClientItem item = storage.get(id);
        if (item == null) {
            throw new NoSuchElementException("cliente no encontrado: " + id);
        }
        return item;
    }

    @Override
    public ClientItem save(ClientItem item) {
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
    public ClientItem update(Long id, ClientItem changes) {
        ClientItem existing = findById(id);
        existing.setName(changes.getName());
        existing.setEmail(changes.getEmail());
        existing.setPhone(changes.getPhone());
        return existing;
    }

    @Override
    public void deleteById(Long id) {
        if (storage.remove(id) == null) {
            throw new NoSuchElementException("cliente no encontrado: " + id);
        }
    }
}
