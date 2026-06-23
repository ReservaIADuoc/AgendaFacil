import { X, BookOpen, MessageSquare, ExternalLink } from "lucide-react";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export default function HelpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-black/5 animate-in fade-in zoom-in-95 duration-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FCFBF8]">
          <h2 className="text-[18px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
            Ayuda y Soporte
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-6">
            ¿En qué podemos ayudarte hoy? Explora nuestros recursos o contacta con el equipo.
          </p>

          <a href="#" className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-[#C0987A] hover:bg-[#FCFBF8] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#EAE5DF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C0987A] transition-colors">
              <BookOpen className="w-5 h-5 text-[#C0987A] group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C2A29] mb-1 flex items-center gap-2">
                Centro de Ayuda <ExternalLink className="w-3 h-3 text-gray-400" />
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Guías paso a paso, tutoriales en video y respuestas a preguntas frecuentes.
              </p>
            </div>
          </a>

          <a href="#" className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-[#A9B3A2] hover:bg-[#FCFBF8] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#A9B3A2]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#A9B3A2] transition-colors">
              <MessageSquare className="w-5 h-5 text-[#A9B3A2] group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C2A29] mb-1">
                Chat de Soporte
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Habla con nuestro equipo de atención al cliente. Tiempo de respuesta: ~5 min.
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
