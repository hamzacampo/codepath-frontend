import HeroSection from "@/components/hero-section";
import { WhyCodePath } from "@/components/why-codepath";
import { FeaturesThreeCards } from "@/components/features-three-cards";
import { CtaSection } from "@/components/cta-section";
import { ContactSection } from "../components/contact-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WhyCodePath />
      <CtaSection />
      <FeaturesThreeCards />
      <ContactSection />
    </div>
  );
}
