import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export default function AnalyticsView() {
  const { showToast } = useToast();
  const stats = [
    { title: "Ingresos (Mes)", value: "$450.000", change: "+12%", positive: true, icon: DollarSign },
    { title: "Citas Completadas", value: "32", change: "+5%", positive: true, icon: Calendar },
    { title: "Nuevos Clientes", value: "8", change: "-2%", positive: false, icon: Users },
    { title: "Tasa de Asistencia", value: "95%", change: "+1%", positive: true, icon: TrendingUp },
  ];

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular latencia de red
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FCFBF8] animate-in fade-in duration-300 overflow-y-auto">
      
      {/* Header */}
      <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>Analíticas</h1>
          <p className="text-sm text-[#7E7870]">Mide el rendimiento de tu negocio este mes.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => showToast("La IA está generando insights a partir de tus datos...")}
            className="flex items-center gap-2 px-4 py-2 bg-[#C0987A]/10 text-[#C0987A] rounded-xl font-bold hover:bg-[#C0987A]/20 transition-colors shadow-sm text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Insights con IA
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {isLoading 
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse"></div>
                    <div className="w-16 h-6 rounded-full bg-gray-100 animate-pulse"></div>
                  </div>
                  <div className="w-24 h-4 rounded bg-gray-100 animate-pulse mb-3"></div>
                  <div className="w-32 h-8 rounded bg-gray-100 animate-pulse"></div>
                </div>
              ))
            : stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:border-[#C0987A]/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F3EFE9] flex items-center justify-center text-[#C0987A]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[#7E7870] mb-1">{stat.title}</h3>
                    <div className="text-3xl font-bold text-[#2C2A29]">{stat.value}</div>
                  </div>
                )
              })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg text-[#2C2A29]">Citas por semana</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#C0987A]"></div> Realizadas</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-200"></div> Canceladas</div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-64 flex items-end justify-between gap-2 px-2 mt-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2">
                    <div className="w-1/2 md:w-16 h-full bg-gray-100 rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                    <div className="w-10 h-3 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {[
                  { label: 'Sem 1', val: 60, fail: 10 },
                  { label: 'Sem 2', val: 80, fail: 5 },
                  { label: 'Sem 3', val: 40, fail: 20 },
                  { label: 'Sem 4', val: 90, fail: 0 },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                    <div className="w-full flex justify-center items-end h-full gap-1">
                      {/* Success Bar */}
                      <div 
                        className="w-1/2 md:w-8 bg-[#C0987A] rounded-t-md transition-all group-hover:opacity-80" 
                        style={{ height: `${bar.val}%` }}
                        title={`${bar.val}% completadas`}
                      ></div>
                      {/* Fail Bar */}
                      <div 
                        className="w-1/2 md:w-8 bg-gray-200 rounded-t-md transition-all group-hover:opacity-80" 
                        style={{ height: `${bar.fail}%` }}
                        title={`${bar.fail}% canceladas`}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{bar.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Breakdown Chart */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg text-[#2C2A29] mb-8">Servicios más populares</h3>
            
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse space-y-8 mt-4">
                <div className="w-48 h-48 rounded-full border-[16px] border-gray-100"></div>
                <div className="w-full space-y-4">
                  <div className="w-full h-4 bg-gray-100 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-100 rounded"></div>
                  <div className="w-5/6 h-4 bg-gray-100 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center justify-center relative">
                  {/* Fake Donut Chart via CSS borders */}
                  <div className="w-48 h-48 rounded-full border-[16px] border-[#F3EFE9] relative flex items-center justify-center">
                    {/* Simulated segments via absolute positioning (simplified) */}
                    <div className="absolute inset-[-16px] rounded-full border-[16px] border-t-[#C0987A] border-r-[#C0987A] border-b-transparent border-l-transparent rotate-45"></div>
                    <div className="absolute inset-[-16px] rounded-full border-[16px] border-t-transparent border-r-transparent border-b-[#A9B3A2] border-l-transparent rotate-[-15deg]"></div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#2C2A29]">32</div>
                      <div className="text-xs font-semibold text-gray-400">Total</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 font-medium"><div className="w-3 h-3 rounded bg-[#C0987A]"></div> Consulta (50%)</span>
                    <span className="font-bold text-[#2C2A29]">16</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 font-medium"><div className="w-3 h-3 rounded bg-[#A9B3A2]"></div> Terapia (25%)</span>
                    <span className="font-bold text-[#2C2A29]">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 font-medium"><div className="w-3 h-3 rounded bg-[#F3EFE9]"></div> Evaluación (25%)</span>
                    <span className="font-bold text-[#2C2A29]">8</span>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
