"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ShoppingBag, Palette, Rocket, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createBrowserClient } from "@supabase/ssr";
import * as api from "@/lib/api";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const steps = [
  { icon: ShoppingBag, title: "Connect Your Store", desc: "Link your Shopify store to get started" },
  { icon: Palette, title: "Brand & Integrations", desc: "Connect Klaviyo and set up your brand kit" },
  { icon: Rocket, title: "Review & Launch", desc: "Preview your first AI-generated flows and go live" },
];

const stepKeyMap: Record<string, number> = {
  onboarding_shopify: 0,
  onboarding_klaviyo: 1,
  onboarding_brand: 2,
};

const fontOptions = [
  "Inter", "Helvetica", "Georgia", "Playfair Display", "Lato", "Montserrat",
  "Roboto", "Open Sans", "Poppins", "Merriweather",
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [klaviyoKey, setKlaviyoKey] = useState("");
  const [brandConfig, setBrandConfig] = useState({
    primaryColor: "#14b8a6",
    secondaryColor: "#1e293b",
    fontHeading: "Inter",
    fontBody: "Inter",
    logoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: merchant } = await supabase
          .from("merchants")
          .select("merchant_state")
          .eq("user_id", user.id)
          .single();
        if (merchant?.merchant_state && stepKeyMap[merchant.merchant_state] !== undefined) {
          setStep(stepKeyMap[merchant.merchant_state]);
        }
      } catch (err) {
        console.error("Failed to load merchant state:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadState();
  }, []);

  // Auto-redirect after completion
  useEffect(() => {
    if (!completed) return;
    const timer = setTimeout(() => router.push("/chat"), 3000);
    return () => clearTimeout(timer);
  }, [completed, router]);

  const handleShopifyConnect = async () => {
    if (!storeUrl.trim()) return;
    setLoading(true);
    try {
      await api.connectShopify(storeUrl);
      setStep(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleKlaviyoConnect = async () => {
    if (!klaviyoKey.trim()) return;
    setLoading(true);
    try {
      await api.connectKlaviyo(klaviyoKey);
      setStep(2);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandConfig = async () => {
    setLoading(true);
    try {
      await api.saveBrandConfig(brandConfig);
      setCompleted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Completion screen
  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full gradient-teal flex items-center justify-center mx-auto animate-[scale-in_0.5s_ease-out]">
            <Check size={36} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">You&apos;re all set!</h2>
            <p className="text-muted-foreground mt-2">Animus is analyzing your store and preparing your flows...</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Redirecting to chat...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left sidebar */}
      <div className="hidden md:flex w-80 border-r border-border p-8 flex-col">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="h-8 w-8 rounded-lg gradient-teal flex items-center justify-center text-primary-foreground font-bold text-sm">A</div>
          <span className="text-lg font-bold text-foreground">Animus AI</span>
        </Link>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "glass-card border-primary/50" : "glass-card"
              }`}>
                {i < step ? <Check size={18} /> : <s.icon size={18} className={i === step ? "text-primary" : "text-muted-foreground"} />}
              </div>
              <div>
                <div className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Mobile progress */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Connect your Shopify store</h2>
                <p className="text-muted-foreground mt-2">Enter your store URL to begin. Animus will analyze your products and brand.</p>
              </div>
              <div className="glass-card rounded-xl p-8 space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Store URL</Label>
                  <Input placeholder="yourstore.myshopify.com" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} className="bg-secondary/50 border-border" />
                </div>
                <Button onClick={handleShopifyConnect} className="w-full gradient-teal text-primary-foreground hover:opacity-90" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Connecting...</> : "Connect Store"}
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Connect Klaviyo</h2>
                <p className="text-muted-foreground mt-2">Enter your Klaviyo API key to sync your email infrastructure.</p>
              </div>
              <div className="glass-card rounded-xl p-8 space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Klaviyo API Key</Label>
                  <Input placeholder="pk_xxxxxxxxxxxxxxxx" value={klaviyoKey} onChange={(e) => setKlaviyoKey(e.target.value)} className="bg-secondary/50 border-border" />
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm text-foreground">
                  Find your API key in Klaviyo &rarr; Settings &rarr; API Keys
                </div>
                <Button onClick={handleKlaviyoConnect} className="w-full gradient-teal text-primary-foreground hover:opacity-90" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Connecting...</> : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Configure your brand</h2>
                <p className="text-muted-foreground mt-2">Set your brand colors, fonts, and logo for email templates.</p>
              </div>
              <div className="glass-card rounded-xl p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandConfig.primaryColor}
                        onChange={(e) => setBrandConfig({ ...brandConfig, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={brandConfig.primaryColor}
                        onChange={(e) => setBrandConfig({ ...brandConfig, primaryColor: e.target.value })}
                        className="bg-secondary/50 border-border font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandConfig.secondaryColor}
                        onChange={(e) => setBrandConfig({ ...brandConfig, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={brandConfig.secondaryColor}
                        onChange={(e) => setBrandConfig({ ...brandConfig, secondaryColor: e.target.value })}
                        className="bg-secondary/50 border-border font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Heading Font</Label>
                    <select
                      value={brandConfig.fontHeading}
                      onChange={(e) => setBrandConfig({ ...brandConfig, fontHeading: e.target.value })}
                      className="w-full h-10 rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground"
                    >
                      {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Body Font</Label>
                    <select
                      value={brandConfig.fontBody}
                      onChange={(e) => setBrandConfig({ ...brandConfig, fontBody: e.target.value })}
                      className="w-full h-10 rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground"
                    >
                      {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Logo URL</Label>
                  <Input
                    placeholder="https://yourbrand.com/logo.png"
                    value={brandConfig.logoUrl}
                    onChange={(e) => setBrandConfig({ ...brandConfig, logoUrl: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                {/* Brand preview */}
                <div className="p-4 rounded-lg border border-border/50 bg-secondary/20">
                  <div className="text-xs text-muted-foreground mb-2">Preview</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: brandConfig.primaryColor }} />
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: brandConfig.secondaryColor }} />
                    <div className="text-sm" style={{ fontFamily: brandConfig.fontHeading }}>
                      <span className="font-bold text-foreground">Heading</span>
                    </div>
                    <div className="text-sm" style={{ fontFamily: brandConfig.fontBody }}>
                      <span className="text-muted-foreground">Body text</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleBrandConfig} className="w-full gradient-teal text-primary-foreground hover:opacity-90" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : <><Rocket className="mr-2" size={16} /> Launch Animus</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
