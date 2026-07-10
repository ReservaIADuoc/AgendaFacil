import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Clock, BriefcaseMedical, CheckCircle, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ArrowLeft, CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";



const DAYS_OF_WEEK_SPANISH = [
  { id: "MONDAY", label: "Lunes" },
  { id: "TUESDAY", label: "Martes" },
  { id: "WEDNESDAY", label: "Miércoles" },
  { id: "THURSDAY", label: "Jueves" },
  { id: "FRIDAY", label: "Viernes" },
  { id: "SATURDAY", label: "Sábado" },
  { id: "SUNDAY", label: "Domingo" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  // Paso 2: Horario Semanal
  const [weeklyHours, setWeeklyHours] = useState<Record<string, { active: boolean; from: string; to: string }>>({
    MONDAY: { active: true, from: "09:00", to: "18:00" },
    TUESDAY: { active: true, from: "09:00", to: "18:00" },
    WEDNESDAY: { active: true, from: "09:00", to: "18:00" },
    THURSDAY: { active: true, from: "09:00", to: "18:00" },
    FRIDAY: { active: true, from: "09:00", to: "18:00" },
    SATURDAY: { active: false, from: "09:00", to: "14:00" },
    SUNDAY: { active: false, from: "09:00", to: "14:00" },
  });

  // Paso 2: Excepciones / Feriados (Selección Múltiple)
  const [onboardingTab, setOnboardingTab] = useState<"weekly" | "holidays">("weekly");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDatesWorkingDay, setIsDatesWorkingDay] = useState(false); // Por defecto marcados como libre
  const [customFrom, setCustomFrom] = useState("09:00");
  const [customTo, setCustomTo] = useState("18:00");

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate("/dashboard");
  };

  const handleWeeklyToggle = (dayId: string) => {
    setWeeklyHours(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        active: !prev[dayId].active
      }
    }));
  };

  const handleWeeklyTimeChange = (dayId: string, type: "from" | "to", val: string) => {
    setWeeklyHours(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [type]: val
      }
    }));
  };

  const renderTimeSelect = (value: string, onChange: (val: string) => void, disabled = false) => (
    <div className="relative">
      <select 
        value={value} 
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-muted/30 text-foreground font-bold px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary/40 border border-border/60 hover:border-border transition-all duration-300 pr-10 cursor-pointer text-sm disabled:opacity-40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
      >
        {Array.from({ length: 24 }).map((_, h) => {
          const hourStr = h.toString().padStart(2, '0');
          return (
            <option key={hourStr} value={`${hourStr}:00`}>{hourStr}:00</option>
          );
        })}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BackgroundBlobs />
      
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
        <span className="text-[17px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Agenda Fácil</span>
        <div className="text-sm font-medium text-muted-foreground">Paso {step} de 3</div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full ${step === 2 ? 'max-w-4xl' : 'max-w-2xl'} glass-heavy rounded-[2.5rem] p-8 md:p-12 transition-all duration-700 relative z-10`}
        >

          {/* Progress bar */}
          <div className="flex justify-between mb-12 relative max-w-xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -z-10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

            {[1, 2, 3].map(i => (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm ${step >= i ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {i === 1 ? <User className="w-4 h-4" /> : i === 2 ? <Clock className="w-4 h-4" /> : <BriefcaseMedical className="w-4 h-4" />}
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="min-h-[300px] flex flex-col">
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 max-w-xl mx-auto w-full"
              >
                <h1 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Completa tu perfil</h1>
                <p className="text-muted-foreground mb-8">Esta información será visible para tus pacientes.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">¿A qué te dedicas?</label>
                    <select className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border">
                      <option>Psicólogo/a</option>
                      <option>Coach</option>
                      <option>Nutricionista</option>
                      <option>Fisioterapeuta</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Enlace personalizado</label>
                    <div className="flex">
                      <span className="hidden sm:inline-flex items-center px-5 rounded-l-2xl border border-r-0 border-border/60 bg-muted/50 text-muted-foreground text-sm">agendafacil.com/</span>
                      <input type="text" className="flex-1 px-5 py-3.5 rounded-2xl sm:rounded-l-none border border-border/60 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border" placeholder="tu-nombre" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 w-full"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Define tu disponibilidad</h1>
                  <p className="text-muted-foreground">Configura tu horario de la semana o añade tus feriados y días libres.</p>
                </div>

                {/* Tabs selector */}
                <div className="flex border-b border-border mb-8 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setOnboardingTab("weekly")}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                      onboardingTab === "weekly"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Horario Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingTab("holidays")}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                      onboardingTab === "holidays"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Feriados y Días Libres
                  </button>
                </div>

                {onboardingTab === "weekly" ? (
                  /* HORARIO SEMANAL TAB */
                  <div className="bg-muted/40 rounded-3xl p-6 border border-border max-w-2xl mx-auto space-y-4">
                    {DAYS_OF_WEEK_SPANISH.map(day => {
                      const cfg = weeklyHours[day.id];
                      return (
                        <div key={day.id} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border gap-4 flex-wrap">
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={cfg.active}
                              onChange={() => handleWeeklyToggle(day.id)}
                              className="w-5 h-5 text-primary rounded border-border focus:ring-2 focus:ring-primary outline-none accent-primary" 
                            />
                            <span className="font-bold text-foreground">{day.label}</span>
                          </label>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground uppercase">Desde</span>
                            {renderTimeSelect(cfg.from, (val) => handleWeeklyTimeChange(day.id, "from", val), !cfg.active)}
                            <span className="text-muted-foreground font-bold">-</span>
                            <span className="text-xs text-muted-foreground uppercase">Hasta</span>
                            {renderTimeSelect(cfg.to, (val) => handleWeeklyTimeChange(day.id, "to", val), !cfg.active)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* EXCEPCIONES Y FERIADOS TAB (SELECCION MULTIPLE) */
                  <div className="flex flex-col md:flex-row gap-8 bg-muted/30 rounded-3xl p-6 border border-border">
                    {/* Calendar Left */}
                    <div className="flex-shrink-0 bg-card p-4 rounded-2xl border border-border shadow-sm flex justify-center h-fit">
                      <DayPicker 
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={(dates) => setSelectedDates(dates || [])}
                        locale={es}
                        modifiersClassNames={{
                          selected: "bg-primary text-white hover:bg-primary font-bold",
                          today: "text-primary font-bold"
                        }}
                        styles={{
                          day: { borderRadius: '12px' },
                          head: { color: 'var(--color-text-muted-foreground)' }
                        }}
                      />
                    </div>

                    {/* Options Right */}
                    <div className="flex-1 bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between min-h-[340px]">
                      <div>
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">
                              Días Seleccionados ({selectedDates.length})
                            </h3>
                            <p className="text-xs text-muted-foreground">Ajusta la disponibilidad de las fechas seleccionadas.</p>
                          </div>
                        </div>

                        {selectedDates.length > 0 ? (
                          <div className="space-y-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={!isDatesWorkingDay}
                                onChange={(e) => setIsDatesWorkingDay(!e.target.checked)}
                                className="w-5 h-5 text-primary rounded border-border focus:ring-2 focus:ring-primary outline-none accent-primary" 
                              />
                              <span className="font-semibold text-foreground">Marcar como día libre / feriado</span>
                            </label>

                            {!isDatesWorkingDay ? (
                              <div className="bg-muted/50 p-6 rounded-2xl text-center border border-border">
                                <span className="text-primary font-semibold flex items-center justify-center gap-2">
                                  <CheckCircle className="w-5 h-5" /> Estos días no tendrás disponibilidad
                                </span>
                              </div>
                            ) : (
                              <div className="bg-muted/30 p-5 rounded-2xl flex flex-wrap items-center gap-4 border border-border">
                                <div>
                                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Desde</label>
                                  {renderTimeSelect(customFrom, setCustomFrom)}
                                </div>
                                <div className="pt-6 font-bold text-muted-foreground">-</div>
                                <div>
                                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Hasta</label>
                                  {renderTimeSelect(customTo, setCustomTo)}
                                </div>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/50">
                              <strong>Fechas a configurar:</strong> {selectedDates.map(d => format(d, "d MMM", { locale: es })).join(", ")}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <p className="font-semibold">No hay fechas seleccionadas.</p>
                            <p className="text-xs mt-1">Haz clic en uno o más días del calendario para marcarlos como feriados o configurar un horario especial.</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedDates.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedDates([])}
                          className="mt-4 text-xs font-bold text-muted-foreground hover:text-foreground underline text-left"
                        >
                          Limpiar selección
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 max-w-xl mx-auto w-full"
              >
                <h1 className="text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Tu primer servicio</h1>
                <p className="text-muted-foreground mb-8">Crea el servicio principal que ofreces a tus clientes.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nombre del servicio</label>
                    <input type="text" className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border" placeholder="Ej. Consulta Inicial" defaultValue="Terapia Individual" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-1">Duración</label>
                      <div className="relative">
                        <select 
                          defaultValue="00:50" 
                          className="w-full appearance-none bg-muted/30 text-foreground font-bold px-5 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/40 border border-border/60 hover:border-border transition-all duration-300 pr-10 cursor-pointer text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
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
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-1">Precio</label>
                      <input type="text" className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border" placeholder="Ej. $50.000" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-border max-w-xl mx-auto w-full">
              {step > 1 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-4 sm:px-6 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Atrás
                </button>
              ) : (
                <Link 
                  to="/register"
                  className="px-4 sm:px-6 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Cancelar
                </Link>
              )}
              <button
                onClick={handleNext}
                className="px-6 sm:px-8 py-3 rounded-2xl font-bold text-white transition-all duration-500 flex items-center gap-2 cursor-pointer hover:-translate-y-1 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50"
              >
                {step === 3 ? "Finalizar y entrar" : "Continuar"}
                {step === 3 && <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
