"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";

const stats = [
  { icon: ShoppingBag, label: "Shopify Partner", value: "Official" },
  { icon: Users, label: "Merchants", value: "500+" },
  { icon: DollarSign, label: "Revenue Generated", value: "$2.4M+" },
  { icon: TrendingUp, label: "Avg. Open Rate", value: "42%" },
];

export default function SocialProofBar() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-16 border-y border-border/50 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-3 text-primary" size={24} />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
