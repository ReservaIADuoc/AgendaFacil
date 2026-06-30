import { X, Briefcase, Clock, DollarSign, MonitorPlay } from "lucide-react";
import { useState, useEffect } from "react";

const PRIMARY = "#C0987A";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: { id?: number; name: string; duration: string; price: string; type: string }) => void;
  serviceToEdit?: any;
}

export default function CreateServiceModal({ isOpen, onClose, onSave, serviceToEdit }: CreateServiceModalProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("video");

  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setName(serviceToEdit.name);
        setDuration(serviceToEdit.duration.replace(" min", ""));
        // Remove $ sign and formatting dots from price string
        setPrice(serviceToEdit.price.replace(/[^\d]/g, ""));
        setType(serviceToEdit.type);
      } else {
        setName("");
        setDuration("60");
        setPrice("");
        setType("video");
      }
    }
  }, [isOpen, serviceToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    onSave({ 
      id: serviceToEdit?.id,
      name, 
      duration: `${duration} min`, 
      price, 
      type 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-card rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/40">
          <h2 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            {serviceToEdit ? "Editar Servicio" : "Añadir Nuevo Servicio"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Nombre del Servicio */}
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" /> Nombre del servicio
              </label>
              <input 
                type="text"
                required
                placeholder="Ej. Terapia Individual"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#C0987A] text-[14px] bg-muted/30 text-foreground placeholder-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Duración */}
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Duración
                </label>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#C0987A] text-[14px] bg-muted/30 text-foreground appearance-none cursor-pointer"
                  >
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos (1 hora)</option>
                    <option value="90">90 minutos (1.5 horas)</option>
                    <option value="120">120 minutos (2 horas)</option>
                  </select>
                </div>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" /> Precio (CLP)
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. 50000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#C0987A] text-[14px] bg-muted/30 text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* Modalidad */}
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-muted-foreground" /> Modalidad del servicio
              </label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-all select-none">
                  <input
                    type="radio"
                    name="service-type"
                    value="video"
                    checked={type === "video"}
                    onChange={() => setType("video")}
                    className="text-[#C0987A] focus:ring-[#C0987A] accent-[#C0987A]"
                  />
                  <span className="text-sm font-bold text-foreground">Videollamada</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 p-3.5 border border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-all select-none">
                  <input
                    type="radio"
                    name="service-type"
                    value="presencial"
                    checked={type === "presencial"}
                    onChange={() => setType("presencial")}
                    className="text-[#C0987A] focus:ring-[#C0987A] accent-[#C0987A]"
                  />
                  <span className="text-sm font-bold text-foreground">Presencial</span>
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-t border-border bg-muted/20 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={!name || !price}
              className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              style={{ background: PRIMARY }}
            >
              {serviceToEdit ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
