import { X, Calendar, Clock, User, AlignLeft } from "lucide-react";
import { useState, useEffect } from "react";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export interface AppointmentEvent {
  id: string;
  clientName: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // in hours (1 or 1.5 etc)
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AppointmentEvent) => void;
  initialDate?: string;
  initialTime?: string;
}

export default function CreateAppointmentModal({ isOpen, onClose, onSave, initialDate = "", initialTime = "" }: CreateAppointmentModalProps) {
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (isOpen) {
      setClientName("");
      setService("");
      setDate(initialDate);
      setTime(initialTime);
    }
  }, [isOpen, initialDate, initialTime]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!clientName || !service || !date || !time) return;

    // Determine duration based on service
    let duration = 1;
    if (service === "terapia") duration = 1.5;
    if (service === "evaluacion") duration = 0.75; // 45 min

    const newEvent: AppointmentEvent = {
      id: Math.random().toString(36).substr(2, 9),
      clientName,
      service,
      date,
      time,
      duration
    };
    
    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/5 animate-in fade-in zoom-in-95 duration-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FCFBF8]">
          <h2 className="text-[18px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
            Nueva Cita
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Cliente */}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#A9B3A2]" /> Cliente
            </label>
            <input 
              type="text"
              placeholder="Nombre del cliente o email..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-[14px] bg-gray-50/50"
              style={{ focusRingColor: PRIMARY }}
            />
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-[#A9B3A2]" /> Servicio
            </label>
            <select 
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-[14px] bg-gray-50/50 appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecciona un servicio</option>
              <option value="consulta">Consulta General (60 min)</option>
              <option value="terapia">Terapia de pareja (90 min)</option>
              <option value="evaluacion">Evaluación inicial (45 min)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#A9B3A2]" /> Fecha
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-[14px] bg-gray-50/50"
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A9B3A2]" /> Hora
              </label>
              <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-[14px] bg-gray-50/50"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 bg-[#FCFBF8] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!clientName || !service || !date || !time}
            className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ background: PRIMARY }}
          >
            Guardar Cita
          </button>
        </div>
      </div>
    </div>
  );
}
