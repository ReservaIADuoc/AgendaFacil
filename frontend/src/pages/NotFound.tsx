import { Link } from "react-router";
import { Compass, ArrowLeft } from "lucide-react";


const DARK = "#2C2A29";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
        <Compass className="w-32 h-32 text-primary relative animate-[spin_10s_linear_infinite]" strokeWidth={1} />
      </div>

      <h1 className="text-[120px] leading-none font-bold text-[#EAE5DF] select-none pointer-events-none absolute opacity-50 z-0" style={{ fontFamily: "'Fraunces', serif" }}>
        404
      </h1>
      
      <div className="relative z-10 space-y-6 max-w-md">
        <h2 className="text-3xl md:text-4xl font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
          Ups, parece que te perdiste.
        </h2>
        
        <p className="text-gray-500 text-lg leading-relaxed">
          La página o el perfil del profesional que estás buscando no existe o ha sido movido a otra dirección.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
            style={{ background: "var(--theme-primary, #C0987A)" }}
          >
            <ArrowLeft className="w-5 h-5" /> Volver al Inicio
          </Link>
        </div>
      </div>
      
    </div>
  );
}
