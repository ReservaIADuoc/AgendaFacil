import { Plus, Video, Building, Activity, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

const mockServices = [
  { id: 1, name: "Consulta General", duration: "60 min", price: "$50.000", type: "video", status: "active", icon: Video },
  { id: 2, name: "Terapia de Pareja", duration: "90 min", price: "$80.000", type: "presencial", status: "active", icon: Building },
  { id: 3, name: "Evaluación Inicial", duration: "45 min", price: "$40.000", type: "video", status: "inactive", icon: Activity },
];

export default function ServicesView() {
  const [services, setServices] = useState(mockServices);

  const toggleStatus = (id: number) => {
    setServices(services.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FCFBF8] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>Mis Servicios</h1>
          <p className="text-sm text-[#7E7870]">Crea y administra los tipos de eventos que tus clientes pueden reservar.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl font-bold text-white shadow-sm hover:opacity-90 transition-all flex items-center gap-2" style={{ background: PRIMARY }}>
          <Plus className="w-5 h-5" /> Nuevo Servicio
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {services.map(service => {
            const Icon = service.icon;
            const isActive = service.status === 'active';
            
            return (
              <div key={service.id} className={`bg-white rounded-3xl border ${isActive ? 'border-gray-200 shadow-sm hover:border-[#C0987A]' : 'border-gray-100 opacity-60'} p-6 transition-all relative group flex flex-col`}>
                
                {/* Actions Dropdown trigger (visual only) */}
                <button className="absolute top-6 right-6 p-1 text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-5 h-5" />
                </button>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isActive ? 'bg-[#F3EFE9] text-[#C0987A]' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-[#2C2A29] mb-2">{service.name}</h3>
                
                <div className="space-y-2 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7E7870]">Duración</span>
                    <span className="font-semibold text-[#4A4641]">{service.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7E7870]">Precio</span>
                    <span className="font-semibold text-[#4A4641]">{service.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7E7870]">Modalidad</span>
                    <span className="font-semibold text-[#4A4641] capitalize">{service.type === 'video' ? 'Virtual' : 'Presencial'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(service.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-[#A9B3A2]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-[#A9B3A2]' : 'text-gray-400'}`}>
                      {isActive ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

              </div>
            )
          })}

          {/* Add New Card (Empty State style) */}
          <button className="bg-transparent border-2 border-dashed border-[#D1CEC4] rounded-3xl p-6 flex flex-col items-center justify-center text-[#C0987A] hover:bg-[#F3EFE9]/30 hover:border-[#C0987A] transition-all min-h-[280px]">
            <div className="w-14 h-14 rounded-full bg-[#F3EFE9] flex items-center justify-center mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Crear nuevo servicio</h3>
            <p className="text-sm text-[#7E7870] text-center mt-2 px-4">Añade diferentes duraciones o precios a tu oferta.</p>
          </button>

        </div>
      </div>
    </div>
  );
}
