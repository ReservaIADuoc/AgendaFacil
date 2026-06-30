package com.agendafacil.notifications.model;

import java.time.LocalDateTime;

/**
 * Representa una notificación enviada a un cliente (ej: recordatorio de cita).
 * El envío real (correo/SMS) se simula por ahora con un log; cuando se integre
 * un proveedor real (SMTP, Twilio, etc.) eso se hace dentro de NotificationService,
 * sin tener que tocar el controller.
 */
public class Notification {

    public enum Channel {
        EMAIL, SMS
    }

    public enum Status {
        PENDING, SENT, FAILED
    }

    private Long id;
    private String recipient;
    private String subject;
    private String message;
    private Channel channel;
    private Status status;
    private LocalDateTime createdAt;

    public Notification() {
    }

    public Notification(Long id, String recipient, String subject, String message, Channel channel) {
        this.id = id;
        this.recipient = recipient;
        this.subject = subject;
        this.message = message;
        this.channel = channel;
        this.status = Status.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Channel getChannel() {
        return channel;
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
