import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Calendar as CalendarIcon, Menu, Search, HelpCircle, Users, BarChart2, Briefcase, Plus, Bell, Sun, Moon } from "lucide-react";
import SearchModal from "../components/dashboard/SearchModal";
import SettingsModal from "../components/dashboard/SettingsModal";
import HelpModal from "../components/dashboard/HelpModal";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
import CopilotChat from "../components/shared/CopilotChat";
import { useTheme } from "../contexts/ThemeContext";

const PRIMARY = "#C0987A";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Modal State
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  
  const { theme, toggleTheme } = useTheme();

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
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
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
          <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><Search className="w-5 h-5" /></button>
          
          <div className="relative">
            <button onClick={() => setNotificationsOpen(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          
          <button onClick={() => setHelpOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors hidden sm:block"><HelpCircle className="w-5 h-5" /></button>
          
          {/* Botón Dark Mode */}
          <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div 
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-[#C0987A] flex items-center justify-center text-white font-bold ml-2 cursor-pointer shadow-sm border-2 border-white dark:border-gray-800 hover:scale-105 transition-transform"
            title="Tu Perfil"
          >
            VR
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 flex flex-col p-4 overflow-y-auto bg-card border-r border-border">
            <button className="flex items-center gap-3 bg-card border border-border shadow-sm rounded-full py-3 px-5 hover:shadow-md hover:bg-muted transition-all w-max mb-6">
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
              <Link to="/book/valentina-rojas" target="_blank" className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 rounded-xl cursor-pointer text-sm transition-colors text-muted-foreground">
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
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <CopilotChat />
    </div>
  );
}
