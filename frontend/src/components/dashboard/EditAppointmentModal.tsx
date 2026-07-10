import { X, Calendar, Clock, User, AlignLeft, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { AppointmentEvent } from "../../hooks/useAppointments";



interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updatedFields: Partial<AppointmentEvent>) => void;
  onDelete: (id: string) => void;
  event: AppointmentEvent | null;
}

export default function EditAppointmentModal({
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  event
}: EditAppointmentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("CONFIRMED");

  useEffect(() => {
    if (isOpen && event) {
      setDate(event.date);
      setTime(event.time);
      setStatus(event.status || "CONFIRMED");
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleSave = () => {
    onUpdate(event.id, {
      date,
      time,
      status
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta cita de forma permanente?")) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4 transition-all">
      <div
        className="bg-card/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-primary/10 overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300 text-foreground"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
              Detalles de la Cita
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Administración y reprogramación.</p>
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
          {/* Client Info */}
          <div className="flex items-start gap-3 p-4 bg-muted/35 border border-border/60 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold text-sm">
              {event.clientName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cliente</h3>
              <p className="text-sm font-bold text-foreground mt-0.5">{event.clientName}</p>
            </div>
          </div>

          {/* Service Info */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-primary" /> Servicio Agendado
            </label>
            <input
              type="text"
              readOnly
              value={`${event.service} (${Math.round(event.duration * 60)} min)`}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-muted-foreground text-[14px] focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-[14px] bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-[14px] bg-background text-foreground"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Estado de la Cita
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-[14px] bg-background text-foreground cursor-pointer"
            >
              <option value="CONFIRMED">Confirmada</option>
              <option value="PENDING">Pendiente</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-border bg-muted/30 flex justify-between items-center">
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl text-[14px] font-bold text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Eliminar Cita
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!date || !time}
              className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              style={{ background: "var(--theme-primary, #C0987A)" }}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
