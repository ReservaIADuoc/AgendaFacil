import { X, Calendar, Clock, User, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import type { AppointmentEvent } from "../../hooks/useAppointments";



interface AppointmentDetailModalProps {
  event: AppointmentEvent | null;
  onClose: () => void;
  onUpdate: (id: string, updatedFields: Partial<AppointmentEvent>) => void;
  onDelete: (id: string) => void;
}

export default function AppointmentDetailModal({
  event,
  onClose,
  onUpdate,
  onDelete,
}: AppointmentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("CONFIRMED");

  useEffect(() => {
    if (event) {
      setDate(event.date);
      setTime(event.time);
      setStatus(event.status || "CONFIRMED");
      setIsEditing(false);
    }
  }, [event]);

  if (!event) return null;

  const [hourStr, minStr] = event.time.split(":");
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  const endTime = format(new Date(2000, 0, 1, hour, min + event.duration * 60), "HH:mm");
  const eventDate = new Date(event.date + "T12:00:00");

  const handleSave = () => {
    onUpdate(event.id, {
      date,
      time,
      status,
    });
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta cita permanentemente?")) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4">
      <div className="bg-card/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-md shadow-2xl shadow-primary/10 overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300 text-foreground">
        
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-border flex items-center justify-between"
          style={{ background: event.serviceColor ? `${event.serviceColor}18` : undefined }}
        >
          <div>
            <h2 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
              {isEditing ? "Editar Cita" : "Detalle de Cita"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{event.service}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Client summary */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: event.serviceColor || "var(--theme-primary, #C0987A)" }}
            >
              {event.clientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                {event.clientName}
              </p>
              {!isEditing && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                  {event.status === "CONFIRMED" ? "Confirmada" : event.status === "PENDING" ? "Pendiente" : "Cancelada"}
                </span>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {/* Date & Time fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Hora</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Status field */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary" /> Fecha
                </p>
                <p className="text-xs font-semibold text-foreground capitalize">
                  {format(eventDate, "EEE d MMM yyyy", { locale: es })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" /> Horario
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {event.time} – {endTime}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-between items-center">
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-destructive/10 rounded-xl text-destructive transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Eliminar cita"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Volver
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm hover:shadow-md"
                  style={{ background: "var(--theme-primary, #C0987A)" }}
                >
                  Guardar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer text-foreground"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
