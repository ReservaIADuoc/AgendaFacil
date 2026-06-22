import { Hero, TrustBar, FeatureSection, HowItWorks, Testimonials, Pricing, CtaSection } from "../components/landing/LandingSections";
import { features } from "../components/landing/LandingData";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      {features.map((f, i) => <FeatureSection key={i} feat={f} idx={i} />)}
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CtaSection />
    </>
  );
}
