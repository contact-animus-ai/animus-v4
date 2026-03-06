"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { Package, Palette, BarChart3 } from "lucide-react";

const pillars = [
  {
    icon: Package,
    title: "Product Intelligence",
    desc: "Animus scrapes your store, analyzes every product, and understands collections, pricing, and best-sellers to craft relevant content.",
    features: ["Product catalog analysis", "Collection mapping", "Seasonal trend detection"],
  },
  {
    icon: Palette,
    title: "Brand Intelligence",
    desc: "Your tone, visual identity, and messaging style are learned automatically — every email sounds like you wrote it.",
    features: ["Brand voice extraction", "Visual style matching", "Competitor benchmarking"],
  },
  {
    icon: BarChart3,
    title: "Marketing Intelligence",
    desc: "Continuously optimizes send times, subject lines, and content based on real performance data from your store.",
    features: ["A/B testing automation", "Send time optimization", "Revenue attribution"],
  },
];

export default function ThreePillarsSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 bg-secondary/30 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Three Pillars of <span className="text-gradient-teal">Intelligence</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div key={p.title} className="glass-card rounded-xl p-8 hover:border-primary/30 transition-all hover:glow-teal-sm group">
              <p.icon className="text-primary mb-6 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-xl font-bold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground text-sm mb-6">{p.desc}</p>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
