import { X, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const PRIMARY = "#C0987A";

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClientClick = (clientId: number) => {
    navigate(`/dashboard/clients?select=${clientId}`);
    onClose();
  };

  const handleServiceClick = () => {
    navigate("/dashboard/services");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[10vh] px-4 transition-all" onClick={onClose}>
      <div 
        className="bg-card rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-border animate-in fade-in slide-in-from-top-10 duration-200 text-foreground"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border bg-card">
          <SearchIcon className="w-5 h-5 text-muted-foreground mr-3" />
          <input 
            type="text"
            placeholder="Buscar citas, clientes, servicios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-muted-foreground text-foreground"
            autoFocus
          />
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-muted/20">
          {query.length > 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No se encontraron resultados para "{query}"
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Búsquedas recientes</h3>
              <div className="space-y-2">
                <div 
                  onClick={() => handleClientClick(1)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-card border border-transparent hover:border-border cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EAE5DF] dark:bg-[#C0987A]/20 flex items-center justify-center text-[#C0987A] font-bold text-xs">MG</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">María García</div>
                    <div className="text-xs text-muted-foreground">Cliente</div>
                  </div>
                </div>
                <div 
                  onClick={handleServiceClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-card border border-transparent hover:border-border cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#A9B3A2]/20 flex items-center justify-center text-[#A9B3A2] font-bold text-xs">EV</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Evaluación Inicial</div>
                    <div className="text-xs text-muted-foreground">Servicio</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
