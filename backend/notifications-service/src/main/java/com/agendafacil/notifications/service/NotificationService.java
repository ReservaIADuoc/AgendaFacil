package com.agendafacil.notifications.service;

import com.agendafacil.notifications.model.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Guarda las notificaciones en memoria y simula el envío real.
 * Cuando se conecte un proveedor real de correo/SMS, el método send()
 * es el único lugar que hay que modificar.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final Map<Long, Notification> storage = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(0);

    public Collection<Notification> findAll() {
        return storage.values();
    }

    public Notification findById(Long id) {
        Notification notification = storage.get(id);
        if (notification == null) {
            throw new NoSuchElementException("Notificación no encontrada: " + id);
        }
        return notification;
    }

    public Notification create(Notification notification) {
        notification.setId(sequence.incrementAndGet());
        storage.put(notification.getId(), notification);
        send(notification);
        return notification;
    }

    /**
     * Simula el envío (log) y marca el estado. Reemplazar este cuerpo por la
     * integración real (SMTP, Twilio, etc.) sin tocar el resto de la clase.
     */
    private void send(Notification notification) {
        try {
            log.info("Enviando notificación [{}] a {} por {}: {}",
                    notification.getId(), notification.getRecipient(),
                    notification.getChannel(), notification.getSubject());
            notification.setStatus(Notification.Status.SENT);
        } catch (Exception ex) {
            notification.setStatus(Notification.Status.FAILED);
            log.error("Error enviando notificación {}", notification.getId(), ex);
        }
    }
}
