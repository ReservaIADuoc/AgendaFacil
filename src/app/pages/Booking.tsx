import { useState } from "react";
import { useParams } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { Calendar, Clock, MapPin, CheckCircle, ChevronLeft } from "lucide-react";
import "react-day-picker/dist/style.css";

const PRIMARY = "#C0987A";
const ACCENT = "#A9B3A2";
const DARK = "#2C2A29";

export default function Booking() {
  const { username } = useParams();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Mock data based on username
  const professionalName = username ? username.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Valentina Rojas";

  const availableTimes = ["09:00", "09:30", "10:00", "11:00", "14:00", "15:30", "16:00"];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setStep(2);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-8 px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        
        {/* Header / Profile */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl text-white font-bold" style={{ background: PRIMARY }}>
            {professionalName.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>{professionalName}</h1>
            <p className="text-[#7E7870] font-medium mb-2">Psicología Clínica</p>
            <div className="flex items-center gap-4 text-sm text-[#7E7870]">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#C0987A]" /> 50 min</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#C0987A]" /> Videollamada</span>
            </div>
          </div>
        </div>

        {/* Main Booking Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* Left Sidebar (Summary) */}
          <div className="w-full md:w-1/3 bg-[#F3EFE9]/50 p-6 border-b md:border-b-0 md:border-r border-[#D1CEC4]">
            <h3 className="font-bold text-[#2C2A29] mb-4 uppercase tracking-wider text-xs">Resumen de tu cita</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5"><Calendar className="w-4 h-4 text-[#C0987A]" /></div>
                <div>
                  <p className="text-sm font-semibold text-[#4A4641]">Fecha y Hora</p>
                  <p className="text-sm text-[#7E7870]">
                    {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es }) : "Elige un día"}
                    {selectedTime ? `, ${selectedTime}` : ""}
                  </p>
                </div>
              </div>
            </div>
            
            {(selectedDate || step > 1) && (
              <button 
                onClick={() => setStep(step === 3 ? 2 : 1)}
                className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#C0987A] hover:text-[#A9B3A2] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Volver atrás
              </button>
            )}
          </div>

          {/* Right Content Area */}
          <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col">
            
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#2C2A29] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>Selecciona una fecha</h2>
                <div className="flex justify-center border border-[#D1CEC4] rounded-2xl p-4 bg-white">
                  <DayPicker 
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={es}
                    disabled={{ before: new Date() }}
                    modifiersClassNames={{
                      selected: "bg-[#C0987A] text-white hover:bg-[#C0987A]",
                      today: "font-bold text-[#C0987A]"
                    }}
                    styles={{
                      day: { borderRadius: '50%' }
                    }}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#2C2A29] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Horarios disponibles
                </h2>
                <p className="text-[#7E7870] text-sm mb-6 capitalize">
                  {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="py-3 rounded-xl border border-[#C0987A]/30 text-[#4A4641] font-semibold hover:border-[#C0987A] hover:bg-[#C0987A]/5 transition-all text-sm"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-[#2C2A29] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tus datos
                </h2>
                
                <form className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Nombre completo</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Correo electrónico</label>
                    <input type="email" required className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Teléfono móvil</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all" />
                  </div>
                  
                  <div className="pt-6 mt-auto">
                    <button type="button" onClick={() => alert("Cita confirmada!")} className="w-full py-4 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all shadow-md" style={{ background: PRIMARY }}>
                      Confirmar cita
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
