import { Link, useNavigate } from "react-router";
import { Calendar } from "lucide-react";

const PRIMARY = "#C0987A";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: PRIMARY }}>
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-[22px] font-bold tracking-tight text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>
            Agenda Fácil
          </span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-[#2C2A29]" style={{ fontFamily: "'Fraunces', serif" }}>
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-[#7E7870] mb-8">
          Comienza a gestionar tus citas hoy mismo.
        </p>

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-[#4A4641] mb-1">Nombre completo</label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all" placeholder="Ej. Dra. Ana Gómez" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A4641] mb-1">Correo electrónico</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all" placeholder="tu@correo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A4641] mb-1">Contraseña</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl border border-[#D1CEC4] bg-[#F3EFE9]/50 focus:bg-white focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-md" style={{ background: PRIMARY }}>
            Crear cuenta y continuar
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#7E7870]">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold transition-colors hover:text-[#2C2A29]" style={{ color: PRIMARY }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
