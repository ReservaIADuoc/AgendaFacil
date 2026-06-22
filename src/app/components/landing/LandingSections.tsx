import { useState } from "react";
import { Link } from "react-router";
import { Calendar, CheckCircle, Star, ArrowRight, Play, Users, TrendingUp } from "lucide-react";
import { professionals, features, testimonials, plans } from "./LandingData";
import { BookingMockup } from "./LandingMockups";

const PRIMARY = "#C0987A";
const ACCENT = "#A9B3A2";
const DARK = "#2C2A29";

export function Hero() {
  const [currentProf, setCurrentProf] = useState(0);
  return (
    <section className="relative overflow-hidden bg-[#FCFBF8] pt-16 pb-20 lg:pt-24 lg:pb-32">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-3xl -translate-y-1/3 translate-x-1/4" style={{ background: PRIMARY }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl translate-y-1/3 -translate-x-1/4" style={{ background: ACCENT }} />

      <div className="relative max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold mb-6 border-black/10 bg-black/[0.02]">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRIMARY }} />
              +10.000 profesionales confían en Agenda Fácil
            </div>

            <h1 className="text-[42px] leading-[1.08] font-bold tracking-tight mb-6 lg:text-[52px]" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
              Tu agenda online,{" "}
              <em className="not-italic" style={{ color: PRIMARY }}>sin esfuerzo.</em>
              <br />Tu negocio,{" "}
              <span style={{ color: ACCENT }}>siempre lleno.</span>
            </h1>

            <p className="text-[16px] text-gray-500 leading-relaxed mb-8 max-w-md" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Deja de perder citas por no contestar el teléfono. Agenda Fácil automatiza tu agenda, recuerda a tus clientes y llena tus huecos solo.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {professionals.map((p, i) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-full text-[12px] font-semibold border transition-all cursor-default"
                  style={i === currentProf % professionals.length
                    ? { background: PRIMARY, color: "#fff", borderColor: PRIMARY }
                    : { background: "transparent", color: "#7E7870", borderColor: "#E5E7EB" }
                  }
                  onMouseEnter={() => setCurrentProf(i)}
                >
                  {p}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[15px] font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
                style={{ background: PRIMARY }}
              >
                Empieza gratis hoy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[15px] font-semibold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition-all">
                <Play className="w-4 h-4" style={{ color: PRIMARY }} />
                Ver demo
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["#C0987A","#A9B3A2","#D9A05B","#F59E0B"].map((c,i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ background: c }}>
                    {["VR","MF","AC","LP"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[12px] text-gray-500">4.9 de 5 · +800 reseñas</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-15" style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent 70%)` }} />
            <div className="relative">
              <BookingMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustBar() {
  const items = [
    { icon: <Users className="w-4 h-4" style={{ color: PRIMARY }} />, value: "+10.000", label: "profesionales activos" },
    { icon: <Calendar className="w-4 h-4" style={{ color: PRIMARY }} />, value: "+500.000", label: "citas gestionadas" },
    { icon: <Star className="w-4 h-4 fill-amber-400 text-amber-400" />, value: "4.9 ★", label: "en App Store" },
    { icon: <TrendingUp className="w-4 h-4" style={{ color: PRIMARY }} />, value: "82%", label: "más citas al mes" },
  ];
  return (
    <section className="border-y border-black/5 bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-black/5 flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-[15px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>{item.value}</p>
              <p className="text-[11px] text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeatureSection({ feat, idx }: { feat: typeof features[0]; idx: number }) {
  const isOdd = idx % 2 === 1;
  return (
    <section className={`py-16 lg:py-24 ${isOdd ? "bg-gray-50/60" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isOdd ? "lg:grid-flow-dense" : ""}`}>
          <div className={isOdd ? "lg:col-start-2" : ""}>
            <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: PRIMARY, background: PRIMARY + "12" }}>
              {feat.tag}
            </span>
            <h2 className="text-[30px] lg:text-[38px] font-bold leading-tight mb-4" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
              {feat.title}
            </h2>
            <p className="text-[15px] text-gray-500 leading-relaxed mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {feat.body}
            </p>
            <button className="group flex items-center gap-2 text-[14px] font-semibold transition-colors hover:gap-3" style={{ color: PRIMARY }}>
              Saber más <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className={`flex items-center justify-center ${isOdd ? "lg:col-start-1 lg:row-start-1" : ""}`}>
            {feat.visual}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "01", title: "Activa tu agenda en 5 minutos", body: "Crea tu perfil, define tus servicios y horarios. Sin código, sin complicaciones." },
    { n: "02", title: "Comparte tu enlace de reserva", body: "Pega el link en tu Instagram, WhatsApp o web. Tus clientes reservan solos desde cualquier dispositivo." },
    { n: "03", title: "Llena tu agenda sin esfuerzo", body: "Recibe confirmaciones automáticas, cobros online y recordatorios que reducen las ausencias." },
  ];
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT, background: ACCENT + "10" }}>
            Cómo funciona
          </span>
          <h2 className="text-[32px] lg:text-[42px] font-bold leading-tight" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
            Listo en menos de 10 minutos.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md" style={{ background: i === 0 ? PRIMARY : i === 1 ? ACCENT : "#D9A05B" }}>
                <span className="text-[16px] font-bold text-white" style={{ fontFamily: "'Fraunces', serif" }}>{step.n}</span>
              </div>
              <h3 className="text-[17px] font-bold mb-2" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>{step.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: PRIMARY, background: PRIMARY + "12" }}>
            Testimonios
          </span>
          <h2 className="text-[32px] lg:text-[42px] font-bold" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
            Lo que dicen quienes ya{" "}
            <em style={{ color: PRIMARY, fontStyle: "italic" }}>crecieron</em>.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-[14px] text-gray-700 leading-relaxed flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: t.hue }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: DARK }}>{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section className="py-16 lg:py-24 bg-white" id="pricing">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT, background: ACCENT + "10" }}>
            Precios
          </span>
          <h2 className="text-[32px] lg:text-[42px] font-bold mb-3" style={{ color: DARK, fontFamily: "'Fraunces', serif" }}>
            Sin sorpresas. Sin letra chica.
          </h2>
          <p className="text-[15px] text-gray-500">Cancela cuando quieras. 14 días de prueba gratuita en todos los planes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col border transition-shadow hover:shadow-lg relative overflow-hidden
                ${plan.primary ? "shadow-xl" : "shadow-sm border-black/5 bg-white"}`}
              style={plan.primary ? { border: `2px solid ${PRIMARY}`, background: DARK } : {}}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: PRIMARY }}>
                  {plan.badge}
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-[14px] font-bold mb-1" style={{ color: plan.primary ? "#EAE6D8" : "#7E7870", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[13px] font-medium" style={{ color: plan.primary ? "white" : DARK }}>$</span>
                  <span className="text-[44px] font-bold leading-none" style={{ color: plan.primary ? "white" : DARK, fontFamily: "'Fraunces', serif" }}>
                    {plan.price}
                  </span>
                  <span className="text-[13px] ml-1" style={{ color: plan.primary ? "#EAE6D8" : "#7E7870" }}>/ {plan.period}</span>
                </div>
                <p className="text-[12px]" style={{ color: plan.primary ? "#EAE6D8" : "#7E7870" }}>{plan.desc}</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.primary ? PRIMARY : PRIMARY }} />
                    <span className="text-[13px]" style={{ color: plan.primary ? "#F3EFE9" : "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full py-3 rounded-xl text-[14px] font-bold transition-all hover:opacity-90 flex justify-center items-center"
                style={plan.primary
                  ? { background: PRIMARY, color: "#fff" }
                  : { background: DARK, color: "#fff" }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-16 lg:py-24" style={{ background: DARK }}>
      <div className="max-w-3xl mx-auto px-5 text-center">
        <h2 className="text-[32px] lg:text-[48px] font-bold leading-tight mb-5 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
          Deja de perder citas.
          <br />
          <em style={{ color: PRIMARY, fontStyle: "italic" }}>Empieza hoy, gratis.</em>
        </h2>
        <p className="text-[15px] mb-8 leading-relaxed" style={{ color: "#EAE6D8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          No necesitas tarjeta de crédito. En 5 minutos tienes tu agenda online activa y lista para recibir citas.
        </p>
        <Link
          to="/register"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[15px] font-bold text-white shadow-xl transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: PRIMARY }}
        >
          Crear mi agenda gratis
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="text-[12px] mt-4" style={{ color: "#7E7870" }}>Sin límite de tiempo · Sin tarjeta · Sin compromisos</p>
      </div>
    </section>
  );
}
