import { Link, useNavigate } from "react-router";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const PRIMARY = "#C0987A";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Por favor, completa todos los campos", "error");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      showToast("¡Cuenta creada con éxito!", "success");
      navigate("/onboarding");
    } catch (error: any) {
      showToast(error.message || "Error al registrar la cuenta", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: PRIMARY }}>
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-[22px] font-bold tracking-tight text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Agenda Fácil
          </span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground mb-8">
          Comienza a gestionar tus citas hoy mismo.
        </p>

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre completo</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-card focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all text-foreground placeholder-muted-foreground" 
              placeholder="Ej. Dra. Ana Gómez" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-card focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all text-foreground placeholder-muted-foreground" 
              placeholder="tu@correo.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-card focus:ring-2 focus:ring-[#C0987A] focus:border-transparent outline-none transition-all text-foreground placeholder-muted-foreground" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-md cursor-pointer disabled:opacity-50" 
            style={{ background: PRIMARY }}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta y continuar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold transition-colors hover:text-foreground" style={{ color: PRIMARY }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
