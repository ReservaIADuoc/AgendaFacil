package com.agendafacil.services.service;

import com.agendafacil.services.model.ServiceItem;
import com.agendafacil.services.model.ServiceEntity;
import com.agendafacil.services.model.ServiceModality;
import com.agendafacil.services.repository.ServiceRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "agendafacil.db.enabled", havingValue = "true")
public class JpaServiceCatalogService implements ServiceCatalogService {

    private final ServiceRepository repo;

    private static final Map<Long, UUID> longToUuid = new ConcurrentHashMap<>();

    public JpaServiceCatalogService(ServiceRepository repo) {
        this.repo = repo;
        
        // Seed initial services if empty
        try {
            if (repo.count() == 0) {
                ServiceEntity s1 = new ServiceEntity();
                s1.setId(UUID.fromString("b1c2d3e4-0002-0002-0002-000000000001")); // seeded ID in schema.sql
                s1.setName("Corte de pelo");
                s1.setDescription("Corte clásico");
                s1.setPrice(new BigDecimal("8000"));
                s1.setDurationMinutes(30);
                s1.setModality(ServiceModality.VIDEO);
                repo.save(s1);

                ServiceEntity s2 = new ServiceEntity();
                s2.setId(UUID.fromString("b1c2d3e4-0002-0002-0002-000000000002")); // seeded ID in schema.sql
                s2.setName("Manicure");
                s2.setDescription("Manicure tradicional");
                s2.setPrice(new BigDecimal("6000"));
                s2.setDurationMinutes(45);
                s2.setModality(ServiceModality.PRESENCIAL);
                repo.save(s2);
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
    public Collection<ServiceItem> findAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public Collection<ServiceItem> findAllByProfessionalEmail(String email) {
        UUID profId = repo.findProfessionalIdByEmail(email).orElse(null);
        if (profId != null) {
            return repo.findByProfessionalId(profId).stream().map(this::toDto).collect(Collectors.toList());
        }
        return java.util.Collections.emptyList();
    }

    @Override
    public ServiceItem findById(Long id) {
        UUID uuid = getUuid(id);
        if (uuid == null) {
            throw new NoSuchElementException("Servicio no encontrado: " + id);
        }
        ServiceEntity entity = repo.findById(uuid)
                .orElseThrow(() -> new NoSuchElementException("Servicio no encontrado: " + id));
        return toDto(entity);
    }

    @Override
    public ServiceItem save(ServiceItem item) {
        ServiceEntity entity = new ServiceEntity();
        if (item.getId() != null) {
            UUID uuid = getUuid(item.getId());
            if (uuid != null) entity.setId(uuid);
        }
        entity.setName(item.getName());
        entity.setDescription(item.getDescription());
        entity.setPrice(item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO);
        entity.setDurationMinutes(item.getDurationMinutes());
        entity.setIsActive(item.getActive() != null ? item.getActive() : true);
        if (item.getModality() != null) {
            try {
                entity.setModality(ServiceModality.valueOf(item.getModality().toUpperCase()));
            } catch (IllegalArgumentException e) {
                entity.setModality(ServiceModality.PRESENCIAL);
            }
        }

        ServiceEntity saved = repo.save(entity);
        return toDto(saved);
    }

    public ServiceItem saveByProfessionalEmail(ServiceItem item, String email) {
        UUID profId = repo.findProfessionalIdByEmail(email).orElse(null);
        ServiceEntity entity = new ServiceEntity();
        if (item.getId() != null) {
            UUID uuid = getUuid(item.getId());
            if (uuid != null) entity.setId(uuid);
        }
        if (profId != null) {
            entity.setProfessionalId(profId);
        }
        entity.setName(item.getName());
        entity.setDescription(item.getDescription());
        entity.setPrice(item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO);
        entity.setDurationMinutes(item.getDurationMinutes());
        entity.setIsActive(item.getActive() != null ? item.getActive() : true);
        if (item.getModality() != null) {
            try {
                entity.setModality(ServiceModality.valueOf(item.getModality().toUpperCase()));
            } catch (IllegalArgumentException e) {
                entity.setModality(ServiceModality.PRESENCIAL);
            }
        }

        ServiceEntity saved = repo.save(entity);
        return toDto(saved);
    }

    @Override
    public ServiceItem update(Long id, ServiceItem changes) {
        UUID uuid = getUuid(id);
        if (uuid == null) {
            throw new NoSuchElementException("Servicio no encontrado: " + id);
        }
        ServiceEntity existing = repo.findById(uuid)
                .orElseThrow(() -> new NoSuchElementException("Servicio no encontrado: " + id));
        existing.setName(changes.getName());
        existing.setDescription(changes.getDescription());
        existing.setPrice(changes.getPrice() != null ? changes.getPrice() : BigDecimal.ZERO);
        existing.setDurationMinutes(changes.getDurationMinutes());
        if (changes.getActive() != null) {
            existing.setIsActive(changes.getActive());
        }
        if (changes.getModality() != null) {
            try {
                existing.setModality(ServiceModality.valueOf(changes.getModality().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid
            }
        }

        ServiceEntity saved = repo.save(existing);
        return toDto(saved);
    }

    @Override
    public void deleteById(Long id) {
        UUID uuid = getUuid(id);
        if (uuid == null || !repo.existsById(uuid)) {
            throw new NoSuchElementException("Servicio no encontrado: " + id);
        }
        repo.deleteById(uuid);
    }

    private ServiceItem toDto(ServiceEntity entity) {
        ServiceItem dto = new ServiceItem();
        dto.setId(registerUuid(entity.getId()));
        dto.setUuid(entity.getId().toString());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setDurationMinutes(entity.getDurationMinutes());
        dto.setActive(entity.getIsActive());
        dto.setModality(entity.getModality() != null ? entity.getModality().name().toLowerCase() : "presencial");
        return dto;
    }
}
