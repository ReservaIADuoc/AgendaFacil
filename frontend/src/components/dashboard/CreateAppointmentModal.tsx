import { X, Calendar, Clock, User, AlignLeft } from "lucide-react";
import { useState, useEffect } from "react";

import type { AppointmentEvent } from "../../hooks/useAppointments";


const SERVICE_COLORS = ["var(--theme-primary, #C0987A)", "#D9A05B", "#A9B3A2", "#7E9E87", "#B8936A"];

export interface ClientOption {
  uuid?: string;
  name: string;
  email: string;
}

export interface ServiceOption {
  uuid?: string;
  name: string;
  durationMinutes: number;
  colorHex?: string;
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<AppointmentEvent, "id">) => void;
  initialDate?: string;
  initialTime?: string;
  clients?: ClientOption[];
  services?: ServiceOption[];
}

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  onSave,
  initialDate = "",
  initialTime = "",
  clients = [],
  services = [],
}: CreateAppointmentModalProps) {
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (isOpen) {
      setClientId("");
      setServiceId("");
      setDate(initialDate);
      setTime(initialTime);
    }
  }, [isOpen, initialDate, initialTime]);

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.uuid === clientId);
  const selectedService = services.find((s) => s.uuid === serviceId);

  const handleSave = () => {
    if (!clientId || !serviceId || !date || !time || !selectedClient || !selectedService) return;

    const durationHours = selectedService.durationMinutes / 60;
    const colorIndex = services.findIndex((s) => s.uuid === serviceId);
    const serviceColor = selectedService.colorHex || SERVICE_COLORS[colorIndex % SERVICE_COLORS.length];

    onSave({
      clientName: selectedClient.name,
      clientId,
      service: selectedService.name,
      serviceId,
      serviceColor,
      date,
      time,
      duration: durationHours,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4 transition-all">
      <div
        className="bg-card/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-primary/10 overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300 text-foreground"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
          <h2 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Nueva Cita
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#A9B3A2]" /> Cliente
            </label>
            {clients.length > 0 ? (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-[14px] bg-background text-foreground appearance-none cursor-pointer"
              >
                <option value="" disabled>Selecciona un cliente</option>
                {clients.map((c) => (
                  <option key={c.uuid || c.email} value={c.uuid || ""}>
                    {c.name} — {c.email}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground px-4 py-3 rounded-xl border border-dashed border-border bg-muted/20">
                No hay clientes registrados. Agrega uno desde la sección Clientes.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-[#A9B3A2]" /> Servicio
            </label>
            {services.length > 0 ? (
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-[14px] bg-background text-foreground appearance-none cursor-pointer"
              >
                <option value="" disabled>Selecciona un servicio</option>
                {services.map((s) => (
                  <option key={s.uuid || s.name} value={s.uuid || ""}>
                    {s.name} ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground px-4 py-3 rounded-xl border border-dashed border-border bg-muted/20">
                No hay servicios configurados. Agrega uno desde la sección Servicios.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#A9B3A2]" /> Fecha
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
                <Clock className="w-4 h-4 text-[#A9B3A2]" /> Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-[14px] bg-background text-foreground"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!clientId || !serviceId || !date || !time}
            className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            style={{ background: "var(--theme-primary, #C0987A)" }}
          >
            Guardar Cita
          </button>
        </div>
      </div>
    </div>
  );
}
