package com.agendafacil.notifications.repository;

import com.agendafacil.notifications.model.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
}
