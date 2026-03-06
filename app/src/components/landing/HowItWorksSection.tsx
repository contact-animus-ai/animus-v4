"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { ShoppingBag, Brain, Mail, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Connect",
    desc: "Link your Shopify store and Klaviyo account in 60 seconds.",
    detail: "One-click integrations",
  },
  {
    icon: Brain,
    title: "Learn",
    desc: "Animus analyzes your products, brand voice, and audience automatically.",
    detail: "AI-powered research",
  },
  {
    icon: Mail,
    title: "Automate",
    desc: "Personalized flows, campaigns, and optimizations run on autopilot.",
    detail: "Revenue on autopilot",
  },
];

export default function HowItWorksSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section id="how-it-works" ref={ref} className={`py-24 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            How It <span className="text-gradient-teal">Works</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">From setup to revenue in 3 steps.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
            {/* Connector arrows (desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-[33.33%] -translate-y-1/2 -translate-x-1/2 z-10">
              <ArrowRight className="text-primary/40" size={24} />
            </div>
            <div className="hidden md:block absolute top-1/2 left-[66.66%] -translate-y-1/2 -translate-x-1/2 z-10">
              <ArrowRight className="text-primary/40" size={24} />
            </div>

            {steps.map((step, i) => (
              <div key={step.title} className="glass-card rounded-xl p-6 text-center group hover:border-primary/40 transition-colors">
                {/* Step number */}
                <div className="text-xs text-primary font-medium mb-4">Step {i + 1}</div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl gradient-teal mx-auto mb-5 flex items-center justify-center glow-teal-sm group-hover:scale-105 transition-transform">
                  <step.icon className="text-primary-foreground" size={28} />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{step.desc}</p>
                <div className="text-xs text-primary/70 font-medium">{step.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
