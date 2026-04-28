import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/landing/PublicLayout";
import { SEOHead } from "@/components/landing/SEOHead";
import { Hero } from "@/components/landing/Hero";
import { TargetAudienceSection } from "@/components/landing/TargetAudienceSection";
import { RootCauseSection } from "@/components/landing/RootCauseSection";
import { SystemPhasesSection } from "@/components/landing/SystemPhasesSection";
import { StructogramUSPSection } from "@/components/landing/StructogramUSPSection";
import { ProofBar } from "@/components/landing/ProofBar";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { StickyCtaBanner } from "@/components/landing/conversion/StickyCtaBanner";
import { TrustLogosSection } from "@/components/landing/home/TrustLogosSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { ROICalculatorSection } from "@/components/landing/ROICalculatorSection";
import { ObjectionFAQSection } from "@/components/landing/ObjectionFAQSection";
import type { IndustryContent } from "@/data/industries";

interface IndustryLandingTemplateProps {
  content: IndustryContent;
}

/**
 * Einheitliches Template für alle Branchen-Landingpages.
 *
 * Sektionen-Reihenfolge (Pflicht, identisch über alle Pages):
 * 1. Hero        – Headline + Problem/Solution + CTA
 * 2. Problem     – TargetAudience (Du/Du-nicht) + RootCauses
 * 3. System      – SystemPhasesSection + StructogramUSPSection
 * 4. Proof       – TrustLogos + ProofBar (Zahlen, Zitat)
 * 5. FAQ         – Branchenspezifisch + Common FAQs
 * 6. CTA         – FinalCTA + Sticky-Banner
 */
export const IndustryLandingTemplate = ({ content }: IndustryLandingTemplateProps) => {
  const navigate = useNavigate();
  const goToQualifizierung = () => navigate("/qualifizierung");

  return (
    <PublicLayout>
      <StickyCtaBanner />
      <SEOHead
        title={content.seoTitle}
        description={content.seoDescription}
        canonical={content.canonical}
      />

      {/* 1. HERO */}
      <Hero
        headline={content.hero.headline}
        problem={content.hero.problem}
        solution={content.hero.solution}
        subline=""
        badge={content.hero.badge}
        ctaText={content.hero.ctaText}
        onCtaClick={goToQualifizierung}
      />

      {/* 2. PROBLEM */}
      <TargetAudienceSection
        yesPoints={content.problem.yesPoints}
        noPoints={content.problem.noPoints}
      />
      <RootCauseSection
        intro={content.problem.causesIntro}
        causes={content.problem.causes}
      />

      {/* 2b. VORHER / NACHHER */}
      <BeforeAfterSection
        beforePoints={content.problem.causes.map((c) => c.title)}
        afterLabel="Mit KI-Automatisierung"
      />

      {/* 3. SYSTEM */}
      <SystemPhasesSection />
      <StructogramUSPSection />

      {/* 3b. ROI-RECHNER */}
      <ROICalculatorSection />

      {/* 4. PROOF */}
      <TrustLogosSection />
      <ProofBar />

      {/* 5. FAQ + Einwände */}
      <FAQSection items={content.faq} />
      <ObjectionFAQSection />

      {/* 6. CTA */}
      <FinalCTA
        headline={content.finalCta.headline}
        subline={content.finalCta.subline}
        ctaText={content.finalCta.ctaText}
        onCtaClick={goToQualifizierung}
      />
    </PublicLayout>
  );
};
