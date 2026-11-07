
import { PublicNavbar } from "@/components/public/PublicNavbar";
import {
  AboutSection,
  ContactSection,
  GallerySection,
  Hero,
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
        <RoleBenefits />
        <AboutSection />
        <GallerySection />
        <ContactSection />
      </main>

      <PublicFooter />
    </>
  );
}
