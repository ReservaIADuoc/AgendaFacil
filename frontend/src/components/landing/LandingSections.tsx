import { useState } from "react";
import { Link } from "react-router";
import { Calendar, CheckCircle, Star, ArrowRight, Play, Users, TrendingUp } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "../shared/TextReveal";
import { TiltCard } from "../shared/TiltCard";
import { professionals, features, testimonials, plans } from "./LandingData";
import { BookingMockup } from "./LandingMockups";

const ACCENT = "#A9B3A2";
const DARK = "#2C2A29";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export function Hero() {
  const [currentProf, setCurrentProf] = useState(0);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-20 lg:pt-24 lg:pb-32">
      <motion.div style={{ y: y1, background: "var(--theme-primary, #C0987A)" }} className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-3xl -translate-y-1/3 translate-x-1/4" />
      <motion.div style={{ y: y2, background: ACCENT }} className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold mb-6 border-border bg-muted text-foreground">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--theme-primary, #C0987A)" }} />
              +10.000 profesionales confían en Agenda Fácil
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[42px] leading-[1.08] font-bold tracking-tight mb-6 lg:text-[52px] text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
              <TextReveal text="Tu agenda online," />{" "}
              <em className="not-italic" style={{ color: "var(--theme-primary, #C0987A)" }}><TextReveal text="sin esfuerzo." delay={0.4} /></em>
              <br />
              <TextReveal text="Tu negocio," delay={0.6} />{" "}
              <span style={{ color: ACCENT }}><TextReveal text="siempre lleno." delay={0.8} /></span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[16px] text-muted-foreground leading-relaxed mb-8 max-w-md" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Deja de perder citas por no contestar el teléfono. Agenda Fácil automatiza tu agenda, recuerda a tus clientes y llena tus huecos solo.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-8">
              {professionals.map((p, i) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-full text-[12px] font-semibold border transition-all cursor-default"
                  style={i === currentProf % professionals.length
                    ? { background: "var(--theme-primary, #C0987A)", color: "#fff", borderColor: "var(--theme-primary, #C0987A)" }
                    : { background: "transparent", color: "#7E7870", borderColor: "#E5E7EB" }
                  }
                  onMouseEnter={() => setCurrentProf(i)}
                >
                  {p}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[15px] font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(192,152,122,0.6)]"
                style={{ background: "var(--theme-primary, #C0987A)" }}
              >
                Empieza gratis hoy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[15px] font-semibold text-foreground border border-border bg-card hover:bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <Play className="w-4 h-4" style={{ color: "var(--theme-primary, #C0987A)" }} />
                Ver demo
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["var(--theme-primary, #C0987A)","#A9B3A2","#D9A05B","#F59E0B"].map((c,i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ background: c }}>
                    {["VR","MF","AC","LP"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[12px] text-muted-foreground">4.9 de 5 · +800 reseñas</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-15" style={{ background: `radial-gradient(circle, ${"var(--theme-primary, #C0987A)"}, transparent 70%)` }} />
            <div className="relative hover:scale-[1.02] transition-transform duration-500">
              <BookingMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function TrustBar() {
  const items = [
    { icon: <Users className="w-4 h-4" style={{ color: "var(--theme-primary, #C0987A)" }} />, value: "+10.000", label: "profesionales activos" },
    { icon: <Calendar className="w-4 h-4" style={{ color: "var(--theme-primary, #C0987A)" }} />, value: "+500.000", label: "citas gestionadas" },
    { icon: <Star className="w-4 h-4 fill-amber-400 text-amber-400" />, value: "4.9 ★", label: "en App Store" },
    { icon: <TrendingUp className="w-4 h-4" style={{ color: "var(--theme-primary, #C0987A)" }} />, value: "82%", label: "más citas al mes" },
  ];
  return (
    <section className="border-y border-border bg-muted/30">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <motion.div variants={fadeUp} key={item.label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center shadow-sm border border-border flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-[15px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function FeatureSection({ feat, idx }: { feat: typeof features[0]; idx: number }) {
  const isOdd = idx % 2 === 1;
  return (
    <section className={`py-16 lg:py-24 ${isOdd ? "bg-muted/30" : "bg-background"} overflow-hidden`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isOdd ? "lg:grid-flow-dense" : ""}`}>
          <motion.div 
            initial={{ opacity: 0, x: isOdd ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
            className={isOdd ? "lg:col-start-2" : ""}
          >
            <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: "var(--theme-primary, #C0987A)", background: "var(--theme-primary, #C0987A)" + "12" }}>
              {feat.tag}
            </span>
            <h2 className="text-[30px] lg:text-[38px] font-bold leading-tight mb-4 text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
              {feat.title}
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {feat.body}
            </p>
            <button className="group flex items-center gap-2 text-[14px] font-semibold transition-colors hover:gap-3" style={{ color: "var(--theme-primary, #C0987A)" }}>
              Saber más <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
            className={`flex items-center justify-center ${isOdd ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            {feat.visual}
          </motion.div>
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
    <section className="py-16 lg:py-24 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT, background: ACCENT + "10" }}>
            Cómo funciona
          </span>
          <h2 className="text-[32px] lg:text-[42px] font-bold leading-tight text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Listo en menos de 10 minutos.
          </h2>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          {steps.map((step, i) => (
            <motion.div variants={fadeUp} key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md transition-transform hover:scale-110" style={{ background: i === 0 ? "var(--theme-primary, #C0987A)" : i === 1 ? ACCENT : "#D9A05B" }}>
                <span className="text-[16px] font-bold text-white" style={{ fontFamily: "'Fraunces', serif" }}>{step.n}</span>
              </div>
              <h3 className="text-[17px] font-bold mb-2 text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>{step.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: "var(--theme-primary, #C0987A)", background: "var(--theme-primary, #C0987A)" + "12" }}>
            Testimonios
          </span>
          <h2 className="text-[32px] lg:text-[42px] font-bold text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Lo que dicen quienes ya{" "}
            <em style={{ color: "var(--theme-primary, #C0987A)", fontStyle: "italic" }}>crecieron</em>.
          </h2>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <motion.div variants={fadeUp} key={t.name} className="glass rounded-3xl p-6 lg:p-8 flex flex-col gap-4 hover-glow cursor-default">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: t.hue }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section className="py-16 lg:py-24 bg-background overflow-hidden" id="pricing">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[12px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: ACCENT, background: ACCENT + "10" }}>
            Precios
          </span>
          <h2 className="text-[32px] lg:text-[42px] font-bold mb-3 text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Sin sorpresas. Sin letra chica.
          </h2>
          <p className="text-[15px] text-muted-foreground">Cancela cuando quieras. 14 días de prueba gratuita en todos los planes.</p>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map(plan => (
            <motion.div variants={fadeUp} key={plan.name} className="relative h-full flex flex-col">
              <TiltCard
                className={`flex-1 rounded-[2.5rem] p-7 md:p-9 flex flex-col border transition-all duration-500 hover:-translate-y-2 relative overflow-hidden
                  ${plan.primary ? "shadow-2xl shadow-primary/20 scale-105 z-10" : "shadow-lg border-black/5 bg-card/80 backdrop-blur-xl"}`}
                style={plan.primary ? { border: `2px solid ${"var(--theme-primary, #C0987A)"}`, background: DARK } : {}}
              >
              {plan.badge && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: "var(--theme-primary, #C0987A)" }}>
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
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.primary ? "var(--theme-primary, #C0987A)" : "var(--theme-primary, #C0987A)" }} />
                    <span className="text-[13px]" style={{ color: plan.primary ? "#F3EFE9" : "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 hover:-translate-y-1 flex justify-center items-center hover:shadow-[0_8px_20px_-6px_rgba(192,152,122,0.6)]"
                style={plan.primary
                  ? { background: "var(--theme-primary, #C0987A)", color: "#fff" }
                  : { background: DARK, color: "#fff" }
                }
              >
                {plan.cta}
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden" style={{ background: DARK }}>
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto px-5 text-center relative z-10"
      >
        <h2 className="text-[32px] lg:text-[48px] font-bold leading-tight mb-5 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
          Deja de perder citas.
          <br />
          <em style={{ color: "var(--theme-primary, #C0987A)", fontStyle: "italic" }}>Empieza hoy, gratis.</em>
        </h2>
        <p className="text-[15px] mb-8 leading-relaxed" style={{ color: "#EAE6D8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          No necesitas tarjeta de crédito. En 5 minutos tienes tu agenda online activa y lista para recibir citas.
        </p>
        <Link
          to="/register"
          className="group inline-flex items-center gap-2 px-8 py-5 rounded-2xl text-[15px] font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(192,152,122,0.6)] bg-gradient-to-r from-primary to-primary/80"
        >
          Crear mi agenda gratis
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </Link>
        <p className="text-[12px] mt-4" style={{ color: "#7E7870" }}>Sin límite de tiempo · Sin tarjeta · Sin compromisos</p>
      </motion.div>
    </section>
  );
}
