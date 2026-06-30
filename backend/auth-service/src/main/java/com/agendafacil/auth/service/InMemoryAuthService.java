package com.agendafacil.auth.service;

import com.agendafacil.auth.model.User;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Guarda usuarios y tokens en memoria (se pierden al reiniciar el contenedor).
 * Habilitado cuando agendafacil.db.enabled=false o no está configurado.
 */
@Service
@ConditionalOnProperty(name = "agendafacil.db.enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryAuthService implements AuthService {

    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, String> tokens = new ConcurrentHashMap<>(); // token -> email
    private final AtomicLong sequence = new AtomicLong(0);

    public InMemoryAuthService() {
        // usuario de ejemplo para poder probar el login sin registrarse antes
        usersByEmail.put("admin@agendafacil.com",
                new User(sequence.incrementAndGet(), "admin@agendafacil.com", "admin123", "Administrador"));
    }

    @Override
    public User register(String email, String password, String name) {
        if (usersByEmail.containsKey(email)) {
            throw new IllegalStateException("el correo ya está registrado: " + email);
        }
        User user = new User(sequence.incrementAndGet(), email, password, name);
        usersByEmail.put(email, user);
        return user;
    }

    @Override
    public String login(String email, String password) {
        User user = usersByEmail.get(email);
        if (user == null || !user.getPassword().equals(password)) {
            throw new IllegalArgumentException("credenciales inválidas");
        }
        String token = UUID.randomUUID().toString();
        tokens.put(token, email);
        return token;
    }

    @Override
    public User findByToken(String token) {
        String email = tokens.get(token);
        if (email == null) {
            throw new IllegalArgumentException("token inválido o expirado");
        }
        return usersByEmail.get(email);
    }

    @Override
    public User updateProfileByToken(String token, String name, String avatarUrl) {
        String email = tokens.get(token);
        if (email == null) {
            throw new IllegalArgumentException("token inválido o expirado");
        }
        User user = usersByEmail.get(email);
        if (user != null) {
            if (name != null && !name.trim().isEmpty()) {
                user.setName(name);
                String seed = name.toLowerCase().trim().replaceAll("[^a-z0-9-]", "");
                user.setUsernameSlug(seed);
            }
            if (avatarUrl != null) {
                user.setAvatarUrl(avatarUrl);
            }
        }
        return user;
    }
}
