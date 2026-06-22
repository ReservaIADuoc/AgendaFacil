import { features } from "../components/landing/LandingData";
import { FeatureSection } from "../components/landing/LandingSections";

export default function Features() {
  return (
    <div className="pt-12 pb-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C2A29] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
          Todo lo que necesitas para tu consulta
        </h1>
        <p className="text-[#7E7870] max-w-2xl mx-auto">
          Descubre cómo Agenda Fácil puede ayudarte a ahorrar tiempo y conseguir más clientes con nuestras herramientas automatizadas.
        </p>
      </div>
      {features.map((f, i) => <FeatureSection key={i} feat={f} idx={i} />)}
    </div>
  );
}
