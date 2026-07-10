import { useState, useEffect, useRef, useCallback } from "react";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, Clock, Sliders, Eye, EyeOff, PanelLeftClose, PanelLeft, Loader2 } from "lucide-react";
import CreateAppointmentModal from "../components/dashboard/CreateAppointmentModal";
import AppointmentDetailModal from "../components/dashboard/AppointmentDetailModal";
import type { AppointmentEvent } from "../hooks/useAppointments";
import { DayPicker } from "react-day-picker";
import { useAppointments } from "../hooks/useAppointments";
import { useServices } from "../hooks/useServices";
import { useClients } from "../hooks/useClients";
import { useAuth, API_BASE_URL } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "react-day-picker/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";

const SERVICE_COLORS = ["var(--theme-primary, #C0987A)", "#D9A05B", "#A9B3A2", "#7E9E87", "#B8936A"];

const DAYS_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_INDEX_TO_NAME = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAYS_TRANSLATIONS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const DEFAULT_SCHEDULES = DAYS_ORDER.map((dayName) => ({
  dayOfWeek: dayName,
  startTime: "09:00",
  endTime: "18:00",
  isActive: dayName !== "SATURDAY" && dayName !== "SUNDAY",
}));

const TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

function parseHour(time: string): number {
  return parseInt(time.substring(0, 2), 10);
}

function getEventColor(event: AppointmentEvent, serviceIndex: number): string {
  if (event.serviceColor) return event.serviceColor;
  return SERVICE_COLORS[serviceIndex % SERVICE_COLORS.length];
}

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { services, toggleStatus } = useServices();
  const { clients } = useClients();
  const { token } = useAuth();
  const { showToast } = useToast();

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  const [schedules, setSchedules] = useState<any[]>(DEFAULT_SCHEDULES);
  const [isSavingSchedules, setIsSavingSchedules] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState("");
  const [modalInitialTime, setModalInitialTime] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null);

  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [isViewMenuOpen, setViewMenuOpen] = useState(false);

  useEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollTop = 640;
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setViewMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadSchedules() {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/appointments/schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const merged = DAYS_ORDER.map((dayName) => {
            const found = data.find((s: any) => s.dayOfWeek === dayName);
            return found || DEFAULT_SCHEDULES.find((d) => d.dayOfWeek === dayName)!;
          });
          setSchedules(merged);
        }
      } catch (error) {
        console.error("Error loading schedules:", error);
      }
    }
    loadSchedules();
  }, [token]);

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === day ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSchedules = async () => {
    if (!token) return;
    setIsSavingSchedules(true);
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/schedules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(schedules),
      });
      if (res.ok) {
        showToast("Horarios de atención actualizados con éxito", "success");
      } else {
        showToast("No se pudieron guardar los horarios", "error");
      }
    } catch {
      showToast("Error de conexión al guardar disponibilidad", "error");
    } finally {
      setIsSavingSchedules(false);
    }
  };

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const daysToRender = viewMode === "week" ? weekDays : [currentDate];
  const hours = Array.from({ length: 24 }).map((_, i) => i);

  const handleNavigate = (direction: -1 | 1) => {
    const delta = viewMode === "week" ? 7 * direction : direction;
    setCurrentDate((d) => (direction === 1 ? addDays(d, Math.abs(delta)) : subDays(d, Math.abs(delta))));
  };

  const handleToday = () => setCurrentDate(new Date());

  const getScheduleForDay = useCallback(
    (day: Date) => {
      const dayName = DAY_INDEX_TO_NAME[day.getDay()];
      return schedules.find((s) => s.dayOfWeek === dayName);
    },
    [schedules]
  );

  const isHourAvailable = (day: Date, hour: number): boolean => {
    const sched = getScheduleForDay(day);
    if (!sched || !sched.isActive) return false;
    const start = parseHour(sched.startTime);
    const end = parseHour(sched.endTime);
    return hour >= start && hour < end;
  };

  const handleGridClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const sched = getScheduleForDay(day);
    if (!sched?.isActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let hour = Math.floor(y / 80);
    hour = Math.max(0, Math.min(23, hour));
    if (!isHourAvailable(day, hour)) return;

    setModalInitialDate(format(day, "yyyy-MM-dd"));
    setModalInitialTime(`${hour.toString().padStart(2, "0")}:00`);
    setModalOpen(true);
  };

  const handleSaveEvent = async (newEvent: Omit<AppointmentEvent, "id">) => {
    await addAppointment(newEvent);
    setModalOpen(false);
    showToast("Cita agendada correctamente", "success");
  };

  const visibleEvents = events.filter((e) =>
    daysToRender.some((d) => format(d, "yyyy-MM-dd") === e.date)
  );
  const isEmpty = !loading && visibleEvents.length === 0;

  const clientOptions = clients.filter((c) => c.uuid).map((c) => ({
    uuid: c.uuid!,
    name: c.name,
    email: c.email,
  }));

  const serviceOptions = services.map((s, i) => ({
    uuid: s.uuid,
    name: s.name,
    durationMinutes: s.durationMinutes,
    colorHex: SERVICE_COLORS[i % SERVICE_COLORS.length],
  }));

  const headerLabel =
    viewMode === "week"
      ? `${format(weekDays[0], "d MMM", { locale: es })} – ${format(weekDays[6], "d MMM yyyy", { locale: es })}`
      : format(currentDate, "EEEE d 'de' MMMM yyyy", { locale: es });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex h-full bg-background overflow-hidden relative"
    >
      <BackgroundBlobs />
      {/* Config sidebar */}
      <AnimatePresence>
      {sidebarOpen && (
        <motion.aside 
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex w-80 xl:w-96 border-r border-border glass flex-col shrink-0 overflow-y-auto pb-8 z-10"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-[18px] font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Fraunces', serif" }}>
              <Sliders className="w-5 h-5 text-primary" /> Configuración de Agenda
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Define tus días activos y visibilidad de servicios.</p>
          </div>

          <div className="p-4 border-b border-border flex justify-center bg-muted/10">
            <DayPicker
              mode="single"
              selected={currentDate}
              onSelect={(d) => d && setCurrentDate(d)}
              locale={es}
              weekStartsOn={1}
              modifiersClassNames={{
                selected: "bg-primary text-primary-foreground font-bold",
                today: "font-bold text-primary",
              }}
              styles={{ day: { borderRadius: "50%", width: "32px", height: "32px", fontSize: "0.8rem" } }}
            />
          </div>

          <div className="p-6 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Horarios de Atención
              </h3>
              <button
                onClick={handleSaveSchedules}
                disabled={isSavingSchedules}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingSchedules ? "Guardando..." : "Guardar"}
              </button>
            </div>

            <div className="space-y-3.5">
              {(() => {
                const selectedDayName = DAY_INDEX_TO_NAME[currentDate.getDay()];
                const daySched = schedules.find((s) => s.dayOfWeek === selectedDayName);
                if (!daySched) return null;

                const translated = DAYS_TRANSLATIONS[daySched.dayOfWeek] || daySched.dayOfWeek;
                const formattedDate = format(currentDate, "d 'de' MMMM", { locale: es });

                return (
                  <div key={daySched.dayOfWeek} className="flex flex-col gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-foreground">Horario para los {translated}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Configuración recurrente ({formattedDate})</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={daySched.isActive}
                          onChange={(e) => handleScheduleChange(daySched.dayOfWeek, "isActive", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                    {daySched.isActive ? (
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={daySched.startTime.substring(0, 5)}
                          onChange={(e) => handleScheduleChange(daySched.dayOfWeek, "startTime", e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-xl text-xs bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">a</span>
                        <select
                          value={daySched.endTime.substring(0, 5)}
                          onChange={(e) => handleScheduleChange(daySched.dayOfWeek, "endTime", e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-xl text-xs bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-2 bg-muted/20 rounded-xl">
                        Cerrado / No laborable los {translated}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> Servicios en Reserva Pública
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Activa o desactiva qué servicios se listarán para tus clientes en tu página pública.
            </p>
            <div className="space-y-3">
              {services.map((svc) => {
                const isSvcActive = svc.status === "active";
                return (
                  <div key={svc.id} className="flex items-center justify-between p-3 bg-muted/30 border border-border/40 rounded-xl hover:border-border transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-foreground truncate max-w-[180px]">{svc.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{svc.duration} • {svc.price}</p>
                    </div>
                    <button
                      onClick={() => toggleStatus(svc.id)}
                      className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer active:scale-95 ${
                        isSvcActive
                          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-md"
                          : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                      title={isSvcActive ? "Desactivar de reserva pública" : "Activar en reserva pública"}
                    >
                      {isSvcActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
              {services.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No hay servicios configurados.</p>
              )}
            </div>
          </div>
        </motion.aside>
      )}
      </AnimatePresence>

      {/* Calendar main area */}
      <main className="flex-1 flex flex-col h-full bg-transparent overflow-hidden min-w-0 z-10">
        <header className="h-20 border-b border-border flex items-center justify-between px-4 md:px-8 bg-card shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground transition-all duration-300 cursor-pointer hidden lg:flex hover:text-foreground"
              title={sidebarOpen ? "Ocultar configuración" : "Mostrar configuración"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate" style={{ fontFamily: "'Fraunces', serif" }}>
                Calendario
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Administra tus citas y disponibilidad de horarios.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={handleToday}
              className="px-4 py-2 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-all duration-300 hover:shadow-sm text-foreground cursor-pointer"
            >
              Hoy
            </button>
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/50">
              <button onClick={() => handleNavigate(-1)} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all duration-300 cursor-pointer hover:shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => handleNavigate(1)} className="p-2 hover:bg-card rounded-xl text-muted-foreground transition-all duration-300 cursor-pointer hover:shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-sm md:text-base font-medium capitalize text-foreground hidden sm:block max-w-[200px] md:max-w-none truncate">
              {headerLabel}
            </h2>

            <div className="relative" ref={viewMenuRef}>
              <button
                onClick={() => setViewMenuOpen(!isViewMenuOpen)}
                className="border border-input rounded-lg px-3 py-1.5 text-sm font-bold capitalize hover:bg-accent transition-colors text-foreground cursor-pointer"
              >
                {viewMode === "week" ? "Semana" : "Día"}
              </button>
              {isViewMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  <button
                    onClick={() => { setViewMode("day"); setViewMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer ${viewMode === "day" ? "bg-accent font-bold text-primary" : "text-foreground"}`}
                  >
                    Día
                  </button>
                  <button
                    onClick={() => { setViewMode("week"); setViewMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer ${viewMode === "week" ? "bg-accent font-bold text-primary" : "text-foreground"}`}
                  >
                    Semana
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Days header */}
        <div className="flex border-b border-border bg-card shrink-0 shadow-sm z-10">
          <div className="w-14 md:w-16 shrink-0 border-r border-border bg-muted/10" />
          {daysToRender.map((day, i) => {
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const sched = getScheduleForDay(day);
            const isInactive = !sched?.isActive;
            return (
              <div
                key={i}
                className={`flex-1 flex flex-col items-center justify-center py-3 border-r border-border min-w-0 ${
                  isToday ? "bg-primary/5" : isInactive ? "bg-muted/20" : "bg-card"
                }`}
              >
                <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className={`text-base md:text-lg font-bold ${isToday ? "text-primary" : isInactive ? "text-muted-foreground/50" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div ref={gridContainerRef} className="flex-1 overflow-y-auto bg-transparent relative">
          {loading && (
            <div className="absolute inset-0 z-30 bg-card/70 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          <div className="flex relative">
            <div className="w-14 md:w-16 shrink-0 border-r border-border bg-muted/10 relative select-none">
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-b border-border/40 flex items-start justify-center py-2 relative">
                  <span className="text-[10px] md:text-[11px] font-semibold text-muted-foreground relative -top-3.5 bg-card px-1 shadow-sm rounded-md border border-border/20">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {daysToRender.map((day, dayIndex) => {
              const dayDateStr = format(day, "yyyy-MM-dd");
              const dayEvents = events.filter((e) => e.date === dayDateStr);
              const sched = getScheduleForDay(day);
              const isInactiveDay = !sched?.isActive;

              return (
                <div
                  key={dayIndex}
                  className={`flex-1 relative border-r border-border min-w-0 ${
                    isInactiveDay ? "bg-muted/15" : ""
                  }`}
                  style={{ minHeight: "1920px" }}
                >
                  {hours.map((hour) => {
                    const available = !isInactiveDay && isHourAvailable(day, hour);
                    return (
                      <div
                        key={hour}
                        className={`h-20 border-b border-border/30 border-dashed pointer-events-none ${
                          !available ? "bg-muted/25" : ""
                        }`}
                      />
                    );
                  })}

                  {dayEvents.map((event, eventIdx) => {
                    const [hourStr, minStr] = event.time.split(":");
                    const hour = parseInt(hourStr, 10);
                    const min = parseInt(minStr, 10);
                    const topPosition = hour * 80 + min * 1.333;
                    const height = Math.max(event.duration * 80, 40);
                    const color = getEventColor(event, eventIdx);
                    const endTime = format(new Date(2000, 0, 1, hour, min + event.duration * 60), "HH:mm");

                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: eventIdx * 0.05 }}
                        key={event.id}
                        className="absolute left-1 right-1 rounded-2xl p-2 md:p-3 shadow-md text-xs overflow-hidden hover:shadow-xl cursor-pointer border border-white/20 transition-all duration-300 hover:scale-[1.03] hover:z-20 z-10 flex flex-col justify-between text-white"
                        style={{ top: `${topPosition}px`, height: `${height}px`, background: color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        <div>
                          <div className="font-bold truncate text-[12px] md:text-[13px]">{event.service}</div>
                          <div className="truncate opacity-95 mt-0.5 font-medium">{event.clientName}</div>
                        </div>
                        <div className="text-[10px] mt-1 opacity-80 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time} – {endTime}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {isEmpty && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-background/20 backdrop-blur-[2px]"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="glass-heavy p-10 rounded-[2.5rem] flex flex-col items-center text-center max-w-sm pointer-events-auto mx-4"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 shadow-inner">
                  <CalendarIcon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tu agenda está libre
                </h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {viewMode === "week"
                    ? "No tienes citas programadas para esta semana."
                    : "No tienes citas para este día."}
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        initialDate={modalInitialDate}
        initialTime={modalInitialTime}
        clients={clientOptions}
        services={serviceOptions.filter((s) => s.uuid)}
      />

      <AppointmentDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdate={updateAppointment}
        onDelete={deleteAppointment}
      />
    </motion.div>
  );
}
