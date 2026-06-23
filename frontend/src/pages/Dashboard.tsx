import { useState } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import CreateAppointmentModal, { AppointmentEvent } from "../components/dashboard/CreateAppointmentModal";
import { DayPicker } from "react-day-picker";

const getInitialEvents = (): AppointmentEvent[] => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 });
  return [
    {
      id: "1",
      clientName: "María García",
      service: "consulta",
      date: format(addDays(start, 1), "yyyy-MM-dd"), // Monday
      time: "10:00",
      duration: 1
    },
    {
      id: "2",
      clientName: "Juan Pérez",
      service: "terapia",
      date: format(addDays(start, 1), "yyyy-MM-dd"), // Monday
      time: "14:00",
      duration: 1.5
    },
    {
      id: "3",
      clientName: "Ana Silva",
      service: "evaluacion",
      date: format(addDays(start, 3), "yyyy-MM-dd"), // Wednesday
      time: "16:00",
      duration: 1
    }
  ];
};

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [events, setEvents] = useState<AppointmentEvent[]>(getInitialEvents());

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState("");
  const [modalInitialTime, setModalInitialTime] = useState("");

  // View State
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [isViewMenuOpen, setViewMenuOpen] = useState(false);

  // Toggle QA
  const [showEmptyState, setShowEmptyState] = useState(false);
  const activeEvents = showEmptyState ? [] : events;

  // Generate week days starting from Sunday
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const daysToRender = viewMode === "week" ? weekDays : [currentDate];
  const gridColsClass = viewMode === "week" ? "grid-cols-7" : "grid-cols-1";

  const hours = Array.from({ length: 23 }).map((_, i) => i + 1); // 1 to 23

  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
  const handleToday = () => setCurrentDate(new Date());

  const handleGridClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    let hour = Math.floor(y / 48);
    if (hour < 0) hour = 0;
    if (hour > 23) hour = 23;

    const formattedTime = `${hour.toString().padStart(2, '0')}:00`;
    const formattedDate = format(day, "yyyy-MM-dd");

    setModalInitialDate(formattedDate);
    setModalInitialTime(formattedTime);
    setModalOpen(true);
  };

  const handleSaveEvent = (newEvent: AppointmentEvent) => {
    setEvents([...events, newEvent]);
    setModalOpen(false);
  };

  const getServiceName = (service: string) => {
    if (service === "consulta") return "Consulta General";
    if (service === "terapia") return "Terapia de Pareja";
    if (service === "evaluacion") return "Evaluación Inicial";
    return "Cita";
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="h-20 border-b border-border flex items-center justify-between px-8 bg-card shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Calendario</h1>
          <p className="text-sm text-muted-foreground">Gestiona tus citas y disponibilidad.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleToday} className="px-4 py-2 border border-input rounded-lg font-bold text-sm hover:bg-accent transition-colors text-foreground">
            Hoy
          </button>
          <div className="flex items-center gap-1">
            <button onClick={handlePrevWeek} className="p-1.5 hover:bg-accent rounded-full text-muted-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleNextWeek} className="p-1.5 hover:bg-accent rounded-full text-muted-foreground transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <h2 className="text-xl font-normal capitalize text-foreground">
            {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
          </h2>
          
          <button 
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground underline hidden sm:block"
          >
            Ver estado {showEmptyState ? 'con datos' : 'vacío'}
          </button>
          
          {/* Mini Calendar Dropdown */}
          <div className="relative group hidden sm:block">
            <button className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
              <CalendarIcon className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
               <DayPicker 
                mode="single"
                selected={currentDate}
                onSelect={(d) => d && setCurrentDate(d)}
                locale={es}
                modifiersClassNames={{ selected: "bg-primary text-primary-foreground font-bold", today: "font-bold text-primary" }}
                styles={{ day: { borderRadius: '50%', width: '36px', height: '36px' } }}
              />
            </div>
          </div>

          <div className="relative">
            <div 
              onClick={() => setViewMenuOpen(!isViewMenuOpen)}
              className="border border-input rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-accent transition-colors text-foreground"
            >
              <span className="text-sm font-bold capitalize">{viewMode === "week" ? "Semana" : "Día"}</span>
            </div>
            {isViewMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { setViewMode("day"); setViewMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${viewMode === "day" ? "bg-accent font-bold text-primary" : "text-foreground"}`}
                >
                  Día
                </button>
                <button 
                  onClick={() => { setViewMode("week"); setViewMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${viewMode === "week" ? "bg-accent font-bold text-primary" : "text-foreground"}`}
                >
                  Semana
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Days Header */}
      <div className="flex-1 overflow-auto bg-card relative">
        <div className="min-w-[800px] flex border-b border-border">
          <div className="w-16 shrink-0 border-r border-border bg-muted/30"></div>
          {daysToRender.map((day, i) => {
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <div key={i} className={`flex-1 flex flex-col items-center justify-center py-4 border-r border-border ${isToday ? 'bg-primary/5' : 'bg-card'}`}>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{format(day, "EEE", { locale: es })}</span>
                <span className={`text-xl font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>{format(day, "d")}</span>
              </div>
            );
          })}
        </div>

      {/* Time Grid Scrollable */}
      <div className="flex min-w-[800px] relative">
        <div className="w-16 shrink-0 border-r border-border bg-muted/30 relative">
          {hours.map((hour, i) => (
            <div key={i} className="h-20 border-b border-border/50 flex items-start justify-center py-2 relative">
              <span className="text-xs font-medium text-muted-foreground relative -top-3 bg-card px-1">{hour}</span>
            </div>
          ))}
        </div>

        {/* Grid Area */}
        {daysToRender.map((day, dayIndex) => {
          const dayDateStr = format(day, "yyyy-MM-dd");
          const dayEvents = activeEvents.filter(e => e.date === dayDateStr);

          return (
            <div 
              key={dayIndex} 
              className="flex-1 relative border-r border-border"
              onClick={(e) => handleGridClick(day, e)}
            >
              {hours.map((_, i) => (
                <div key={i} className="h-20 border-b border-border/50 border-dashed"></div>
              ))}
              
              {dayEvents.map(event => {
                const [hourStr, minStr] = event.time.split(":");
                const hour = parseInt(hourStr, 10);
                const min = parseInt(minStr, 10);
                
                const topPosition = (hour * 80) + (min * 1.333); // 80px per hour
                const height = event.duration * 80;
                const isEval = event.service === "evaluacion";

                return (
                  <div 
                    key={event.id}
                      className={`absolute left-1 right-1 rounded-lg p-2 shadow-sm text-xs overflow-hidden hover:shadow-md cursor-pointer border transition-all hover:scale-[1.02] hover:z-20 z-10 ${
                        isEval 
                        ? 'bg-[#A9B3A2] text-white border-[#9ca794]' 
                        : 'bg-[#C0987A] text-white border-[#b38a5e]'
                      }`}
                      style={{ top: `${topPosition}px`, height: `${height}px` }}
                    >
                      <div className="font-bold truncate">{getServiceName(event.service)}</div>
                      <div className="truncate opacity-90 font-medium">{event.clientName}</div>
                      <div className="text-[10px] mt-1 opacity-80 font-medium">
                        {event.time} - {format(new Date(2000, 0, 1, hour, min + (event.duration * 60)), "HH:mm")}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Empty State Overlay */}
        {showEmptyState && viewMode === "week" && (
          <div className="absolute inset-0 z-40 bg-card/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="bg-card p-8 rounded-3xl shadow-xl border border-border flex flex-col items-center text-center max-w-sm pointer-events-auto animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-primary mb-4">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                Tu agenda está libre
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                No tienes citas programadas para esta semana. Haz clic en cualquier hora para añadir un evento manualmente.
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveEvent}
        initialDate={modalInitialDate}
        initialTime={modalInitialTime}
      />
    </div>
  );
}
