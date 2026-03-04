"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Step = "onboarding_shopify" | "onboarding_klaviyo" | "onboarding_brand" | "loading";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(false);
  const [shopUrl, setShopUrl] = useState("");
  const [klaviyoKey, setKlaviyoKey] = useState("");
  const [brand, setBrand] = useState({
    primaryColor: "#1A1A1A",
    secondaryColor: "#F5F0EB",
    fontHeading: "",
    fontBody: "",
    logoUrl: "",
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("merchants")
        .select("merchant_state")
        .eq("auth_user_id", user.id)
        .single();
      if (data) {
        if (data.merchant_state.startsWith("onboarding_")) {
          setStep(data.merchant_state as Step);
        } else {
          router.push("/chat");
        }
      }
    }
    load();
  }, []);

  const stepNumber = step === "onboarding_shopify" ? 1 : step === "onboarding_klaviyo" ? 2 : 3;

  async function handleShopify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/shopify-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop: shopUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("onboarding_klaviyo");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  async function handleKlaviyo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/klaviyo-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: klaviyoKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("onboarding_brand");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  async function handleBrand(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/brand-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("loading");
      setTimeout(() => router.push("/chat"), 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  }

  if (!step) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Setting up your workspace...</h2>
          <p className="text-gray-400 text-sm">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-[#111] rounded-xl p-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                n <= stepNumber ? "bg-white text-black" : "bg-[#222] text-gray-500"
              }`}>
                {n}
              </div>
              {n < 3 && <div className={`w-12 h-0.5 ${n < stepNumber ? "bg-white" : "bg-[#222]"}`} />}
            </div>
          ))}
          <span className="ml-3 text-sm text-gray-400">Step {stepNumber} of 3</span>
        </div>

        {/* Step 1: Shopify */}
        {step === "onboarding_shopify" && (
          <form onSubmit={handleShopify} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Connect your Shopify store</h2>
              <p className="text-gray-400 text-sm">We will sync your products, customers, and orders.</p>
            </div>
            <input
              type="text"
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
              placeholder="your-store.myshopify.com"
              className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555]"
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Connecting..." : "Connect"}
            </button>
          </form>
        )}

        {/* Step 2: Klaviyo */}
        {step === "onboarding_klaviyo" && (
          <form onSubmit={handleKlaviyo} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Connect your Klaviyo account</h2>
              <p className="text-gray-400 text-sm">We will analyze your email performance and create segments.</p>
            </div>
            <input
              type="text"
              value={klaviyoKey}
              onChange={(e) => setKlaviyoKey(e.target.value)}
              placeholder="pk_xxxxxxxxxxxxx"
              className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555] font-mono"
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Validating..." : "Connect"}
            </button>
          </form>
        )}

        {/* Step 3: Brand Config */}
        {step === "onboarding_brand" && (
          <form onSubmit={handleBrand} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Configure your brand</h2>
              <p className="text-gray-400 text-sm">These settings ensure every email matches your brand.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.primaryColor}
                    onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.primaryColor}
                    onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                    className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.secondaryColor}
                    onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.secondaryColor}
                    onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                    className="flex-1 bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Heading Font</label>
              <input
                type="text"
                value={brand.fontHeading}
                onChange={(e) => setBrand({ ...brand, fontHeading: e.target.value })}
                placeholder="Neue Haas Grotesk"
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Body Font</label>
              <input
                type="text"
                value={brand.fontBody}
                onChange={(e) => setBrand({ ...brand, fontBody: e.target.value })}
                placeholder="Inter"
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Logo URL</label>
              <input
                type="url"
                value={brand.logoUrl}
                onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })}
                placeholder="https://cdn.shopify.com/.../logo.png"
                className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#555]"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
