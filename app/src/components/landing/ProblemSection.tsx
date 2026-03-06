"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { Clock, AlertTriangle, TrendingDown, Frown } from "lucide-react";

const painPoints = [
  { icon: Clock, title: "Hours of Manual Work", desc: "Writing emails, segmenting lists, scheduling campaigns — it never ends." },
  { icon: AlertTriangle, title: "Generic Templates", desc: "Cookie-cutter emails that don't reflect your brand or products." },
  { icon: TrendingDown, title: "Low Engagement", desc: "Open rates dropping, revenue from email stagnating quarter over quarter." },
  { icon: Frown, title: "Agency Costs", desc: "$3,000-$10,000/mo for agencies that still need your constant input." },
];

export default function ProblemSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            What Email Marketing Looks Like <span className="text-gradient-teal">Today</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Most Shopify merchants are stuck in a cycle of manual effort, generic content, and diminishing returns.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {painPoints.map((p) => (
            <div key={p.title} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors">
              <p.icon className="text-destructive mb-4" size={28} />
              <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
