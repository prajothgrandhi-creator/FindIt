import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNav } from "@/components/layout/public-nav";
import { CommunityStrip } from "@/components/landing/community-strip";
import { CursorGlow } from "@/components/landing/cursor-glow";
import { FaqSection } from "@/components/landing/faq";
import { FeaturesSection } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/hero";
import { ProductPreviewSection } from "@/components/landing/product-preview";
import { TrustSection } from "@/components/landing/trust-section";

export default function Home() {
  return (
    <>
      <CursorGlow />
      <PublicNav />
      <main>
        <LandingHero />
        <CommunityStrip />
        <HowItWorksSection />
        <FeaturesSection />
        <ProductPreviewSection />
        <TrustSection />
        <FaqSection />
        <FinalCta />
      </main>
      <PublicFooter />
    </>
  );
}
