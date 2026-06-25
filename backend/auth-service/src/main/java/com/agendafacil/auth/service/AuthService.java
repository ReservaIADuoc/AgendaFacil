package com.agendafacil.auth.service;

import com.agendafacil.auth.model.User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * guarda usuarios y tokens en memoria (se pierden al reiniciar el contenedor).
 * el "token" es solo un uuid aleatorio guardado en un mapa, no es un jwt real.
 * sirve para probar el flujo completo; reemplazar por jwt + base de datos
 * cuando se necesite seguridad real.
 */
@Service
public class AuthService {

    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, String> tokens = new ConcurrentHashMap<>(); // token -> email
    private final AtomicLong sequence = new AtomicLong(0);

    public AuthService() {
        // usuario de ejemplo para poder probar el login sin registrarse antes
        usersByEmail.put("admin@agendafacil.com",
                new User(sequence.incrementAndGet(), "admin@agendafacil.com", "admin123", "Administrador"));
    }

    public User register(String email, String password, String name) {
        if (usersByEmail.containsKey(email)) {
            throw new IllegalStateException("el correo ya está registrado: " + email);
        }
        User user = new User(sequence.incrementAndGet(), email, password, name);
        usersByEmail.put(email, user);
        return user;
    }

    public String login(String email, String password) {
        User user = usersByEmail.get(email);
        if (user == null || !user.getPassword().equals(password)) {
            throw new IllegalArgumentException("credenciales inválidas");
        }
        String token = UUID.randomUUID().toString();
        tokens.put(token, email);
        return token;
    }

    public User findByToken(String token) {
        String email = tokens.get(token);
        if (email == null) {
            throw new IllegalArgumentException("token inválido o expirado");
        }
        return usersByEmail.get(email);
    }
}
