import { FogBackground } from "@/components/fog-background";
import { OurStorySection } from "@/components/our-story-section";
import { FrustrationSection } from "@/components/frustration-section";
import { DemocratizingSection } from "@/components/democratizing-section";
import { TeamSection } from "@/components/team-section";
import { RevolutionSection } from "@/components/revolution-section";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <FogBackground />
      <OurStorySection />
      <FrustrationSection />
      <DemocratizingSection />
      <TeamSection />
      <RevolutionSection />
    </div>
  );
}
