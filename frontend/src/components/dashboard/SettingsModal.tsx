import { X, User, Bell, Shield, Palette, Link2, Settings as SettingsIcon, LogOut, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useAuth, API_BASE_URL } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useGoogleCalendar } from "../../hooks/useGoogleCalendar";

const DARK = "#2C2A29";

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("profile");
  const { showToast } = useToast();
  const { user, token, updateUser, logout } = useAuth();
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConnected, connect, disconnect } = useGoogleCalendar();

  const handleGoogleLogin = () => {
    // Modo Simulado
    connect("simulated_google_token_123");
  };

  // Profile states
  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4 transition-all">
      <div 
        className="bg-card/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-3xl shadow-2xl shadow-primary/10 overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300 flex h-[600px] text-foreground"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "profile" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <User className="w-4 h-4" /> Perfil
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "notifications" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <Bell className="w-4 h-4" /> Notificaciones
              </button>
              <button 
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "privacy" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <Shield className="w-4 h-4" /> Privacidad
              </button>
              <button 
                onClick={() => setActiveTab("appearance")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "appearance" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
              >
                <Palette className="w-4 h-4" /> Apariencia
              </button>
              <button 
                onClick={() => setActiveTab("integrations")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "integrations" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`}
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
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-sm overflow-hidden">
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
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none text-sm bg-muted/30 text-foreground" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Apellido</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none text-sm bg-muted/30 text-foreground" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none text-sm bg-muted/30 text-foreground" 
                  />
                </div>
                
                <div className="pt-4 border-t border-border flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg cursor-pointer" style={{ background: "var(--theme-primary, #C0987A)" }}
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
                  <div className="flex items-center justify-between p-5 border border-border rounded-2xl hover:border-primary/50 transition-colors bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2.5">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#4285F4"/><path d="M16 11H13V8H11V11H8V13H11V16H13V13H16V11Z" fill="white"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Google Calendar</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isConnected ? "Sincronización activa en tiempo real." : "Sincroniza tus eventos en tiempo real."}
                        </p>
                      </div>
                    </div>
                    {isConnected ? (
                      <button 
                        onClick={() => disconnect()}
                        className="px-4 py-2 border-2 border-red-500/50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        Desconectar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleGoogleLogin()}
                        className="px-4 py-2 border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        Conectar
                      </button>
                    )}
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
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Apariencia</h3>
                  <p className="text-sm text-muted-foreground">Personaliza el aspecto visual de tu panel.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  {/* Tema del sistema */}
                  <div className="flex items-center justify-between p-5 border border-border rounded-2xl bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2.5">
                        <Palette className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Modo Oscuro</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Cambia entre tema claro y oscuro (Persistente).</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={toggleTheme}
                      className="px-4 py-2 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      {theme === 'dark' ? 'Activar Tema Claro' : 'Activar Tema Oscuro'}
                    </button>
                  </div>

                  {/* Color de Acento */}
                  <div className="p-5 border border-border rounded-2xl bg-muted/10 space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2.5">
                        <Sparkles className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Color de Marca</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Elige el color principal para tu panel.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                      {[
                        { name: "Bronce (Original)", hex: "#C0987A" },
                        { name: "Esmeralda", hex: "#4E7A6B" },
                        { name: "Azul Pizarra", hex: "#5D707F" },
                        { name: "Amatista", hex: "#7B6282" },
                        { name: "Ámbar Oscuro", hex: "#B37A4C" }
                      ].map((color) => (
                        <button
                          key={color.hex}
                          onClick={() => setAccentColor(color.hex)}
                          className={`w-10 h-10 rounded-full cursor-pointer transition-all ${accentColor === color.hex ? 'ring-2 ring-offset-2 ring-offset-background scale-110 shadow-md' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: color.hex, ringColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Notificaciones</h3>
                  <p className="text-sm text-muted-foreground">Controla cómo y cuándo quieres recibir alertas.</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  {/* Alertas de nueva cita */}
                  <div className="flex items-center justify-between p-5 border border-border rounded-2xl bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2.5">
                        <Bell className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Alertas Push en el Navegador</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Recibe notificaciones en tiempo real al tener la app abierta.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${pushNotifications ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Sonido */}
                  <div className="flex items-center justify-between p-5 border border-border rounded-2xl bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2.5">
                        <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Sonidos de Notificación</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Reproducir un sonido cuando alguien agende una cita.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${soundEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Correos */}
                  <div className="flex items-center justify-between p-5 border border-border rounded-2xl bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center p-2.5">
                        <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Resumen por Correo</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Recibir un correo diario con las citas del día siguiente.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${emailNotifications ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex justify-end">
                    <button 
                      onClick={() => showToast("Preferencias de notificaciones guardadas", "success")}
                      className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg cursor-pointer" style={{ background: "var(--theme-primary, #C0987A)" }}
                    >
                      Guardar Preferencias
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
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
