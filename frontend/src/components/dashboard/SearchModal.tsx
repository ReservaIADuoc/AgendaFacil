import { X, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[10vh] px-4 transition-all" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-black/5 animate-in fade-in slide-in-from-top-10 duration-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
          <input 
            type="text"
            placeholder="Buscar citas, clientes, servicios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-gray-400"
            autoFocus
          />
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-[#FCFBF8]">
          {query.length > 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">
              No se encontraron resultados para "{query}"
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Búsquedas recientes</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#EAE5DF] flex items-center justify-center text-[#C0987A] font-bold text-xs">MG</div>
                  <div>
                    <div className="text-sm font-semibold text-[#2C2A29]">María García</div>
                    <div className="text-xs text-gray-500">Cliente</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#A9B3A2]/20 flex items-center justify-center text-[#A9B3A2] font-bold text-xs">EV</div>
                  <div>
                    <div className="text-sm font-semibold text-[#2C2A29]">Evaluación Inicial</div>
                    <div className="text-xs text-gray-500">Servicio</div>
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
