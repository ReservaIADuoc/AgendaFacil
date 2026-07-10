import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { Calendar, Clock, MapPin, ChevronLeft, Video, Building, Activity, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../contexts/AuthContext";
import "react-day-picker/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";
import { Skeleton } from "../components/shared/Skeleton";
import { MagneticButton } from "../components/shared/MagneticButton";
import { useNotifications } from "../contexts/NotificationsContext";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar";



type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  type: string;
  description: string;
  colorHex?: string;
  iconName?: string;
};

const getIcon = (type: string, iconName?: string) => {
  const name = (iconName || "").toLowerCase();
  const typeStr = (type || "").toLowerCase();
  if (name === "video" || typeStr === "video") return Video;
  if (name === "building" || typeStr === "presencial") return Building;
  return Activity;
};

export default function Booking() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { createEvent, isConnected } = useGoogleCalendar();

  // Step 0: Service | Step 1: Date | Step 2: Time | Step 3: Form
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const [profile, setProfile] = useState<{ firstName: string; lastName: string; bio?: string; specialty?: string; email?: string } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Form inputs
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch profile and services on mount
  useEffect(() => {
    async function loadProfileAndServices() {
      setIsLoadingProfile(true);
      setIsLoadingServices(true);
      try {
        const slug = username || "valentina-rojas";
        const profRes = await fetch(`${API_BASE_URL}/professionals/${slug}`);
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
        }

        const servicesRes = await fetch(`${API_BASE_URL}/professionals/${slug}/services`);
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Error loading professional public data:", error);
      } finally {
        setIsLoadingProfile(false);
        setIsLoadingServices(false);
      }
    }
    loadProfileAndServices();
  }, [username]);

  // Fetch availability when date or service changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    async function loadAvailability() {
      setIsLoadingTimes(true);
      try {
        const slug = username || "valentina-rojas";
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const url = `${API_BASE_URL}/professionals/${slug}/availability?date=${formattedDate}&serviceId=${selectedService.id}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAvailableTimes(data.availableTimes || []);
        }
      } catch (error) {
        console.error("Error loading availability:", error);
      } finally {
        setIsLoadingTimes(false);
      }
    }
    loadAvailability();
  }, [selectedDate, selectedService, username]);

  const professionalName = profile ? `${profile.firstName} ${profile.lastName}` : "Valentina Rojas";

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(1);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail) return;

    setIsSubmitting(true);
    try {
      const slug = username || "valentina-rojas";
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const bookingPayload = {
        professionalUsername: slug,
        serviceId: selectedService.id,
        clientName,
        clientEmail,
        phone: clientPhone,
        date: formattedDate,
        time: selectedTime,
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      if (response.ok) {
        addNotification({
          type: 'new_booking',
          title: 'Nueva Reserva',
          message: `${clientName} ha agendado "${selectedService.name}"`,
          time: 'Justo ahora'
        });

        // NOTA DE DESARROLLO: En una app real, esta sincronización se hace desde el backend
        // usando el refresh token almacenado del profesional.
        // Como este es un entorno prototipo de frontend (compartiendo el mismo navegador local), 
        // disparamos la creación directo si hay sesión iniciada en Google Calendar.
        if (isConnected) {
          try {
            createEvent({
              summary: `Cita: ${selectedService.name} - ${clientName}`,
              description: `Paciente: ${clientName}\nEmail: ${clientEmail}\nTeléfono: ${clientPhone}\nAgendado desde Agenda Fácil.`,
              date: formattedDate,
              time: selectedTime,
              durationMinutes: selectedService.duration,
              clientEmail: clientEmail
            });
          } catch (e) {
            console.error("No se pudo sincronizar con Google Calendar", e);
          }
        }
        
        navigate(`/book/${slug}/success`, {
          state: {
            professionalName,
            serviceName: selectedService.name,
            date: format(selectedDate, "EEEE, d 'de' MMMM", { locale: es }),
            time: selectedTime,
          },
        });
      } else {
        alert("Error al procesar la reserva. Por favor intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Hubo un problema de conexión al guardar la cita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BackgroundBlobs />

      {/* Botón Volver */}
      <Link to="/dashboard" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <div className="max-w-4xl w-full">

        {/* Header / Profile */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-heavy rounded-[2.5rem] p-6 md:p-8 mb-6 flex items-center gap-6 relative z-10"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl text-white font-bold overflow-hidden" style={{ background: "var(--theme-primary, #C0987A)" }}>
            {isLoadingProfile ? <Skeleton className="w-full h-full bg-white/20" /> : professionalName.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center h-8" style={{ fontFamily: "'Fraunces', serif" }}>
              {isLoadingProfile ? <Skeleton className="h-6 w-48" /> : professionalName}
            </h1>
            <p className="text-muted-foreground font-medium mb-1">
              {profile?.specialty || "Especialista"}
            </p>
            {profile?.bio && (
              <p className="text-xs text-muted-foreground max-w-xl mt-1 leading-relaxed line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>
        </motion.div>

        {/* Main Booking Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-heavy rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[550px] relative z-10"
        >

          {/* Left Sidebar (Summary) */}
          <div className="w-full md:w-1/3 bg-muted/30 p-6 border-b md:border-b-0 md:border-r border-border">
            <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Resumen de tu cita</h3>

            {!selectedService ? (
              <p className="text-sm text-gray-500 italic">Selecciona un servicio para comenzar.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {(() => {
                      const IconComp = getIcon(selectedService.type, selectedService.iconName);
                      return <IconComp className="w-4 h-4 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedService.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" /> {selectedService.duration} min
                      <MapPin className="w-3 h-3 ml-2" /> {selectedService.type === "VIDEO" ? "Videollamada" : "Presencial"}
                    </p>
                    <p className="text-xs font-bold text-primary mt-1.5">
                      {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(selectedService.price)}
                    </p>
                  </div>
                </div>

                {selectedDate && (
                  <div className="flex gap-3 border-t border-border/50 pt-4">
                    <div className="mt-0.5"><Calendar className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Fecha y Hora</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                        {selectedTime ? `, ${selectedTime}` : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step > 0 && (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#A9B3A2] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Volver atrás
              </button>
            )}
          </div>

          {/* Right Content Area */}
          <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col">
            <AnimatePresence mode="wait">
            {/* Step 0: Service Selection */}
            {step === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "'Fraunces', serif" }}>Selecciona un servicio</h2>
                {isLoadingServices ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-5 md:p-6 rounded-[2rem] border border-border flex items-center gap-5">
                        <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                          <div className="flex gap-4 mt-2">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-14" />
                          </div>
                        </div>
                        <Skeleton className="w-8 h-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : services.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm">No hay servicios públicos disponibles.</div>
                ) : (
                  <div className="space-y-4">
                    {services.map(service => {
                      const IconComp = getIcon(service.type, service.iconName);
                      return (
                        <div
                          key={service.id}
                          onClick={() => handleServiceSelect(service)}
                          className="p-5 md:p-6 rounded-[2rem] border border-border hover:border-primary hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all duration-300 flex items-center gap-5 bg-card/50 hover:-translate-y-1"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-primary flex-shrink-0 shadow-inner">
                            <IconComp className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-base mb-1">{service.name}</h3>
                            {service.description && <p className="text-xs text-gray-500 mb-2">{service.description}</p>}
                            <div className="flex items-center gap-4 text-[11px] font-semibold text-[#A9B3A2] uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} min</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {service.type === "VIDEO" ? "Virtual" : "Presencial"}</span>
                              <span className="text-primary font-bold">
                                {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(service.price)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary hover:text-primary">
                              <ChevronLeft className="w-4 h-4 rotate-180" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 1: Date Selection */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "'Fraunces', serif" }}>Selecciona una fecha</h2>
                <div className="flex justify-center border border-border rounded-2xl p-4 bg-card/50 backdrop-blur-sm">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={es}
                    disabled={{ before: new Date() }}
                    modifiersClassNames={{
                      selected: "bg-primary text-white hover:bg-primary/90 font-bold shadow-md",
                      today: "font-bold text-primary"
                    }}
                    styles={{
                      day: { borderRadius: '16px' }
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Time Selection */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Horarios disponibles
                </h2>
                <p className="text-muted-foreground text-sm mb-6 capitalize">
                  {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </p>

                {isLoadingTimes ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : availableTimes.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm italic">
                    No hay horarios de atención configurados o disponibles para este día.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className="py-3.5 rounded-2xl border border-primary/30 text-foreground font-semibold hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all duration-300 text-sm cursor-pointer hover:-translate-y-0.5"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Form */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tus datos
                </h2>

                <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nombre completo</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Teléfono móvil</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="+56 9 ..."
                      className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border text-foreground"
                    />
                  </div>

                  <div className="pt-6 mt-auto flex justify-center">
                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full max-w-sm py-4 rounded-2xl text-white font-bold text-[15px] bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transition-all duration-500 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Confirmando reserva..." : "Confirmar cita"}
                    </MagneticButton>
                  </div>
                </form>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
