import SiteHeader from "@/components/landing/SiteHeader";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import CommunityPreview from "@/components/landing/CommunityPreview";
import CtaBand from "@/components/landing/CtaBand";
import SiteFooter from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <CommunityPreview />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
