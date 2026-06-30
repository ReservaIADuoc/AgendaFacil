package com.agendafacil.notifications.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Servicio de envío de correo real (SMTP).
 * Se activa cuando agendafacil.notifications.provider=SMTP.
 * Si JavaMailSender no está configurado con credenciales válidas,
 * el envío fallará silenciosamente con un log de error.
 */
@Component
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${agendafacil.notifications.from:noreply@agendafacil.cl}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envía un correo electrónico real.
     *
     * @param to      Destinatario (ej: cliente que reservó)
     * @param subject Asunto del correo
     * @param body    Cuerpo en texto plano
     */
    public void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("✉️  Correo enviado exitosamente a {} | Asunto: {}", to, subject);
        } catch (Exception ex) {
            log.error("❌ Error al enviar correo a {} | Asunto: {} | Error: {}", to, subject, ex.getMessage());
        }
    }
}
