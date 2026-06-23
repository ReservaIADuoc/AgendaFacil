import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Clock, BriefcaseMedical, CheckCircle, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ArrowLeft } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isWorkingDay, setIsWorkingDay] = useState(true);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate("/dashboard");
  };

  const renderTimeSelect = (defaultValue: string) => (
    <div className="relative">
      <select 
        defaultValue={defaultValue} 
        className="appearance-none bg-[#F3EFE9]/70 text-[#2C2A29] font-bold px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#C0987A] border border-transparent hover:border-[#D1CEC4] transition-all pr-10 cursor-pointer text-sm"
      >
        {Array.from({ length: 24 }).map((_, h) => {
          const hourStr = h.toString().padStart(2, '0');
          return (
            <option key={hourStr} value={`${hourStr}:00`}>{hourStr}:00</option>
          );
        })}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-[#A9B3A2]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8] text-[#2C2A29]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-black/5 bg-white">
        <span className="text-[17px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>Agenda Fácil</span>
        <div className="text-sm font-medium text-[#7E7870]">Paso {step} de 3</div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className={`w-full ${step === 2 ? 'max-w-4xl' : 'max-w-2xl'} bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 transition-all duration-500`}>

          {/* Progress bar */}
          <div className="flex justify-between mb-12 relative max-w-xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#F3EFE9] -z-10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-[#C0987A] -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

            {[1, 2, 3].map(i => (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm ${step >= i ? 'bg-[#C0987A] text-white' : 'bg-[#F3EFE9] text-[#A9B3A2]'}`}>
                {i === 1 ? <User className="w-4 h-4" /> : i === 2 ? <Clock className="w-4 h-4" /> : <BriefcaseMedical className="w-4 h-4" />}
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="min-h-[300px] flex flex-col">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 max-w-xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-2 text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>Completa tu perfil</h1>
                <p className="text-[#7E7870] mb-8">Esta información será visible para tus pacientes.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">¿A qué te dedicas?</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-white focus:ring-2 focus:ring-[#C0987A] outline-none">
                      <option>Psicólogo/a</option>
                      <option>Coach</option>
                      <option>Nutricionista</option>
                      <option>Fisioterapeuta</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Enlace personalizado</label>
                    <div className="flex">
                      <span className="hidden sm:inline-flex items-center px-4 rounded-l-xl border border-r-0 border-[#D1CEC4] bg-[#F3EFE9] text-[#7E7870] text-sm">agendafacil.com/</span>
                      <input type="text" className="flex-1 px-4 py-3 rounded-xl sm:rounded-l-none border border-[#D1CEC4] bg-white focus:ring-2 focus:ring-[#C0987A] outline-none" placeholder="tu-nombre" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 w-full">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2 text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>Define tu horario y feriados</h1>
                  <p className="text-[#7E7870]">Selecciona un día en el calendario para ajustar sus horas específicas.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 bg-[#FCFBF8] rounded-3xl p-6 border border-black/5">
                  
                  {/* Calendar Left */}
                  <div className="flex-shrink-0 bg-white p-4 rounded-2xl border border-[#D1CEC4] shadow-sm flex justify-center">
                    <DayPicker 
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      locale={es}
                      modifiersClassNames={{
                        selected: "bg-[#C0987A] text-white hover:bg-[#C0987A] font-bold",
                        today: "text-[#C0987A] font-bold"
                      }}
                      styles={{
                        day: { borderRadius: '12px' }
                      }}
                    />
                  </div>

                  {/* Hours Right */}
                  <div className="flex-1 bg-white p-6 rounded-2xl border border-[#D1CEC4] shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F3EFE9]">
                      <div className="w-10 h-10 rounded-xl bg-[#F3EFE9] flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-[#C0987A]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2C2A29] capitalize">
                          {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es }) : "Selecciona un día"}
                        </h3>
                        <p className="text-xs text-[#7E7870]">Ajusta la disponibilidad de esta fecha.</p>
                      </div>
                    </div>

                    {selectedDate && (
                      <div className="space-y-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isWorkingDay}
                            onChange={(e) => setIsWorkingDay(e.target.checked)}
                            className="w-5 h-5 text-[#C0987A] rounded border-[#D1CEC4] focus:ring-2 focus:ring-[#C0987A] outline-none accent-[#C0987A]" 
                          />
                          <span className="font-semibold text-[#4A4641]">Estoy disponible este día</span>
                        </label>

                        {isWorkingDay ? (
                          <div className="bg-[#F3EFE9]/30 p-5 rounded-2xl flex flex-wrap items-center gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#A9B3A2] uppercase tracking-wider mb-2">Desde</label>
                              {renderTimeSelect("09:00")}
                            </div>
                            <div className="pt-6 font-bold text-[#A9B3A2]">-</div>
                            <div>
                              <label className="block text-xs font-bold text-[#A9B3A2] uppercase tracking-wider mb-2">Hasta</label>
                              {renderTimeSelect("18:00")}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#F3EFE9]/50 p-6 rounded-2xl text-center">
                            <span className="text-[#A9B3A2] font-semibold flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5" /> Marcado como día libre o feriado
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 max-w-xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-2 text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>Tu primer servicio</h1>
                <p className="text-[#7E7870] mb-8">Crea el servicio principal que ofreces a tus clientes.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Nombre del servicio</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-white focus:ring-2 focus:ring-[#C0987A] outline-none" placeholder="Ej. Consulta Inicial" defaultValue="Terapia Individual" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#4A4641] mb-1">Duración</label>
                      <div className="relative">
                        <select 
                          defaultValue="00:50" 
                          className="w-full appearance-none bg-[#F3EFE9]/70 text-[#2C2A29] font-bold px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#C0987A] border border-transparent hover:border-[#D1CEC4] transition-all pr-10 cursor-pointer text-sm"
                        >
                          <option value="00:15">00:15 (15 min)</option>
                          <option value="00:30">00:30 (30 min)</option>
                          <option value="00:45">00:45 (45 min)</option>
                          <option value="00:50">00:50 (50 min)</option>
                          <option value="01:00">01:00 (1 hora)</option>
                          <option value="01:30">01:30 (1.5 horas)</option>
                          <option value="02:00">02:00 (2 horas)</option>
                          <option value="02:30">02:30 (2.5 horas)</option>
                          <option value="03:00">03:00 (3 horas)</option>
                          <option value="04:00">04:00 (4 horas)</option>
                          <option value="05:00">05:00 (5 horas)</option>
                          <option value="06:00">06:00 (6 horas)</option>
                          <option value="08:00">08:00 (8 horas)</option>
                          <option value="12:00">12:00 (Medio día)</option>
                          <option value="24:00">24:00 (Todo el día)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-[#A9B3A2]" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[#4A4641] mb-1">Precio</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-white focus:ring-2 focus:ring-[#C0987A] outline-none" placeholder="Ej. $50.000" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-black/5 max-w-xl mx-auto w-full">
              {step > 1 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-4 sm:px-6 py-3 font-semibold text-[#7E7870] hover:text-[#2C2A29] transition-colors"
                >
                  Atrás
                </button>
              ) : (
                <Link 
                  to="/register"
                  className="px-4 sm:px-6 py-3 font-semibold text-[#7E7870] hover:text-[#2C2A29] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Cancelar
                </Link>
              )}
              <button
                onClick={handleNext}
                className="px-6 sm:px-8 py-3 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                style={{ background: PRIMARY }}
              >
                {step === 3 ? "Finalizar y entrar" : "Continuar"}
                {step === 3 && <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
