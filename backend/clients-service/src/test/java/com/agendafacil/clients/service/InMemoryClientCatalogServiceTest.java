package com.agendafacil.clients.service;

import com.agendafacil.clients.model.ClientItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collection;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

public class InMemoryClientCatalogServiceTest {

    private InMemoryClientCatalogService service;

    @BeforeEach
    public void setUp() {
        service = new InMemoryClientCatalogService();
    }

    @Test
    public void seedDataPresent() {
        Collection<ClientItem> all = service.findAll();
        assertFalse(all.isEmpty());
        // Verify seed client exists
        ClientItem seed = all.iterator().next();
        assertEquals("Cliente de ejemplo", seed.getName());
        assertEquals("cliente@mail.com", seed.getEmail());
    }

    @Test
    public void save_generatesIdIfNull() {
        ClientItem item = new ClientItem(null, "Test Client", "test@test.com", "12345");
        ClientSaved(item);
    }

    private void ClientSaved(ClientItem item) {
        ClientItem saved = service.save(item);
        assertNotNull(saved.getId());
    }

    @Test
    public void save_generatesUuidIfNull() {
        ClientItem item = new ClientItem(null, "Test Client", "test@test.com", "12345");
        ClientItem saved = service.save(item);
        assertNotNull(saved.getUuid());
        assertFalse(saved.getUuid().isEmpty());
    }

    @Test
    public void save_keepsExistingUuid() {
        ClientItem item = new ClientItem(null, "Test Client", "test@test.com", "12345");
        item.setUuid("my-custom-uuid");
        ClientItem saved = service.save(item);
        assertEquals("my-custom-uuid", saved.getUuid());
    }

    @Test
    public void findById_existing() {
        ClientItem item = new ClientItem(null, "Test Client", "test@test.com", "12345");
        ClientItem saved = service.save(item);
        ClientItem found = service.findById(saved.getId());
        assertNotNull(found);
        assertEquals("Test Client", found.getName());
    }

    @Test
    public void findById_nonExistent_throwsException() {
        assertThrows(NoSuchElementException.class, () -> {
            service.findById(9999L);
        });
    }

    @Test
    public void update_modifiesFields() {
        ClientItem item = new ClientItem(null, "Test Client", "test@test.com", "12345");
        ClientItem saved = service.save(item);

        ClientItem changes = new ClientItem(null, "Updated Name", "updated@test.com", "54321");
        ClientItem updated = service.update(saved.getId(), changes);

        assertEquals("Updated Name", updated.getName());
        assertEquals("updated@test.com", updated.getEmail());
        assertEquals("54321", updated.getPhone());
    }

    @Test
    public void delete_nonExistent_throwsException() {
        assertThrows(NoSuchElementException.class, () -> {
            service.deleteById(9999L);
        });
    }
}
