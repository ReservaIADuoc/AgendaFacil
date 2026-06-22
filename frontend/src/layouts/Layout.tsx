import { useState } from "react";
import { Link, Outlet } from "react-router";
import { Calendar, Menu, X } from "lucide-react";

const PRIMARY = "#C0987A";
const DARK = "#2C2A29";

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center">
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur-lg border border-black/5 shadow-sm rounded-2xl h-16 flex items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: PRIMARY }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
            Agenda Fácil
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          <Link to="/features" className="text-[13px] font-medium text-[#7E7870] hover:text-[#2C2A29] transition-colors">Funciones</Link>
          <Link to="/pricing" className="text-[13px] font-medium text-[#7E7870] hover:text-[#2C2A29] transition-colors">Precios</Link>
          <Link to="/testimonials" className="text-[13px] font-medium text-[#7E7870] hover:text-[#2C2A29] transition-colors">Testimonios</Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-[13px] font-semibold text-[#4A4641] hover:text-[#2C2A29] transition-colors">Iniciar sesión</Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-sm"
            style={{ background: PRIMARY }}
          >
            Empezar gratis
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5 text-[#2C2A29]" /> : <Menu className="w-5 h-5 text-[#2C2A29]" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-white border border-black/5 shadow-lg rounded-2xl px-5 py-4 space-y-3">
          <Link to="/features" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-[#4A4641] py-1">Funciones</Link>
          <Link to="/pricing" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-[#4A4641] py-1">Precios</Link>
          <Link to="/testimonials" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-[#4A4641] py-1">Testimonios</Link>
          <Link to="/login" onClick={() => setOpen(false)} className="block text-[14px] font-medium text-[#4A4641] py-1">Iniciar sesión</Link>
          <Link to="/register" onClick={() => setOpen(false)} className="flex justify-center w-full py-3 rounded-xl text-[14px] font-bold text-white" style={{ background: PRIMARY }}>
            Empezar gratis
          </Link>
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
    <footer className="border-t border-black/5 bg-[#FCFBF8]">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: PRIMARY }}>
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>Agenda Fácil</span>
            </Link>
            <p className="text-[12px] text-[#7E7870] leading-relaxed max-w-[180px]">
              La plataforma de gestión de citas para profesionales independientes.
            </p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-[12px] font-bold text-[#A9B3A2] uppercase tracking-widest mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-[13px] text-[#7E7870] hover:text-[#2C2A29] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-black/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12px] text-[#7E7870]">© 2026 Agenda Fácil. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            {["Privacidad","Términos","Cookies"].map(l => (
              <a key={l} href="#" className="text-[12px] text-[#7E7870] hover:text-[#2C2A29] transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FCFBF8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Nav />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
