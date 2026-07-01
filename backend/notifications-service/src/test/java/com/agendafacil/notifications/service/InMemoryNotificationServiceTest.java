package com.agendafacil.notifications.service;

import com.agendafacil.notifications.model.Notification;
import com.agendafacil.notifications.model.NotificationEntity;
import com.agendafacil.notifications.model.NotificationType;
import com.agendafacil.notifications.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class InMemoryNotificationServiceTest {

    private InMemoryNotificationService service;

    @BeforeEach
    public void setUp() {
        service = new InMemoryNotificationService();
    }

    @Test
    public void findAll_InitiallyEmpty() {
        Collection<Notification> all = service.findAll();
        assertTrue(all.isEmpty());
    }

    @Test
    public void notificationConstructor_SetsStatusPending() {
        Notification n = new Notification(null, "user@mail.com", "Asunto", "Mensaje", Notification.Channel.EMAIL);
        assertEquals(Notification.Status.PENDING, n.getStatus());
    }

    @Test
    public void notificationConstructor_AutoGeneratesCreatedAt() {
        Notification n = new Notification(null, "user@mail.com", "Asunto", "Mensaje", Notification.Channel.EMAIL);
        assertNotNull(n.getCreatedAt());
        assertTrue(n.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));
    }

    @Test
    public void supportEmailChannel() {
        Notification n = new Notification();
        n.setChannel(Notification.Channel.EMAIL);
        assertEquals(Notification.Channel.EMAIL, n.getChannel());
    }

    @Test
    public void supportSmsChannel() {
        Notification n = new Notification();
        n.setChannel(Notification.Channel.SMS);
        assertEquals(Notification.Channel.SMS, n.getChannel());
    }

    @Test
    public void create_assignsIncrementalId() {
        Notification n1 = new Notification(null, "user1@mail.com", "Asunto 1", "Mensaje 1", Notification.Channel.EMAIL);
        Notification n2 = new Notification(null, "user2@mail.com", "Asunto 2", "Mensaje 2", Notification.Channel.SMS);

        Notification saved1 = service.create(n1);
        Notification saved2 = service.create(n2);

        assertNotNull(saved1.getId());
        assertNotNull(saved2.getId());
        assertEquals(1L, saved1.getId());
        assertEquals(2L, saved2.getId());
    }

    @Test
    public void create_updatesStatusToSent() {
        Notification n = new Notification(null, "user@mail.com", "Asunto", "Mensaje", Notification.Channel.EMAIL);
        Notification saved = service.create(n);
        assertEquals(Notification.Status.SENT, saved.getStatus());
    }

    @Test
    public void inferTypeFromSubject_ReservaToNewBooking() {
        NotificationRepository mockRepo = mock(NotificationRepository.class);
        EmailService mockEmail = mock(EmailService.class);
        JpaNotificationService jpaService = new JpaNotificationService(mockRepo, mockEmail);

        when(mockRepo.save(any(NotificationEntity.class))).thenAnswer(inv -> {
            NotificationEntity entity = inv.getArgument(0);
            entity.setId(UUID.randomUUID());
            entity.setCreatedAt(java.time.OffsetDateTime.now());
            return entity;
        });

        Notification n = new Notification(null, "user@mail.com", "Confirmación de reserva de hora", "Mensaje", Notification.Channel.EMAIL);
        jpaService.create(n);

        ArgumentCaptor<NotificationEntity> captor = ArgumentCaptor.forClass(NotificationEntity.class);
        verify(mockRepo, times(1)).save(captor.capture());

        NotificationEntity savedEntity = captor.getValue();
        assertEquals(NotificationType.NEW_BOOKING, savedEntity.getType());
    }
}
