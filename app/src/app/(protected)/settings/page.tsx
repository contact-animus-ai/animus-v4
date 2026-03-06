"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Loader2, ExternalLink } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import * as api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AppSettings() {
  const [merchant, setMerchant] = useState<Record<string, string | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;
        const { data } = await supabase
          .from("merchants")
          .select("*")
          .eq("user_id", authUser.id)
          .single();
        setMerchant(data);
      } catch (err) {
        console.error("Failed to load merchant:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const result = await api.getBillingPortal();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setBillingLoading(false);
    }
  };

  const integrations = [
    {
      name: "Shopify",
      connected: !!merchant?.shopify_domain,
      detail: merchant?.shopify_domain || "Not connected",
    },
    {
      name: "Klaviyo",
      connected: !!merchant?.klaviyo_api_key,
      detail: merchant?.klaviyo_api_key
        ? `${merchant.klaviyo_api_key.substring(0, 6)}...${merchant.klaviyo_api_key.slice(-4)}`
        : "Not connected",
    },
  ];

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "--";

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="glass-card border-border">
            <CardHeader><CardTitle className="text-foreground">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-teal flex items-center justify-center text-primary-foreground text-lg font-bold">
                  {(user?.user_metadata?.full_name || user?.email || "U")
                    .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {user?.user_metadata?.full_name || "User"}
                  </div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="text-sm font-medium text-foreground mt-1">{user?.email || "--"}</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="text-xs text-muted-foreground">Account Created</div>
                  <div className="text-sm font-medium text-foreground mt-1">{createdAt}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : (
            integrations.map((int) => (
              <Card key={int.name} className="glass-card border-border">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      int.connected ? "bg-primary/10" : "bg-secondary/50"
                    }`}>
                      <span className="text-sm font-bold text-foreground">{int.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{int.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{int.detail}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-medium ${int.connected ? "text-primary" : "text-muted-foreground"}`}>
                    {int.connected ? (
                      <><div className="w-2 h-2 rounded-full bg-primary" /> Connected</>
                    ) : (
                      <><X size={14} /> Not Connected</>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card className="glass-card border-border">
            <CardHeader><CardTitle className="text-foreground">Subscription</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-5 rounded-xl bg-primary/10 border border-primary/20">
                <div>
                  <div className="font-semibold text-foreground text-lg">Growth Plan</div>
                  <div className="text-sm text-muted-foreground mt-1">$249/month - Up to 25,000 contacts</div>
                </div>
                <Button
                  onClick={handleManageBilling}
                  disabled={billingLoading}
                  className="gradient-teal text-primary-foreground hover:opacity-90"
                >
                  {billingLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <><ExternalLink size={14} className="mr-2" /> Manage Subscription</>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage your subscription, update payment methods, or download invoices through the Stripe customer portal.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
