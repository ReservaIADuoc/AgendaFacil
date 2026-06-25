package com.agendafacil.clients.service;

import com.agendafacil.clients.model.ClientItem;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/** repositorio en memoria, igual patrón que services-service. */
@Service
public class ClientCatalogService {

    private final Map<Long, ClientItem> storage = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(0);

    public ClientCatalogService() {
        save(new ClientItem(null, "Cliente de ejemplo", "cliente@mail.com", "+56900000000"));
    }

    public Collection<ClientItem> findAll() {
        return storage.values();
    }

    public ClientItem findById(Long id) {
        ClientItem item = storage.get(id);
        if (item == null) {
            throw new NoSuchElementException("cliente no encontrado: " + id);
        }
        return item;
    }

    public ClientItem save(ClientItem item) {
        if (item.getId() == null) {
            item.setId(sequence.incrementAndGet());
        }
        storage.put(item.getId(), item);
        return item;
    }

    public ClientItem update(Long id, ClientItem changes) {
        ClientItem existing = findById(id);
        existing.setName(changes.getName());
        existing.setEmail(changes.getEmail());
        existing.setPhone(changes.getPhone());
        return existing;
    }

    public void deleteById(Long id) {
        if (storage.remove(id) == null) {
            throw new NoSuchElementException("cliente no encontrado: " + id);
        }
    }
}
