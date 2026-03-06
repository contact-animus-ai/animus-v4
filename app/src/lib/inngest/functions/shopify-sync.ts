import { inngest } from "@/lib/inngest/client";
import { syncShopifyData } from "@/lib/skills/shopify-analytics";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const syncShopifyFunction = inngest.createFunction(
  { id: "sync-shopify-data", retries: 2 },
  { event: "shopify/sync.requested" },
  async ({ event, step }) => {
    const { merchantId, shopifyStoreUrl } = event.data;

    const stats = await step.run("sync-store-data", () =>
      syncShopifyData(merchantId, shopifyStoreUrl)
    );

    await step.run("log-usage", () =>
      supabaseAdmin.from("usage_events").insert({
        merchant_id: merchantId,
        event_type: "shopify_sync",
        metadata: stats,
      })
    );

    return { success: true, ...stats };
  }
);
