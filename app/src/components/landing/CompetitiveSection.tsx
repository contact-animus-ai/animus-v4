"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { X, Check, Minus } from "lucide-react";
import { motion } from "framer-motion";

const comparisonRows = [
  {
    feature: "Store Integration",
    others: "Scrapes website URL only",
    animus: "Deep Shopify + Klaviyo + Canva",
    othersLevel: 20,
    animusLevel: 95,
  },
  {
    feature: "Setup & Onboarding",
    others: "One-time generic setup",
    animus: "14-point technical audit per template",
    othersLevel: 30,
    animusLevel: 90,
  },
  {
    feature: "Brand Consistency",
    others: "No brand kit integration",
    animus: "Templates from YOUR Canva brand kit",
    othersLevel: 15,
    animusLevel: 98,
  },
  {
    feature: "Segmentation",
    others: "Basic pre-built templates",
    animus: "Behavior-based smart segmentation",
    othersLevel: 25,
    animusLevel: 88,
  },
  {
    feature: "Ongoing Strategy",
    others: "No ongoing research",
    animus: "Continuous strategy & optimization",
    othersLevel: 10,
    animusLevel: 92,
  },
];

const featureChecklist = [
  { feature: "Shopify native integration", others: false, animus: true },
  { feature: "Klaviyo sync", others: "partial", animus: true },
  { feature: "Canva brand kit support", others: false, animus: true },
  { feature: "Automated A/B testing", others: "partial", animus: true },
  { feature: "Revenue attribution", others: false, animus: true },
  { feature: "Ongoing optimization", others: false, animus: true },
];

export default function CompetitiveSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 bg-secondary/30 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Why <span className="text-primary">Animus</span>?
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
          Not all AI email tools are created equal. See the difference side by side.
        </p>

        {/* Performance Bars */}
        <div className="max-w-4xl mx-auto mb-16 space-y-6">
          {comparisonRows.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card rounded-xl p-5"
            >
              <div className="font-semibold text-foreground mb-3">{row.feature}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">Others</span>
                  <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.othersLevel}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-destructive/50"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-28 text-right truncate">{row.others}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-primary font-medium w-20 shrink-0">Animus</span>
                  <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.animusLevel}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-primary glow-teal-sm"
                    />
                  </div>
                  <span className="text-xs text-primary font-medium w-28 text-right truncate">{row.animus}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Checklist Table */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-center mb-6">Feature Comparison</h3>
          <div className="glass-card rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] border-b border-border/40 px-5 py-4">
              <span className="text-sm font-semibold text-muted-foreground">Feature</span>
              <span className="text-sm font-semibold text-muted-foreground text-center">Others</span>
              <span className="text-sm font-semibold text-primary text-center">Animus</span>
            </div>
            {/* Rows */}
            {featureChecklist.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] px-5 py-3.5 items-center ${
                  i < featureChecklist.length - 1 ? "border-b border-border/20" : ""
                }`}
              >
                <span className="text-sm text-foreground/90">{row.feature}</span>
                <div className="flex justify-center">
                  {row.others === true ? (
                    <Check className="h-5 w-5 text-primary" />
                  ) : row.others === "partial" ? (
                    <Minus className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <X className="h-5 w-5 text-destructive/60" />
                  )}
                </div>
                <div className="flex justify-center">
                  {row.animus ? (
                    <div className="rounded-full bg-primary/15 p-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-destructive/60" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
