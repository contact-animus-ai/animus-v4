"use client";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import ThreePillarsSection from "@/components/landing/ThreePillarsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BeforeAfterSection from "@/components/landing/BeforeAfterSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CompetitiveSection from "@/components/landing/CompetitiveSection";
import PricingPreview from "@/components/landing/PricingPreview";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <SolutionSection />
      <ThreePillarsSection />
      <HowItWorksSection />
      <BeforeAfterSection />
      <FeaturesSection />
      <CompetitiveSection />
      <PricingPreview />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
