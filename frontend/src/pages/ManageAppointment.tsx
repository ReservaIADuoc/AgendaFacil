import { Calendar, Clock, MapPin, Video, User, AlertCircle, X, RefreshCw, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";



export default function ManageAppointment() {
  const { id } = useParams();

  // Simulated appointment data
  const appointment = {
    id: id || "APP-9823",
    professional: "Valentina Rojas",
    service: "Terapia de Pareja",
    date: "Jueves, 25 de Junio",
    time: "14:00",
    duration: "90 min",
    type: "video",
    status: "confirmed" // confirmed, cancelled
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-4 flex items-center justify-center relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Botón Volver */}
      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <div className="max-w-lg w-full bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <Calendar className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-[#2C2A29] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
            Gestionar tu cita
          </h1>
          <p className="text-[#7E7870] text-sm">
            Aquí puedes revisar los detalles de tu reserva, reprogramarla o cancelarla si no puedes asistir.
          </p>
        </div>

        <div className="bg-[#F3EFE9]/40 rounded-2xl p-6 border border-[#D1CEC4]/50 mb-8 space-y-4">
          <div className="flex items-center gap-4 border-b border-[#D1CEC4]/50 pb-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              VR
            </div>
            <div>
              <p className="text-xs text-[#7E7870] font-bold uppercase tracking-wider">Profesional</p>
              <p className="font-bold text-[#2C2A29]">{appointment.professional}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2">
            <div>
              <p className="text-xs text-[#7E7870] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><ActivityIcon /> Servicio</p>
              <p className="text-sm font-medium text-[#4A4641]">{appointment.service}</p>
            </div>
            <div>
              <p className="text-xs text-[#7E7870] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Modalidad</p>
              <p className="text-sm font-medium text-[#4A4641] capitalize">{appointment.type}</p>
            </div>
            <div>
              <p className="text-xs text-[#7E7870] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fecha</p>
              <p className="text-sm font-medium text-[#4A4641]">{appointment.date}</p>
            </div>
            <div>
              <p className="text-xs text-[#7E7870] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Hora</p>
              <p className="text-sm font-medium text-[#4A4641]">{appointment.time} ({appointment.duration})</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full py-4 px-6 rounded-xl text-white font-bold text-base hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2" style={{ background: "var(--theme-primary, #C0987A)" }}>
            <RefreshCw className="w-5 h-5" /> Reprogramar Cita
          </button>
          
          <button className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-red-600 font-bold text-base hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
            <X className="w-5 h-5" /> Cancelar Cita
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Políticas de cancelación de 24 horas aplican.
          </p>
        </div>

      </div>
    </div>
  );
}

function ActivityIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}
