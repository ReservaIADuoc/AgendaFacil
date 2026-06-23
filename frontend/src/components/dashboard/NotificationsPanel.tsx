import { X, Calendar, UserX, UserCheck, Bell } from "lucide-react";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  if (!isOpen) return null;

  const notifications = [
    { id: 1, type: 'new_booking', title: 'Nueva Reserva', message: 'Carlos López ha agendado "Terapia de Pareja"', time: 'Hace 5 min', unread: true, icon: Calendar },
    { id: 2, type: 'cancellation', title: 'Cita Cancelada', message: 'Ana Silva canceló su cita de mañana', time: 'Hace 2 horas', unread: true, icon: UserX },
    { id: 3, type: 'reminder', title: 'Recordatorio', message: 'Tienes 4 citas programadas para hoy', time: 'Hace 5 horas', unread: false, icon: Bell },
    { id: 4, type: 'new_client', title: 'Nuevo Cliente', message: 'María García se ha registrado en tu portal', time: 'Ayer', unread: false, icon: UserCheck },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="fixed top-0 right-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[70] border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>Notificaciones</h2>
            <p className="text-xs text-gray-500 mt-1">Tienes 2 mensajes sin leer</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map(notif => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.unread ? 'bg-[#FCFBF8] border-[#C0987A]/30' : 'bg-white border-gray-100 opacity-70 hover:opacity-100'}`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'cancellation' ? 'bg-red-50 text-red-500' : 'bg-[#F3EFE9] text-[#C0987A]'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-sm text-[#2C2A29]">{notif.title}</h4>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-xs text-[#7E7870] leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button className="w-full py-3 text-sm font-bold text-[#C0987A] bg-[#F3EFE9] rounded-xl hover:bg-[#EAE5DF] transition-colors">
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </>
  );
}
