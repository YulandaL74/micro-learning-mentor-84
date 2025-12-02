import { Hero } from "@/components/Hero";
import { SkillsGrid } from "@/components/SkillsGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { Stats } from "@/components/Stats";
import { TechStack } from "@/components/TechStack";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <SkillsGrid />
      <HowItWorks />
      <Stats />
      <TechStack />
      <CTA />
    </main>
  );
};

export default Index;
