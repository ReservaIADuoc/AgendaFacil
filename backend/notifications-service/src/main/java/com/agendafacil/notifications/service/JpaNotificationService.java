package com.agendafacil.notifications.service;

import com.agendafacil.notifications.model.Notification;
import com.agendafacil.notifications.model.NotificationEntity;
import com.agendafacil.notifications.model.NotificationType;
import com.agendafacil.notifications.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "agendafacil.db.enabled", havingValue = "true")
public class JpaNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(JpaNotificationService.class);

    private final NotificationRepository repo;
    private final EmailService emailService;

    private static final Map<Long, UUID> longToUuid = new ConcurrentHashMap<>();

    public JpaNotificationService(NotificationRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
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
    public Collection<Notification> findAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public Notification findById(Long id) {
        UUID uuid = getUuid(id);
        if (uuid == null) {
            throw new NoSuchElementException("Notificación no encontrada: " + id);
        }
        NotificationEntity entity = repo.findById(uuid)
                .orElseThrow(() -> new NoSuchElementException("Notificación no encontrada: " + id));
        return toDto(entity);
    }

    @Override
    public Notification create(Notification notification) {
        NotificationEntity entity = new NotificationEntity();
        entity.setTitle(notification.getSubject() != null ? notification.getSubject() : "Notificación");
        entity.setMessage(notification.getMessage() != null ? notification.getMessage() : "");
        
        // Determinar tipo basado en asunto
        String sub = entity.getTitle().toLowerCase();
        if (sub.contains("reserva") || sub.contains("booking") || sub.contains("agend")) {
            entity.setType(NotificationType.NEW_BOOKING);
        } else if (sub.contains("cancel")) {
            entity.setType(NotificationType.CANCELLATION);
        } else if (sub.contains("cliente")) {
            entity.setType(NotificationType.NEW_CLIENT);
        } else if (sub.contains("pago")) {
            entity.setType(NotificationType.PAYMENT_RECEIVED);
        } else {
            entity.setType(NotificationType.REMINDER);
        }

        NotificationEntity saved = repo.save(entity);
        
        // Simular envío
        send(notification);
        
        notification.setId(registerUuid(saved.getId()));
        notification.setCreatedAt(saved.getCreatedAt().toLocalDateTime());
        return notification;
    }

    @org.springframework.beans.factory.annotation.Value("${agendafacil.notifications.provider:LOG}")
    private String provider;

    private void send(Notification notification) {
        if ("SMTP".equalsIgnoreCase(provider)) {
            log.info("ENVIANDO CORREO REAL (SMTP) a {} - Asunto: {}", notification.getRecipient(), notification.getSubject());
            emailService.send(
                notification.getRecipient(),
                notification.getSubject(),
                notification.getMessage()
            );
            notification.setStatus(Notification.Status.SENT);
        } else {
            try {
                log.info("Enviando notificación simulada [{}] a {} por {}: {}",
                        notification.getId(), notification.getRecipient(),
                        notification.getChannel(), notification.getSubject());
                notification.setStatus(Notification.Status.SENT);
            } catch (Exception ex) {
                notification.setStatus(Notification.Status.FAILED);
                log.error("Error enviando notificación", ex);
            }
        }
    }

    private Notification toDto(NotificationEntity entity) {
        Notification dto = new Notification();
        dto.setId(registerUuid(entity.getId()));
        dto.setRecipient("profesional@agendafacil.com");
        dto.setSubject(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setChannel(Notification.Channel.EMAIL);
        dto.setStatus(entity.getIsRead() ? Notification.Status.SENT : Notification.Status.PENDING);
        dto.setCreatedAt(entity.getCreatedAt().toLocalDateTime());
        return dto;
    }
}
