import SiteHeader from "@/components/landing/SiteHeader";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import CommunityPreview from "@/components/landing/CommunityPreview";
import CtaBand from "@/components/landing/CtaBand";
import SiteFooter from "@/components/landing/SiteFooter";
import { getLandingUser, getLandingData } from "@/lib/landing";

export const dynamic = "force-dynamic"; // the header and numbers depend on who is looking and the live data

export default async function HomePage() {
  const [user, data] = await Promise.all([getLandingUser(), getLandingData()]);

  return (
    <>
      <SiteHeader user={user} />
      <main>
        <Hero user={user} stats={data.stats} />
        <HowItWorks />
        <Features />
        <CommunityPreview posts={data.posts} user={user} />
        <CtaBand user={user} />
      </main>
      <SiteFooter user={user} />
    </>
  );
}
