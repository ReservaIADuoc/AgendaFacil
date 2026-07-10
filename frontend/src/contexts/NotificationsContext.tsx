import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type NotificationType = 'new_booking' | 'cancellation' | 'reminder' | 'new_client';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  timestamp: number;
}

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'unread' | 'timestamp'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('agendafacil_notifications');
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing notifications", e);
        }
      } else {
        // Initial mock notifications just for visual sake if empty
        const initialMock: NotificationItem[] = [
          { id: 1, type: 'reminder', title: 'Recordatorio', message: 'Bienvenido a Agenda Fácil', time: 'Justo ahora', unread: false, timestamp: Date.now() - 100000 },
        ];
        setNotifications(initialMock);
        localStorage.setItem('agendafacil_notifications', JSON.stringify(initialMock));
      }
    };
    loadNotifications();

    // Sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agendafacil_notifications' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
    };
    
    // Listen for custom events within the same tab
    const handleCustomSync = () => loadNotifications();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('notifications-updated', handleCustomSync);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('notifications-updated', handleCustomSync);
    };
  }, []);

  const addNotification = useCallback((notif: Omit<NotificationItem, 'id' | 'unread' | 'timestamp'>) => {
    const stored = localStorage.getItem('agendafacil_notifications');
    let current: NotificationItem[] = [];
    if (stored) {
      try { current = JSON.parse(stored); } catch (e) {}
    }
    
    const newNotif: NotificationItem = {
      ...notif,
      id: Date.now() + Math.floor(Math.random() * 1000),
      unread: true,
      timestamp: Date.now()
    };
    
    const updated = [newNotif, ...current].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    localStorage.setItem('agendafacil_notifications', JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new CustomEvent('notifications-updated')); // Trigger cross-component sync
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, unread: false } : n);
      localStorage.setItem('agendafacil_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      localStorage.setItem('agendafacil_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
