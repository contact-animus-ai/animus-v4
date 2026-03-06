"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { Bot, Mail, BarChart3, Zap, Shield, Globe } from "lucide-react";

const features = [
  { icon: Bot, title: "Autonomous Operation", desc: "Animus works 24/7 without manual intervention — researching, writing, and optimizing." },
  { icon: Mail, title: "Smart Email Flows", desc: "Welcome series, abandoned cart, post-purchase, win-back — all built and personalized automatically." },
  { icon: BarChart3, title: "Revenue Analytics", desc: "Track exactly how much revenue each email generates with full attribution." },
  { icon: Zap, title: "Instant Campaigns", desc: "Launch targeted campaigns in seconds. Animus handles segmentation and timing." },
  { icon: Shield, title: "Brand-Safe Content", desc: "Every email matches your brand voice, visual style, and messaging guidelines." },
  { icon: Globe, title: "Klaviyo Native", desc: "Built to work seamlessly with Klaviyo — no migration needed, instant sync." },
];

export default function FeaturesSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section id="features" ref={ref} className={`py-24 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything You Need, <span className="text-gradient-teal">Nothing You Don&apos;t</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group">
              <f.icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={28} />
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
