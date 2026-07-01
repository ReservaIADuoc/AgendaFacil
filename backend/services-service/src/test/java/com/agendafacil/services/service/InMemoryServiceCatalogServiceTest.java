package com.agendafacil.services.service;

import com.agendafacil.services.model.ServiceItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

public class InMemoryServiceCatalogServiceTest {

    private InMemoryServiceCatalogService service;

    @BeforeEach
    public void setUp() {
        service = new InMemoryServiceCatalogService();
    }

    @Test
    public void validateSeedServices() {
        Collection<ServiceItem> all = service.findAll();
        assertEquals(3, all.size());

        boolean hasConsulta = all.stream().anyMatch(s -> s.getName().equals("Consulta General"));
        boolean hasTerapia = all.stream().anyMatch(s -> s.getName().equals("Terapia de Pareja"));
        boolean hasEvaluacion = all.stream().anyMatch(s -> s.getName().equals("Evaluación Inicial"));

        assertTrue(hasConsulta);
        assertTrue(hasTerapia);
        assertTrue(hasEvaluacion);
    }

    @Test
    public void save_newService() {
        ServiceItem s = new ServiceItem(null, "Terapia Online", "Sesion virtual", new BigDecimal("35000"), 50);
        ServiceItem saved = service.save(s);
        assertNotNull(saved);
        assertEquals("Terapia Online", saved.getName());
    }

    @Test
    public void save_assignsId() {
        ServiceItem s = new ServiceItem(null, "Terapia Online", "Sesion virtual", new BigDecimal("35000"), 50);
        ServiceItem saved = service.save(s);
        assertNotNull(saved.getId());
    }

    @Test
    public void save_assignsUuid() {
        ServiceItem s = new ServiceItem(null, "Terapia Online", "Sesion virtual", new BigDecimal("35000"), 50);
        ServiceItem saved = service.save(s);
        assertNotNull(saved.getUuid());
        assertFalse(saved.getUuid().isEmpty());
    }

    @Test
    public void findById_existing() {
        ServiceItem s = new ServiceItem(null, "Terapia Online", "Sesion virtual", new BigDecimal("35000"), 50);
        ServiceItem saved = service.save(s);
        ServiceItem found = service.findById(saved.getId());
        assertNotNull(found);
        assertEquals("Terapia Online", found.getName());
    }

    @Test
    public void findById_nonExistent_throwsException() {
        assertThrows(NoSuchElementException.class, () -> {
            service.findById(9999L);
        });
    }

    @Test
    public void update_modifiesFields() {
        ServiceItem s = new ServiceItem(null, "Terapia Online", "Sesion virtual", new BigDecimal("35000"), 50);
        ServiceItem saved = service.save(s);

        ServiceItem changes = new ServiceItem(null, "Terapia Presencial", "Sesion en persona", new BigDecimal("45000"), 60);
        ServiceItem updated = service.update(saved.getId(), changes);

        assertEquals("Terapia Presencial", updated.getName());
        assertEquals("Sesion en persona", updated.getDescription());
        assertEquals(new BigDecimal("45000"), updated.getPrice());
        assertEquals(60, updated.getDurationMinutes());
    }

    @Test
    public void delete_nonExistent_throwsException() {
        assertThrows(NoSuchElementException.class, () -> {
            service.deleteById(9999L);
        });
    }
}
