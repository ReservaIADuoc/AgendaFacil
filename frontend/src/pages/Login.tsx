import { Link, useNavigate } from "react-router";
import { ArrowRight, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

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
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#C0987A" }}>
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
          <Link to="/register" className="font-medium text-[#C0987A] hover:text-[#A9B3A2]">
            Crea tu agenda gratis
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-border">
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
                  className="block w-full appearance-none rounded-xl border border-border px-3 py-2 placeholder-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-muted text-foreground"
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
                  className="block w-full appearance-none rounded-xl border border-border px-3 py-2 placeholder-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm bg-muted text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#D1CEC4] text-[#C0987A] focus:ring-[#C0987A]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#C0987A] hover:text-[#A9B3A2]">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-[#C0987A] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C0987A] focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Ingresando..." : "Ingresar"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
