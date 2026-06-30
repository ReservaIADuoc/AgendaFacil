import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Calendar as CalendarIcon, Menu, Search, HelpCircle, Users, BarChart2, Briefcase, Plus, Bell, Sun, Moon } from "lucide-react";
import SearchModal from "../components/dashboard/SearchModal";
import SettingsModal from "../components/dashboard/SettingsModal";
import HelpModal from "../components/dashboard/HelpModal";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
import CopilotChat from "../components/shared/CopilotChat";
import { useTheme } from "../contexts/ThemeContext";
import CreateAppointmentModal from "../components/dashboard/CreateAppointmentModal";
import { useAppointments } from "../hooks/useAppointments";
import { useClients } from "../hooks/useClients";
import { useServices } from "../hooks/useServices";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const PRIMARY = "#C0987A";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Modal States
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const { clients } = useClients();
  const { services } = useServices();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Global Creation State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { addAppointment } = useAppointments();

  const handleGlobalAppointmentSave = async (newEvent: any) => {
    await addAppointment(newEvent);
    setCreateModalOpen(false);
    showToast("Cita agendada correctamente", "success");
    window.dispatchEvent(new CustomEvent("appointment-created"));
  };

  const SERVICE_COLORS = ["#C0987A", "#D9A05B", "#A9B3A2", "#7E9E87", "#B8936A"];
  const clientOptions = clients.filter((c) => c.uuid).map((c) => ({ uuid: c.uuid!, name: c.name, email: c.email }));
  const serviceOptions = services.map((s, i) => ({
    uuid: s.uuid,
    name: s.name,
    durationMinutes: s.durationMinutes,
    colorHex: SERVICE_COLORS[i % SERVICE_COLORS.length],
  }));

  const getInitials = (name?: string) => {
    if (!name) return "VR";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };
  const initials = getInitials(user?.name);

  // Notifications State
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    const handleRead = () => setUnreadCount(0);
    window.addEventListener("notifications-read", handleRead);
    return () => {
      window.removeEventListener("notifications-read", handleRead);
    };
  }, []);

  const navItems = [
    { name: "Calendario", path: "/dashboard", icon: CalendarIcon },
    { name: "Clientes", path: "/dashboard/clients", icon: Users },
    { name: "Servicios", path: "/dashboard/services", icon: Briefcase },
    { name: "Analíticas", path: "/dashboard/analytics", icon: BarChart2 },
  ];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Navbar */}
      <header className="h-16 border-b border-border flex items-center px-4 justify-between shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary">
              <CalendarIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-[20px] font-medium text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
              Agenda Fácil
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><Search className="w-5 h-5" /></button>
          
          <div className="relative">
            <button onClick={() => setNotificationsOpen(true)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
            </button>
            {unreadCount > 0 && (
              <div className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card"></div>
            )}
          </div>
          
          <button onClick={() => setHelpOpen(true)} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:block"><HelpCircle className="w-5 h-5" /></button>
          
          {/* Botón Dark Mode */}
          <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div 
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-[#C0987A] flex items-center justify-center text-white font-bold ml-2 cursor-pointer shadow-sm border-2 border-card hover:scale-105 transition-transform overflow-hidden"
            title="Tu Perfil"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>
      </header>

      {/* Modal states */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 flex flex-col p-4 overflow-y-auto bg-card border-r border-border">
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-3 bg-card border border-border shadow-sm rounded-full py-3 px-5 hover:shadow-md hover:bg-muted transition-all w-max mb-6 cursor-pointer animate-in fade-in"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">Crear</span>
            </button>
            
            <nav className="space-y-1 mb-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2 px-3">
                <span>Páginas de reserva</span>
                <Plus className="w-4 h-4 cursor-pointer hover:text-foreground" />
              </div>
              <Link to={`/book/${user?.usernameSlug || "valentina-rojas"}`} target="_blank" className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 rounded-xl cursor-pointer text-sm transition-colors text-muted-foreground">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="truncate">Reserva Pública</span>
              </Link>
            </div>
          </aside>
        )}

        {/* Dynamic Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>

      {/* Modals & Panels */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleGlobalAppointmentSave}
        clients={clientOptions}
        services={serviceOptions.filter((s) => s.uuid)}
      />
      <CopilotChat />
    </div>
  );
}
