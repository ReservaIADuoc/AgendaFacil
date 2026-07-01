package com.agendafacil.auth.service;

import com.agendafacil.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class InMemoryAuthServiceTest {

    private InMemoryAuthService authService;

    @BeforeEach
    public void setUp() {
        authService = new InMemoryAuthService();
    }

    @Test
    public void register_Success() {
        User user = authService.register("user@test.com", "pass123", "Juan Perez");
        assertNotNull(user);
        assertNotNull(user.getId());
        assertEquals("user@test.com", user.getEmail());
        assertEquals("pass123", user.getPassword());
        assertEquals("Juan Perez", user.getName());
        assertEquals("juanperez", user.getUsernameSlug());
    }

    @Test
    public void register_DuplicateEmail_ThrowsException() {
        authService.register("user@test.com", "pass123", "Juan Perez");
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            authService.register("user@test.com", "other", "Other Name");
        });
        assertTrue(exception.getMessage().contains("el correo ya está registrado"));
    }

    @Test
    public void login_Success() {
        authService.register("user@test.com", "pass123", "Juan Perez");
        String token = authService.login("user@test.com", "pass123");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    public void login_IncorrectPassword_ThrowsException() {
        authService.register("user@test.com", "pass123", "Juan Perez");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login("user@test.com", "wrongpass");
        });
        assertEquals("credenciales inválidas", exception.getMessage());
    }

    @Test
    public void login_NonExistentEmail_ThrowsException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login("nonexistent@test.com", "pass");
        });
        assertEquals("credenciales inválidas", exception.getMessage());
    }

    @Test
    public void findByToken_Success() {
        authService.register("user@test.com", "pass123", "Juan Perez");
        String token = authService.login("user@test.com", "pass123");
        User user = authService.findByToken(token);
        assertNotNull(user);
        assertEquals("user@test.com", user.getEmail());
    }

    @Test
    public void findByToken_InvalidToken_ThrowsException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.findByToken("invalid-token-123");
        });
        assertEquals("token inválido o expirado", exception.getMessage());
    }

    @Test
    public void updateProfileByToken_Success() {
        authService.register("user@test.com", "pass123", "Juan Perez");
        String token = authService.login("user@test.com", "pass123");
        User updated = authService.updateProfileByToken(token, "Juan Perez Editado", "http://avatar.com/juan.png");
        assertNotNull(updated);
        assertEquals("Juan Perez Editado", updated.getName());
        assertEquals("juanperezeditado", updated.getUsernameSlug());
        assertEquals("http://avatar.com/juan.png", updated.getAvatarUrl());
    }
}
