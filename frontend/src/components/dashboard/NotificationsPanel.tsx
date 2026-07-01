import { X, Calendar, UserX, UserCheck, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useAppointments } from "../../hooks/useAppointments";
import { useClients } from "../../hooks/useClients";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIMARY = "#C0987A";

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { showToast } = useToast();
  const { events } = useAppointments();
  const { clients } = useClients();

  const [notifications, setNotifications] = useState<Array<{ id: number; type: string; title: string; message: string; time: string; unread: boolean; icon: typeof Calendar }>>([
    {
      id: 0,
      type: "info",
      title: "Cargando notificaciones",
      message: "Estamos preparando tus avisos recientes...",
      time: "Ahora",
      unread: true,
      icon: Bell,
    },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const upcoming = [...events]
      .filter((event) => {
        const eventDateTime = new Date(`${event.date}T${event.time}:00`);
        return !Number.isNaN(eventDateTime.getTime()) && eventDateTime >= now && event.status !== "CANCELLED";
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}:00`).getTime() - new Date(`${b.date}T${b.time}:00`).getTime());

    const todayAppointments = events.filter((event) => event.date === today);
    const nextAppointment = upcoming[0];

    const builtNotifications: Array<{ id: number; type: string; title: string; message: string; time: string; unread: boolean; icon: typeof Calendar }> = [];

    if (nextAppointment) {
      builtNotifications.push({
        id: 1,
        type: "new_booking",
        title: "Próxima cita",
        message: `${nextAppointment.clientName} tiene cita el ${nextAppointment.date} a las ${nextAppointment.time}`,
        time: "Próxima",
        unread: true,
        icon: Calendar,
      });
    }

    if (todayAppointments.length > 0) {
      builtNotifications.push({
        id: 2,
        type: "reminder",
        title: "Recordatorio",
        message: `Tienes ${todayAppointments.length} citas programadas para hoy`,
        time: "Hoy",
        unread: true,
        icon: Bell,
      });
    }

    if (clients.length > 0) {
      builtNotifications.push({
        id: 3,
        type: "new_client",
        title: "Clientes registrados",
        message: `Tienes ${clients.length} clientes en tu cartera`,
        time: "Actualizado",
        unread: true,
        icon: UserCheck,
      });
    }

    if (builtNotifications.length === 0) {
      builtNotifications.push({
        id: 1,
        type: "info",
        title: "Sin actividad reciente",
        message: "Aún no hay citas ni clientes nuevos para mostrar.",
        time: "Ahora",
        unread: false,
        icon: Bell,
      });
    }

    setNotifications(builtNotifications);
  }, [isOpen, events, clients]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    window.dispatchEvent(new CustomEvent("notifications-read"));
    window.dispatchEvent(new CustomEvent("notifications-count", { detail: 0 }));
    showToast("Notificaciones marcadas como leídas", "success");
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, unread: false } : n);
      const remainingUnread = updated.filter(n => n.unread).length;
      if (remainingUnread === 0) {
        window.dispatchEvent(new CustomEvent("notifications-read"));
      }
      window.dispatchEvent(new CustomEvent("notifications-count", { detail: remainingUnread }));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("notifications-count", { detail: unreadCount }));
  }, [unreadCount]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div 
        className="fixed top-0 right-0 h-screen w-full max-w-sm bg-card shadow-2xl z-[70] border-l border-border flex flex-col animate-in slide-in-from-right duration-300 text-foreground" 
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Notificaciones</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount > 0 ? `Tienes ${unreadCount} mensajes sin leer` : "No tienes mensajes nuevos"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
          {notifications.map(notif => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.unread ? 'bg-muted/50 border-[#C0987A]/30' : 'bg-card border-border opacity-70 hover:opacity-100'}`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'cancellation' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-[#C0987A]'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-sm text-foreground">{notif.title}</h4>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-border shrink-0 bg-card">
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="w-full py-3 text-sm font-bold text-[#C0987A] bg-muted hover:bg-muted/80 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </>
  );
}
