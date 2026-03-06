"use client";

import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$999",
    desc: "For small stores getting started with AI email.",
    features: ["Up to 5,000 contacts", "3 automated flows", "Basic analytics", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$2,499",
    desc: "For growing brands ready to scale revenue.",
    features: ["Up to 25,000 contacts", "Unlimited flows", "Advanced analytics", "Priority support", "A/B testing", "Custom templates"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For high-volume stores with custom needs.",
    features: ["Unlimited contacts", "Unlimited everything", "Dedicated account manager", "Custom integrations", "SLA guarantee", "White-glove onboarding"],
    highlighted: false,
  },
];

export default function PricingPreview() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section ref={ref} className={`py-24 ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Simple, Transparent <span className="text-gradient-teal">Pricing</span>
          </h2>
          <p className="mt-4 text-muted-foreground">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card rounded-xl p-8 flex flex-col ${
                plan.highlighted ? "border-primary/50 glow-teal relative" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="text-primary flex-shrink-0" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${plan.highlighted ? "gradient-teal text-primary-foreground hover:opacity-90" : ""}`}
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href="/signup">{plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
