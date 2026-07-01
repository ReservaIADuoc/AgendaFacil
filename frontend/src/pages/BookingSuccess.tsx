import { useLocation, Link, useNavigate } from "react-router";
import { CheckCircle, Calendar, Clock, ArrowRight } from "lucide-react";

const PRIMARY = "#C0987A";

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { professionalName?: string, serviceName?: string, date?: string, time?: string } | null;

  // If someone manually goes to /success without booking, redirect them to home
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="text-center">
          <p className="mb-4">No hay información de reserva.</p>
          <button onClick={() => navigate('/')} className="text-[#C0987A] font-bold">Volver al Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 flex items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-lg w-full bg-card rounded-[2rem] p-8 md:p-12 shadow-sm border border-border text-center animate-in zoom-in-95 duration-500">
        
        <div className="mx-auto w-20 h-20 bg-[#A9B3A2]/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-[#A9B3A2]" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
          ¡Cita Confirmada!
        </h1>
        <p className="text-muted-foreground mb-8 text-sm md:text-base leading-relaxed">
          Tu reserva con <span className="font-semibold text-foreground">{state.professionalName}</span> ha sido agendada exitosamente. Te hemos enviado un correo con todos los detalles.
        </p>

        <div className="bg-muted/30 rounded-2xl p-6 text-left mb-8 border border-border">
          <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Detalles de tu cita</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Servicio</p>
              <p className="text-sm font-medium text-foreground">{state.serviceName || "Consulta"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha</p>
                <p className="text-sm font-medium text-foreground capitalize">{state.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Hora</p>
                <p className="text-sm font-medium text-foreground">{state.time}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full py-4 rounded-xl text-white font-bold text-base hover:opacity-90 transition-all shadow-md" style={{ background: PRIMARY }}>
            Añadir a Google Calendar
          </button>
          
          <Link to="/" className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-foreground font-bold text-base hover:bg-muted border border-transparent hover:border-border transition-all">
            Volver al Inicio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
