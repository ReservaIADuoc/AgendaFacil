import { X, User, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";



interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: { name: string; email: string; phone: string }) => void;
  client?: { name: string; email: string; phone: string } | null;
}

export default function CreateClientModal({ isOpen, onClose, onSave, client }: CreateClientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onSave({ name, email, phone });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-card/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-primary/10 overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/40">
          <h2 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            {client ? "Editar Cliente" : "Añadir Nuevo Cliente"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" /> Nombre completo
              </label>
              <input 
                type="text"
                required
                placeholder="Ej. María García"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-[14px] bg-muted/30 text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" /> Correo electrónico
              </label>
              <input 
                type="email"
                required
                placeholder="maria.garcia@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-[14px] bg-muted/30 text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" /> Teléfono
              </label>
              <input 
                type="tel"
                placeholder="Ej. +56 9 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-[14px] bg-muted/30 text-foreground placeholder-muted-foreground"
              />
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
              disabled={!name || !email}
              className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              style={{ background: "var(--theme-primary, #C0987A)" }}
            >
              {client ? "Guardar Cambios" : "Añadir Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
