"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

interface Merchant {
  shopify_store_url: string | null;
  klaviyo_api_key: string | null;
  merchant_state: string;
}

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [email, setEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase
        .from("merchants")
        .select("shopify_store_url, klaviyo_api_key, merchant_state")
        .eq("auth_user_id", user.id)
        .single();
      if (data) setMerchant(data);
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Profile */}
      <section className="bg-[#111] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p className="text-white text-sm">{email}</p>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-[#111] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Integrations</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${merchant?.shopify_store_url ? "bg-green-400" : "bg-gray-500"}`} />
              <span className="text-sm text-white">Shopify</span>
            </div>
            <span className="text-sm text-gray-400">
              {merchant?.shopify_store_url || "Not connected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${merchant?.klaviyo_api_key ? "bg-green-400" : "bg-gray-500"}`} />
              <span className="text-sm text-white">Klaviyo</span>
            </div>
            <span className="text-sm text-gray-400">
              {merchant?.klaviyo_api_key ? "pk_****" : "Not connected"}
            </span>
          </div>
        </div>
      </section>

      {/* Billing */}
      <section className="bg-[#111] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Billing</h2>
        <p className="text-sm text-gray-400">Current Plan: <span className="text-white">Free</span></p>
        <button className="mt-3 text-sm text-gray-400 hover:text-white transition-colors">
          Manage Subscription →
        </button>
      </section>
    </div>
  );
}
