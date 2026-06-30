import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { Calendar, Clock, MapPin, ChevronLeft, Video, Building, Activity, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../contexts/AuthContext";
import "react-day-picker/dist/style.css";

const PRIMARY = "#C0987A";

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
    <div className="min-h-screen bg-[#FCFBF8] py-12 px-4 flex items-center justify-center relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Botón Volver */}
      <Link to="/dashboard" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#C0987A] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <div className="max-w-4xl w-full">

        {/* Header / Profile */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl text-white font-bold" style={{ background: PRIMARY }}>
            {isLoadingProfile ? "..." : professionalName.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>
              {isLoadingProfile ? "Cargando perfil..." : professionalName}
            </h1>
            <p className="text-[#7E7870] font-medium mb-1">
              {profile?.specialty || "Especialista"}
            </p>
            {profile?.bio && (
              <p className="text-xs text-gray-500 max-w-xl mt-1 leading-relaxed line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Main Booking Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden flex flex-col md:flex-row min-h-[500px]">

          {/* Left Sidebar (Summary) */}
          <div className="w-full md:w-1/3 bg-[#F3EFE9]/50 p-6 border-b md:border-b-0 md:border-r border-[#D1CEC4]">
            <h3 className="font-bold text-[#2C2A29] mb-4 uppercase tracking-wider text-xs">Resumen de tu cita</h3>

            {!selectedService ? (
              <p className="text-sm text-gray-500 italic">Selecciona un servicio para comenzar.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {(() => {
                      const IconComp = getIcon(selectedService.type, selectedService.iconName);
                      return <IconComp className="w-4 h-4 text-[#C0987A]" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A4641]">{selectedService.name}</p>
                    <p className="text-xs text-[#7E7870] flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" /> {selectedService.duration} min
                      <MapPin className="w-3 h-3 ml-2" /> {selectedService.type === "VIDEO" ? "Videollamada" : "Presencial"}
                    </p>
                    <p className="text-xs font-bold text-[#C0987A] mt-1.5">
                      {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(selectedService.price)}
                    </p>
                  </div>
                </div>

                {selectedDate && (
                  <div className="flex gap-3 border-t border-[#D1CEC4]/50 pt-4">
                    <div className="mt-0.5"><Calendar className="w-4 h-4 text-[#C0987A]" /></div>
                    <div>
                      <p className="text-sm font-semibold text-[#4A4641]">Fecha y Hora</p>
                      <p className="text-sm text-[#7E7870] capitalize">
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
                className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#C0987A] hover:text-[#A9B3A2] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Volver atrás
              </button>
            )}
          </div>

          {/* Right Content Area */}
          <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col">

            {/* Step 0: Service Selection */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#2C2A29] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>Selecciona un servicio</h2>
                {isLoadingServices ? (
                  <div className="py-12 text-center text-gray-500 text-sm">Cargando catálogo de servicios...</div>
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
                          className="p-5 rounded-2xl border border-gray-200 hover:border-[#C0987A] hover:shadow-md cursor-pointer transition-all flex items-center gap-4 bg-white"
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#F3EFE9] flex items-center justify-center text-[#C0987A] flex-shrink-0">
                            <IconComp className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-[#2C2A29] text-base mb-1">{service.name}</h3>
                            {service.description && <p className="text-xs text-gray-500 mb-2">{service.description}</p>}
                            <div className="flex items-center gap-4 text-[11px] font-semibold text-[#A9B3A2] uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} min</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {service.type === "VIDEO" ? "Virtual" : "Presencial"}</span>
                              <span className="text-[#C0987A] font-bold">
                                {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(service.price)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 hover:border-[#C0987A] hover:text-[#C0987A]">
                              <ChevronLeft className="w-4 h-4 rotate-180" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Date Selection */}
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

            {/* Step 2: Time Selection */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#2C2A29] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Horarios disponibles
                </h2>
                <p className="text-[#7E7870] text-sm mb-6 capitalize">
                  {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </p>

                {isLoadingTimes ? (
                  <div className="py-12 text-center text-gray-500 text-sm">Consultando horarios disponibles...</div>
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
                        className="py-3 rounded-xl border border-[#C0987A]/30 text-[#4A4641] font-semibold hover:border-[#C0987A] hover:bg-[#C0987A]/5 transition-all text-sm cursor-pointer"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Form */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-[#2C2A29] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tus datos
                </h2>

                <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Nombre completo</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4641] mb-1">Teléfono móvil</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="+56 9 ..."
                      className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="pt-6 mt-auto">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                      style={{ background: PRIMARY }}
                    >
                      {isSubmitting ? "Confirmando reserva..." : "Confirmar cita"}
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
