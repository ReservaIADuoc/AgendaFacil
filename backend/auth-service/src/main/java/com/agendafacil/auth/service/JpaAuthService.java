package com.agendafacil.auth.service;

import com.agendafacil.auth.model.User;
import com.agendafacil.auth.model.UserEntity;
import com.agendafacil.auth.repository.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de autenticación conectado a la base de datos PostgreSQL con BCrypt y JWT.
 * Habilitado cuando agendafacil.db.enabled=true.
 */
@Service
@ConditionalOnProperty(name = "agendafacil.db.enabled", havingValue = "true")
public class JpaAuthService implements AuthService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    private static final String SECRET = "agendafacil_super_secret_key_123456789";
    private final Algorithm algorithm = Algorithm.HMAC256(SECRET);

    // Mapeo bidireccional Long <-> UUID para compatibilidad con DTOs originales
    private static final Map<Long, UUID> longToUuid = new ConcurrentHashMap<>();

    public JpaAuthService(UserRepository repo) {
        this.repo = repo;
        
        // Crear usuario administrador inicial en la BD si no existe
        try {
            if (repo.findByEmail("admin@agendafacil.com").isEmpty()) {
                UserEntity admin = new UserEntity();
                admin.setId(UUID.fromString("a1b2c3d4-0001-0001-0001-000000000099")); // Use a distinct UUID for admin
                admin.setFirstName("Administrador");
                admin.setLastName("Sistema");
                admin.setEmail("admin@agendafacil.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123")); // BCrypt
                admin.setUsernameSlug("admin-sistema");
                repo.save(admin);
                try {
                    repo.seedDefaultSchedules(admin.getId());
                    repo.seedDefaultServices(admin.getId());
                } catch (Exception e) {
                    System.err.println("Error seeding admin configurations: " + e.getMessage());
                }
            }
        } catch (Exception ignored) {
            // Ignorar errores durante el inicio por si la BD no está lista aún
        }
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
    public User register(String email, String password, String name) {
        if (repo.findByEmail(email).isPresent()) {
            throw new IllegalStateException("el correo ya está registrado: " + email);
        }
        UserEntity entity = new UserEntity();
        entity.setEmail(email);
        entity.setPasswordHash(passwordEncoder.encode(password)); // BCrypt
        
        String[] parts = name.split(" ", 2);
        entity.setFirstName(parts[0]);
        entity.setLastName(parts.length > 1 ? parts[1] : "");

        UserEntity saved = repo.save(entity);
        try {
            repo.seedDefaultSchedules(saved.getId());
            repo.seedDefaultServices(saved.getId());
        } catch (Exception e) {
            System.err.println("Error seeding default configurations: " + e.getMessage());
        }
        return toDto(saved);
    }

    @Override
    public String login(String email, String password) {
        UserEntity entity = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("credenciales inválidas"));
        if (!passwordEncoder.matches(password, entity.getPasswordHash())) {
            throw new IllegalArgumentException("credenciales inválidas");
        }
        
        // Generar JWT real y firmado
        return JWT.create()
                .withSubject(email)
                .withIssuer("auth-service")
                .sign(algorithm);
    }

    @Override
    public User findByToken(String token) {
        try {
            String email = JWT.require(algorithm)
                    .withIssuer("auth-service")
                    .build()
                    .verify(token)
                    .getSubject();
                    
            UserEntity entity = repo.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("usuario no encontrado"));
            return toDto(entity);
        } catch (Exception e) {
            throw new IllegalArgumentException("token inválido o expirado");
        }
    }

    private User toDto(UserEntity entity) {
        User dto = new User();
        dto.setId(registerUuid(entity.getId()));
        dto.setEmail(entity.getEmail());
        dto.setPassword("[PROTECTED]"); // don't return hashed password
        dto.setName(entity.getFirstName() + (entity.getLastName().isEmpty() ? "" : " " + entity.getLastName()));
        dto.setUsernameSlug(entity.getUsernameSlug());
        dto.setAvatarUrl(entity.getAvatarKey());
        return dto;
    }

    @Override
    public User updateProfileByToken(String token, String name, String avatarUrl) {
        try {
            String email = JWT.require(algorithm)
                    .withIssuer("auth-service")
                    .build()
                    .verify(token)
                    .getSubject();
                    
            UserEntity entity = repo.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("usuario no encontrado"));
            
            if (name != null && !name.trim().isEmpty()) {
                String[] parts = name.trim().split("\\s+", 2);
                entity.setFirstName(parts[0]);
                entity.setLastName(parts.length > 1 ? parts[1] : "");
                
                // Re-generate slug
                String seed = entity.getFirstName() + "-" + entity.getLastName();
                entity.setUsernameSlug(seed.toLowerCase().replaceAll("[^a-z0-9-]", ""));
            }
            
            if (avatarUrl != null) {
                entity.setAvatarKey(avatarUrl);
            }
            
            UserEntity saved = repo.save(entity);
            return toDto(saved);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al actualizar perfil: " + e.getMessage());
        }
    }
}
