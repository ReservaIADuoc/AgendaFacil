import { X, Calendar, UserX, UserCheck, Bell } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../contexts/ToastContext";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIMARY = "#C0987A";

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { showToast } = useToast();
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'new_booking', title: 'Nueva Reserva', message: 'Carlos López ha agendado "Terapia de Pareja"', time: 'Hace 5 min', unread: true, icon: Calendar },
    { id: 2, type: 'cancellation', title: 'Cita Cancelada', message: 'Ana Silva canceló su cita de mañana', time: 'Hace 2 horas', unread: true, icon: UserX },
    { id: 3, type: 'reminder', title: 'Recordatorio', message: 'Tienes 4 citas programadas para hoy', time: 'Hace 5 horas', unread: false, icon: Bell },
    { id: 4, type: 'new_client', title: 'Nuevo Cliente', message: 'María García se ha registrado en tu portal', time: 'Ayer', unread: false, icon: UserCheck },
  ]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    // Emit global event to clear red dot in Navbar
    window.dispatchEvent(new CustomEvent("notifications-read"));
    showToast("Notificaciones marcadas como leídas", "success");
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    // If no more unread notifications, clear navbar dot too
    const remainingUnread = notifications.filter(n => n.id !== id && n.unread).length;
    if (remainingUnread === 0) {
      window.dispatchEvent(new CustomEvent("notifications-read"));
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
