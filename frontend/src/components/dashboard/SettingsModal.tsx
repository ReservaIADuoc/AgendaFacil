import { X, User, Bell, Shield, Palette, Link2, Settings as SettingsIcon, LogOut, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useAuth, API_BASE_URL } from "../../contexts/AuthContext";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("profile");
  const { showToast } = useToast();
  const { user, token, updateUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile states
  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem("gemini_api_key") || "");

  // Initialize input states when modal opens or user context loads
  useEffect(() => {
    if (isOpen && user) {
      const parts = user.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setAvatar(user.avatarUrl || "");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      showToast("El nombre no puede estar vacío", "error");
      return;
    }
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    try {
      await updateUser(fullName, email, avatar);
      showToast("Perfil actualizado correctamente", "success");
      onClose();
    } catch (e) {
      showToast("Error al guardar cambios de perfil", "error");
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    showToast("Sesión cerrada correctamente", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-card rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200 flex h-[600px] text-foreground"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Sidebar */}
        <div className="w-64 bg-muted/30 border-r border-border flex flex-col justify-between">
          <div>
            <div className="p-6">
              <h2 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
                Configuración
              </h2>
            </div>
            <nav className="px-4 space-y-1">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "profile" ? "bg-card shadow-sm text-[#C0987A]" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <User className="w-4 h-4" /> Perfil
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "notifications" ? "bg-card shadow-sm text-[#C0987A]" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <Bell className="w-4 h-4" /> Notificaciones
              </button>
              <button 
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "privacy" ? "bg-card shadow-sm text-[#C0987A]" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <Shield className="w-4 h-4" /> Privacidad
              </button>
              <button 
                onClick={() => setActiveTab("appearance")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "appearance" ? "bg-card shadow-sm text-[#C0987A]" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <Palette className="w-4 h-4" /> Apariencia
              </button>
              <button 
                onClick={() => setActiveTab("integrations")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "integrations" ? "bg-card shadow-sm text-[#C0987A]" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <Link2 className="w-4 h-4" /> Integraciones
              </button>
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-card">
          <div className="flex justify-end p-4 border-b border-border/45">
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-10 pb-10 pt-6">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Tu Perfil</h3>
                  <p className="text-sm text-muted-foreground">Gestiona tu información personal e identidad pública.</p>
                </div>
                
                <div className="flex items-center gap-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-[#C0987A] flex items-center justify-center text-white text-2xl font-bold shadow-sm overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : user?.name ? (
                      user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                    ) : (
                      "VR"
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/*" 
                      style={{ display: "none" }} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Cambiar avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Nombre</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#C0987A] focus:outline-none text-sm bg-muted/30 text-foreground" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Apellido</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#C0987A] focus:outline-none text-sm bg-muted/30 text-foreground" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#C0987A] focus:outline-none text-sm bg-muted/30 text-foreground" 
                  />
                </div>
                
                <div className="pt-4 border-t border-border flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg cursor-pointer" style={{ background: PRIMARY }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === "integrations" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Integraciones</h3>
                  <p className="text-sm text-muted-foreground">Conecta Agenda Fácil con tus herramientas favoritas.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  
                  {/* Google Calendar */}
                  <div className="flex items-center justify-between p-5 border border-border rounded-2xl hover:border-[#C0987A]/50 transition-colors bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2.5">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#4285F4"/><path d="M16 11H13V8H11V11H8V13H11V16H13V13H16V11Z" fill="white"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Google Calendar</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Sincroniza tus eventos en tiempo real.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast("Google Calendar conectado", "success")}
                      className="px-4 py-2 border-2 border-[#C0987A] text-[#C0987A] rounded-xl text-sm font-bold hover:bg-[#C0987A]/5 transition-colors cursor-pointer"
                    >
                      Conectar
                    </button>
                  </div>

                  {/* Zoom */}
                  <div className="flex items-center justify-between p-5 border border-border rounded-2xl bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2D8CFF] rounded-xl flex items-center justify-center p-2.5">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 8L21 5.5V18.5L17 16V8Z" fill="white"/><rect x="3" y="6" width="14" height="12" rx="2" fill="white"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Zoom</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Genera enlaces automáticos para videollamadas.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-border text-muted-foreground rounded-xl text-sm font-bold opacity-50 cursor-not-allowed">
                      Próximamente
                    </button>
                  </div>

                  {/* Gemini AI */}
                  <div className="flex flex-col gap-4 p-5 border border-border rounded-2xl bg-muted/10 hover:border-[#C0987A]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#C0987A] to-[#D9A05B] rounded-xl flex items-center justify-center p-2.5">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">Google Gemini AI</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Potencia tu Copiloto con inteligencia artificial.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          localStorage.setItem("gemini_api_key", geminiKey);
                          showToast("API Key de Gemini guardada", "success");
                        }}
                        className="px-4 py-2 bg-[#C0987A] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Gemini API Key</label>
                      <input 
                        type="password"
                        placeholder="AIzaSy..."
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-[#C0987A] focus:outline-none text-sm bg-muted/30 text-foreground"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Puedes obtener una API Key gratis en{" "}
                        <a 
                          href="https://aistudio.google.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#C0987A] hover:underline font-semibold"
                        >
                          Google AI Studio
                        </a>.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab !== "profile" && activeTab !== "integrations" && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
                  <SettingsIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Próximamente</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
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
