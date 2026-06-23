import { X, User, Bell, Shield, Palette, Link2, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../contexts/ToastContext";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("profile");
  const { showToast } = useToast();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-black/5 animate-in fade-in zoom-in-95 duration-200 flex h-[600px]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Sidebar */}
        <div className="w-64 bg-[#FCFBF8] border-r border-gray-100 flex flex-col">
          <div className="p-6">
            <h2 className="text-[18px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
              Configuración
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "profile" ? "bg-white shadow-sm text-[#C0987A]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <User className="w-4 h-4" /> Perfil
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "notifications" ? "bg-white shadow-sm text-[#C0987A]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <Bell className="w-4 h-4" /> Notificaciones
            </button>
            <button 
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "privacy" ? "bg-white shadow-sm text-[#C0987A]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <Shield className="w-4 h-4" /> Privacidad
            </button>
            <button 
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "appearance" ? "bg-white shadow-sm text-[#C0987A]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <Palette className="w-4 h-4" /> Apariencia
            </button>
            <button 
              onClick={() => setActiveTab("integrations")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "integrations" ? "bg-white shadow-sm text-[#C0987A]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <Link2 className="w-4 h-4" /> Integraciones
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex justify-end p-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-10 pb-10">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-[#2C2A29] mb-1">Tu Perfil</h3>
                  <p className="text-sm text-gray-500">Gestiona tu información personal e identidad pública.</p>
                </div>
                
                <div className="flex items-center gap-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-[#C0987A] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                    VR
                  </div>
                  <div>
                    <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      Cambiar avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nombre</label>
                    <input type="text" defaultValue="Valentina" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:outline-none text-sm bg-gray-50/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Apellido</label>
                    <input type="text" defaultValue="Rojas" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:outline-none text-sm bg-gray-50/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Correo Electrónico</label>
                  <input type="email" defaultValue="valentina@agendafacil.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:outline-none text-sm bg-gray-50/50" />
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => { showToast("Perfil actualizado correctamente"); onClose(); }}
                    className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg" style={{ background: PRIMARY }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === "integrations" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-[#2C2A29] mb-1">Integraciones</h3>
                  <p className="text-sm text-gray-500">Conecta Agenda Fácil con tus herramientas favoritas.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  
                  {/* Google Calendar */}
                  <div className="flex items-center justify-between p-5 border border-gray-200 rounded-2xl hover:border-[#C0987A]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center p-2.5">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#4285F4"/><path d="M16 11H13V8H11V11H8V13H11V16H13V13H16V11Z" fill="white"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2C2A29]">Google Calendar</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Sincroniza tus eventos en tiempo real.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast("Google Calendar conectado", "success")}
                      className="px-4 py-2 border-2 border-[#C0987A] text-[#C0987A] rounded-xl text-sm font-bold hover:bg-[#C0987A]/5 transition-colors"
                    >
                      Conectar
                    </button>
                  </div>

                  {/* Zoom */}
                  <div className="flex items-center justify-between p-5 border border-gray-200 rounded-2xl hover:border-[#C0987A]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2D8CFF] rounded-xl flex items-center justify-center p-2.5">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 8L21 5.5V18.5L17 16V8Z" fill="white"/><rect x="3" y="6" width="14" height="12" rx="2" fill="white"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2C2A29]">Zoom</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Genera enlaces automáticos para videollamadas.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border-2 border-gray-200 text-gray-400 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed">
                      Próximamente
                    </button>
                  </div>

                </div>
              </div>
            )}

            {activeTab !== "profile" && activeTab !== "integrations" && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-[#FCFBF8] border border-gray-100 flex items-center justify-center mb-4">
                  <SettingsIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-[#2C2A29] mb-2">Próximamente</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Esta sección de configuración estará disponible en la próxima actualización de Agenda Fácil.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
