import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Clock, BriefcaseMedical, CheckCircle } from "lucide-react";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8] text-[#2C2A29]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-black/5 bg-white">
        <span className="text-[17px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>Agenda Fácil</span>
        <div className="text-sm font-medium text-[#7E7870]">Paso {step} de 3</div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5">
          
          {/* Progress bar */}
          <div className="flex justify-between mb-12 relative">
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
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
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
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                <h1 className="text-3xl font-bold mb-2 text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>Define tu horario</h1>
                <p className="text-[#7E7870] mb-8">¿Cuándo estás disponible para recibir citas?</p>
                
                <div className="space-y-3">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#D1CEC4] rounded-xl bg-white hover:border-[#C0987A] transition-colors gap-3 sm:gap-0">
                      <label className="flex items-center gap-3 font-medium text-[#4A4641]">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-[#C0987A] rounded border-[#D1CEC4] focus:ring-2 focus:ring-[#C0987A] outline-none accent-[#C0987A]" />
                        {day}
                      </label>
                      <div className="flex items-center gap-2 text-sm text-[#7E7870] pl-7 sm:pl-0">
                        <select className="px-2 py-1.5 border border-[#D1CEC4] rounded-md bg-white outline-none focus:border-[#C0987A]"><option>09:00</option></select>
                        <span>-</span>
                        <select className="px-2 py-1.5 border border-[#D1CEC4] rounded-md bg-white outline-none focus:border-[#C0987A]"><option>18:00</option></select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
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
                      <select className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-white focus:ring-2 focus:ring-[#C0987A] outline-none">
                        <option>30 minutos</option>
                        <option selected>50 minutos</option>
                        <option>60 minutos</option>
                      </select>
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
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-black/5">
              <button 
                onClick={() => setStep(step - 1)} 
                className={`px-4 sm:px-6 py-3 font-semibold text-[#7E7870] hover:text-[#2C2A29] transition-colors ${step === 1 ? 'invisible' : ''}`}
              >
                Atrás
              </button>
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
