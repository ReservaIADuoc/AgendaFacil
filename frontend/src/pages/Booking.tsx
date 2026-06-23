import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { Calendar, Clock, MapPin, ChevronLeft, Video, Building, Activity } from "lucide-react";
import "react-day-picker/dist/style.css";

const PRIMARY = "#C0987A";

type Service = {
  id: string;
  name: string;
  duration: number;
  type: "video" | "presencial";
  icon: any;
  description: string;
};

const SERVICES: Service[] = [
  {
    id: "consulta",
    name: "Consulta General",
    duration: 60,
    type: "video",
    icon: Video,
    description: "Sesión estándar para tratar diversos temas personales."
  },
  {
    id: "terapia",
    name: "Terapia de Pareja",
    duration: 90,
    type: "presencial",
    icon: Building,
    description: "Sesión conjunta orientada a mejorar la comunicación."
  },
  {
    id: "evaluacion",
    name: "Evaluación Inicial",
    duration: 45,
    type: "video",
    icon: Activity,
    description: "Primera entrevista para entender tu caso y objetivos."
  }
];

export default function Booking() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  // Step 0: Service | Step 1: Date | Step 2: Time | Step 3: Form
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Mock data based on username
  const professionalName = username ? username.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Valentina Rojas";
  const availableTimes = ["09:00", "09:30", "10:00", "11:00", "14:00", "15:30", "16:00"];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call, then redirect to success
    navigate(`/book/${username || 'valentina-rojas'}/success`, { 
      state: { 
        professionalName,
        serviceName: selectedService?.name,
        date: selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es }) : "",
        time: selectedTime 
      }
    });
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
            {professionalName.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>{professionalName}</h1>
            <p className="text-[#7E7870] font-medium mb-2">Agenda tu cita en línea</p>
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
                  <div className="mt-0.5"><Activity className="w-4 h-4 text-[#C0987A]" /></div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A4641]">{selectedService.name}</p>
                    <p className="text-xs text-[#7E7870] flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3" /> {selectedService.duration} min
                      <MapPin className="w-3 h-3 ml-2" /> {selectedService.type === 'video' ? 'Videollamada' : 'Presencial'}
                    </p>
                  </div>
                </div>

                {selectedDate && (
                  <div className="flex gap-3 border-t border-[#D1CEC4]/50 pt-4">
                    <div className="mt-0.5"><Calendar className="w-4 h-4 text-[#C0987A]" /></div>
                    <div>
                      <p className="text-sm font-semibold text-[#4A4641]">Fecha y Hora</p>
                      <p className="text-sm text-[#7E7870]">
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
                className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#C0987A] hover:text-[#A9B3A2] transition-colors"
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
                <div className="space-y-4">
                  {SERVICES.map(service => {
                    const Icon = service.icon;
                    return (
                      <div 
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="p-5 rounded-2xl border border-gray-200 hover:border-[#C0987A] hover:shadow-md cursor-pointer transition-all flex items-center gap-4 bg-white"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#F3EFE9] flex items-center justify-center text-[#C0987A] flex-shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-[#2C2A29] text-base mb-1">{service.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#A9B3A2] uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} min</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {service.type === 'video' ? 'Virtual' : 'Presencial'}</span>
                          </div>
                        </div>
                        <div>
                          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-[#C0987A] group-hover:text-[#C0987A]">
                            <ChevronLeft className="w-4 h-4 rotate-180" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
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

            {/* Step 3: Form */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-[#2C2A29] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
                  Tus datos
                </h2>
                
                <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
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
                    <button type="submit" className="w-full py-4 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all shadow-md" style={{ background: PRIMARY }}>
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
