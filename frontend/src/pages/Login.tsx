import { Link, useNavigate } from "react-router";
import { ArrowRight, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { motion } from "framer-motion";
import BackgroundBlobs from "../components/shared/BackgroundBlobs";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Por favor, completa todos los campos", "error");
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      showToast("¡Sesión iniciada con éxito!", "success");
      navigate("/dashboard");
    } catch (error: any) {
      showToast(error.message || "Credenciales inválidas", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BackgroundBlobs />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center relative z-10"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110 shadow-lg shadow-primary/20" style={{ background: "var(--theme-primary, #C0987A)" }}>
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-[22px] font-bold tracking-tight text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Agenda Fácil
          </span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
          Inicia sesión en tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          ¿O eres nuevo aquí?{" "}
          <Link to="/register" className="font-medium text-primary hover:text-[#A9B3A2] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#A9B3A2] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
            Crea tu agenda gratis
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass-heavy py-10 px-4 sm:rounded-[2.5rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-2xl border border-border/60 px-5 py-3.5 placeholder-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm bg-muted/30 text-foreground transition-all duration-300 hover:border-border hover:shadow-inner"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-2xl border border-border/60 px-5 py-3.5 placeholder-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm bg-muted/30 text-foreground transition-all duration-300 hover:border-border hover:shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#D1CEC4] text-primary focus:ring-primary transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-[#A9B3A2] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-primary to-primary/80 py-4 px-4 text-[15px] font-bold text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-500 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? "Ingresando..." : "Ingresar"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

