"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import * as api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const plans = [
  { name: "Starter", price: "$99", current: false, features: ["5,000 contacts", "3 flows", "Basic analytics"] },
  { name: "Growth", price: "$249", current: true, features: ["25,000 contacts", "Unlimited flows", "Advanced analytics", "A/B testing"] },
  { name: "Enterprise", price: "Custom", current: false, features: ["Unlimited contacts", "Dedicated manager", "Custom integrations", "SLA"] },
];

export default function Subscribe() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpgrade = async (planName: string) => {
    setLoadingPlan(planName);
    try {
      const result = await api.createCheckout();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-16 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Upgrade Your <span className="text-gradient-teal">Plan</span>
            </h1>
            <p className="mt-4 text-muted-foreground">Unlock more features and scale your email marketing.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`glass-card rounded-xl p-6 flex flex-col ${plan.current ? "border-primary/50 glow-teal relative" : ""}`}>
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Current Plan
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-3 text-3xl font-bold text-foreground">{plan.price}<span className="text-sm text-muted-foreground font-normal">{plan.price !== "Custom" && "/mo"}</span></div>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check className="text-primary" size={14} /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full ${!plan.current ? "gradient-teal text-primary-foreground hover:opacity-90" : ""}`}
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current || loadingPlan === plan.name}
                  onClick={() => !plan.current && handleUpgrade(plan.name)}
                >
                  {loadingPlan === plan.name ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : plan.current ? (
                    "Current"
                  ) : (
                    <>Upgrade <ArrowRight size={14} className="ml-1" /></>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
