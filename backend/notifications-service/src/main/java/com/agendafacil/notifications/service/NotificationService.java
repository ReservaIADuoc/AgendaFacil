package com.agendafacil.notifications.service;

import com.agendafacil.notifications.model.Notification;
import java.util.Collection;

public interface NotificationService {
    Collection<Notification> findAll();
    Notification findById(Long id);
    Notification create(Notification notification);
}
