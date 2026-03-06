"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";

export default function BeforeAfterSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 bg-secondary/30 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-0">
        <div className="max-w-6xl mx-auto glass-card rounded-xl p-2">
          <img src="/before_after.png" alt="What changes when Animus AI takes over your email" className="rounded-lg w-full" loading="lazy" />
        </div>
      </div>
    </section>);

}