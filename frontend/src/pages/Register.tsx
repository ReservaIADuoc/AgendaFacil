import { Link, useNavigate } from "react-router";
import { Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { motion } from "framer-motion";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";



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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BackgroundBlobs />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-heavy rounded-[2.5rem] p-8 sm:p-10 relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110 shadow-lg shadow-primary/20" style={{ background: "var(--theme-primary, #C0987A)" }}>
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
              className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-300 text-foreground placeholder-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border hover:shadow-inner" 
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
              className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-300 text-foreground placeholder-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border hover:shadow-inner" 
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
              className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-muted/30 focus:bg-card focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all duration-300 text-foreground placeholder-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:border-border hover:shadow-inner" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 rounded-2xl text-[15px] font-bold text-white bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 hover:-translate-y-1 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none" 
          >
            {loading ? "Creando cuenta..." : "Crear cuenta y continuar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold transition-colors hover:text-[#A9B3A2] relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#A9B3A2] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left" style={{ color: "var(--theme-primary, #C0987A)" }}>
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
