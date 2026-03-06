"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";

export default function CTASection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 relative overflow-hidden ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground max-w-3xl mx-auto">
          Ready to Put Your Email Marketing on <span className="text-gradient-teal">Autopilot</span>?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Join 500+ Shopify merchants who are growing revenue with Animus AI. Start your free trial today.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gradient-teal text-primary-foreground hover:opacity-90 text-base px-8 h-12 glow-teal" asChild>
            <Link href="/signup">Get Started Free <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
