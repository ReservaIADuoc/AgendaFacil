import { useState } from "react";
import { Link, Outlet, useParams } from "react-router";
import CopilotChat from "../components/shared/CopilotChat";
import { Calendar, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const PRIMARY = "#C0987A";

function Nav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { token } = useAuth();

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center">
      <div className="w-full max-w-6xl bg-card/80 backdrop-blur-lg border border-border shadow-sm rounded-2xl h-16 flex items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: PRIMARY }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Agenda Fácil
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          <Link to="/features" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Funciones</Link>
          <Link to="/pricing" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Precios</Link>
          <Link to="/testimonials" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonios</Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {token ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-sm"
              style={{ background: PRIMARY }}
            >
              Ir al Panel de Control
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-[13px] font-semibold text-foreground hover:opacity-70 transition-colors ml-2">Iniciar sesión</Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-sm"
                style={{ background: PRIMARY }}
              >
                Empezar gratis
              </Link>
            </>
          )}
        </div>
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-muted-foreground">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-card border border-border shadow-lg rounded-2xl px-5 py-4 space-y-3">
          <Link to="/features" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-foreground py-1">Funciones</Link>
          <Link to="/pricing" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-foreground py-1">Precios</Link>
          <Link to="/testimonials" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-foreground py-1">Testimonios</Link>
          {token ? (
            <Link to="/dashboard" onClick={() => setOpen(false)} className="flex justify-center w-full py-3 rounded-xl text-[14px] font-bold text-white" style={{ background: PRIMARY }}>
              Ir al Panel de Control
            </Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-foreground py-1">Iniciar sesión</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="flex justify-center w-full py-3 rounded-xl text-[14px] font-bold text-white" style={{ background: PRIMARY }}>
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function Footer() {
  const cols = [
    { title: "Producto", links: ["Funciones", "Precios", "Integraciones", "App móvil", "Actualizaciones"] },
    { title: "Para quién", links: ["Psicólogos", "Coaches", "Abogados", "Fisioterapeutas", "Médicos"] },
    { title: "Empresa", links: ["Sobre nosotros", "Blog", "Prensa", "Empleo", "Contacto"] },
  ];
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: PRIMARY }}>
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>Agenda Fácil</span>
            </Link>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[180px]">
              La plataforma de gestión de citas para profesionales independientes.
            </p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-[12px] font-bold text-primary opacity-80 uppercase tracking-widest mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => {
                  let path = "#";
                  if (l === "Funciones") path = "/features";
                  if (l === "Precios") path = "/pricing";
                  return (
                    <li key={l}>
                      {path === "#" ? (
                        <a href="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                      ) : (
                        <Link to={path} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">{l}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12px] text-muted-foreground">© 2026 Agenda Fácil. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            {["Privacidad","Términos","Cookies"].map(l => (
              <a key={l} href="#" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { username } = useParams();
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Nav />
      <main className="pt-24">
        <Outlet />
      </main>
      <CopilotChat mode={username ? "client" : "professional"} username={username} />
      <Footer />
    </div>
  );
}
