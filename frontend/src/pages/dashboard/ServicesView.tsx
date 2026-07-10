import { Plus, Video, Building, Activity, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useServices } from "../../hooks/useServices";
import CreateServiceModal from "../../components/dashboard/CreateServiceModal";
import { useToast } from "../../contexts/ToastContext";
import { motion } from "framer-motion";



const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function ServicesView() {
  const { services, toggleStatus, addService, updateService, deleteService } = useServices();
  const { showToast } = useToast();
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any>(null);

  const handleSaveService = (serviceData: { id?: number; uuid?: string; name: string; duration: string; price: string; type: string }) => {
    if (serviceData.id) {
      updateService(serviceData as any);
      showToast("Servicio actualizado exitosamente", "success");
    } else {
      addService(serviceData);
      showToast("Servicio creado exitosamente", "success");
    }
    setServiceToEdit(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col h-full bg-background relative"
    >

      {/* Header */}
      <div className="h-20 border-b border-border flex items-center justify-between px-8 bg-card shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Mis Servicios</h1>
          <p className="text-sm text-muted-foreground">Crea y administra los tipos de eventos que tus clientes pueden reservar.</p>
        </div>
        <button
          onClick={() => setServiceModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          style={{ background: "var(--theme-primary, #C0987A)" }}
        >
          <Plus className="w-5 h-5" /> Nuevo Servicio
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >

          {services.map(service => {
            const Icon = service.icon || Video;
            const isActive = service.status === 'active';

            return (
              <motion.div variants={fadeUp} key={service.id} className={`glass-heavy rounded-[2.5rem] border ${isActive ? 'border-border/50 shadow-md hover:shadow-xl hover:border-primary hover:-translate-y-1' : 'border-border/40 opacity-70'} p-6 transition-all duration-300 relative group flex flex-col`}>

                {/* Actions Dropdown trigger */}
                <button className="absolute top-6 right-6 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-5 h-5" />
                </button>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isActive ? 'bg-muted text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>

                <div className="space-y-2 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duración</span>
                    <span className="font-semibold text-foreground">{service.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precio</span>
                    <span className="font-semibold text-foreground">{service.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Modalidad</span>
                    <span className="font-semibold text-foreground capitalize">{service.type === 'video' ? 'Virtual' : 'Presencial'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(service.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-[#A9B3A2]' : 'bg-muted'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isActive ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setServiceToEdit(service); setServiceModalOpen(true); }}
                      className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { 
                        if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
                          deleteService(service.id, service.uuid); 
                          showToast("Servicio eliminado exitosamente", "success");
                        }
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )
          })}

          {/* Add New Card (Empty State style) */}
          <motion.div variants={fadeUp}>
            <button
              onClick={() => setServiceModalOpen(true)}
              className="bg-transparent border-2 border-dashed border-border/60 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-primary hover:bg-muted/30 hover:border-primary hover:-translate-y-1 transition-all duration-300 min-h-[280px] cursor-pointer group w-full h-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                <Plus className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Crear nuevo servicio</h3>
              <p className="text-sm text-muted-foreground text-center mt-2 px-4">Añade diferentes duraciones o precios a tu oferta.</p>
            </button>
          </motion.div>

        </motion.div>
      </div>

      <CreateServiceModal 
        isOpen={isServiceModalOpen} 
        onClose={() => { setServiceModalOpen(false); setServiceToEdit(null); }} 
        onSave={handleSaveService} 
        serviceToEdit={serviceToEdit}
      />
    </motion.div>
  );
}
