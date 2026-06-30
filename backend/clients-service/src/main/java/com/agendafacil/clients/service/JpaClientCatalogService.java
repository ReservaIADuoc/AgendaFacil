package com.agendafacil.clients.service;

import com.agendafacil.clients.model.ClientItem;
import com.agendafacil.clients.model.ClientEntity;
import com.agendafacil.clients.repository.ClientRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "agendafacil.db.enabled", havingValue = "true")
public class JpaClientCatalogService implements ClientCatalogService {

    private final ClientRepository repo;

    private static final Map<Long, UUID> longToUuid = new ConcurrentHashMap<>();

    public JpaClientCatalogService(ClientRepository repo) {
        this.repo = repo;
        
        // Seed initial client if database is empty
        try {
            if (repo.count() == 0) {
                ClientEntity initial = new ClientEntity();
                initial.setId(UUID.fromString("c1d2e3f4-0003-0003-0003-000000000001")); // seeded ID in schema.sql
                initial.setFirstName("Cliente de ejemplo");
                initial.setEmail("cliente@mail.com");
                initial.setPhone("+56900000000");
                repo.save(initial);
            }
        } catch (Exception ignored) {}
    }

    public static UUID getUuid(Long id) {
        return id == null ? null : longToUuid.get(id);
    }

    public static Long registerUuid(UUID uuid) {
        if (uuid == null) return null;
        long key = Math.abs(uuid.getMostSignificantBits() ^ uuid.getLeastSignificantBits());
        longToUuid.put(key, uuid);
        return key;
    }

    @Override
    public Collection<ClientItem> findAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public Collection<ClientItem> findAllByProfessionalEmail(String email) {
        UUID profId = repo.findProfessionalIdByEmail(email).orElse(null);
        if (profId != null) {
            return repo.findByProfessionalId(profId).stream().map(this::toDto).collect(Collectors.toList());
        }
        return java.util.Collections.emptyList();
    }

    @Override
    public ClientItem findById(Long id) {
        UUID uuid = getUuid(id);
        if (uuid == null) {
            throw new NoSuchElementException("cliente no encontrado: " + id);
        }
        ClientEntity entity = repo.findById(uuid)
                .orElseThrow(() -> new NoSuchElementException("cliente no encontrado: " + id));
        return toDto(entity);
    }

    @Override
    public ClientItem save(ClientItem item) {
        ClientEntity entity = new ClientEntity();
        if (item.getId() != null) {
            UUID uuid = getUuid(item.getId());
            if (uuid != null) entity.setId(uuid);
        }
        String[] parts = item.getName().split(" ", 2);
        entity.setFirstName(parts[0]);
        entity.setLastName(parts.length > 1 ? parts[1] : "");
        entity.setEmail(item.getEmail());
        entity.setPhone(item.getPhone());

        ClientEntity saved = repo.save(entity);
        return toDto(saved);
    }

    public ClientItem saveByProfessionalEmail(ClientItem item, String email) {
        UUID profId = repo.findProfessionalIdByEmail(email).orElse(null);
        ClientEntity entity = new ClientEntity();
        if (item.getId() != null) {
            UUID uuid = getUuid(item.getId());
            if (uuid != null) entity.setId(uuid);
        }
        if (profId != null) {
            entity.setProfessionalId(profId);
        }
        String[] parts = item.getName().split(" ", 2);
        entity.setFirstName(parts[0]);
        entity.setLastName(parts.length > 1 ? parts[1] : "");
        entity.setEmail(item.getEmail());
        entity.setPhone(item.getPhone());

        ClientEntity saved = repo.save(entity);
        return toDto(saved);
    }

    @Override
    public ClientItem update(Long id, ClientItem changes) {
        UUID uuid = getUuid(id);
        if (uuid == null) {
            throw new NoSuchElementException("cliente no encontrado: " + id);
        }
        ClientEntity existing = repo.findById(uuid)
                .orElseThrow(() -> new NoSuchElementException("cliente no encontrado: " + id));
        
        String[] parts = changes.getName().split(" ", 2);
        existing.setFirstName(parts[0]);
        existing.setLastName(parts.length > 1 ? parts[1] : "");
        existing.setEmail(changes.getEmail());
        existing.setPhone(changes.getPhone());

        ClientEntity saved = repo.save(existing);
        return toDto(saved);
    }

    @Override
    public void deleteById(Long id) {
        UUID uuid = getUuid(id);
        if (uuid == null || !repo.existsById(uuid)) {
            throw new NoSuchElementException("cliente no encontrado: " + id);
        }
        repo.deleteById(uuid);
    }

    private ClientItem toDto(ClientEntity entity) {
        ClientItem dto = new ClientItem();
        dto.setId(registerUuid(entity.getId()));
        dto.setUuid(entity.getId().toString());
        dto.setName(entity.getFirstName() + (entity.getLastName().isEmpty() ? "" : " " + entity.getLastName()));
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        return dto;
    }

    /**
     * Returns the professional_id for a given client UUID.
     * Used by ClinicalNoteController and AttachmentController.
     */
    public UUID getProfessionalIdByClientUuid(UUID clientId) {
        return repo.findById(clientId)
                .map(ClientEntity::getProfessionalId)
                .orElse(UUID.fromString("a1b2c3d4-0001-0001-0001-000000000001"));
    }
}

