import { PublicNavbar } from "@/components/public/PublicNavbar";
import {
  AboutSection,
  ContactSection,
  FeaturesSection,
  Hero,
  HowItWorks,
  RoleBenefits,
  SportsSection,
} from "@/components/public/LandingSections";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function Home() {
  return (
    <>
      <PublicNavbar />
      <main>
        <Hero />
        <SportsSection />
        <FeaturesSection />
        <HowItWorks />
        <RoleBenefits />
        <AboutSection />
        <ContactSection />
      </main>
      <PublicFooter />
    </>
  );
}
