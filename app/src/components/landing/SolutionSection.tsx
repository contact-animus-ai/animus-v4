"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";

export default function SolutionSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Meet <span className="text-gradient-teal">Animus</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            An autonomous AI operator that researches your brand, understands your products, 
            and builds email marketing that actually converts — without you lifting a finger.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-xl p-2 glow-teal">
            <img 
              src="/three_pillars_orchestration_2.png" 
              alt="Animus AI Orchestration Engine — Three Pillars: Product Intelligence, Brand Intelligence, Marketing Intelligence" 
              className="rounded-lg w-full" 
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
