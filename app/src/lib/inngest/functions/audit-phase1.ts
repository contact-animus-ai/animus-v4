import { inngest } from "@/lib/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { decrypt } from "@/lib/crypto";
import { generateAudit } from "@/lib/skills/audit-generator";

export const auditPhase1Function = inngest.createFunction(
  { id: "audit-phase1", retries: 1 },
  { event: "audit/phase1.requested" },
  async ({ event, step }) => {
    const { merchantId, conversationId } = event.data;

    // Get merchant data
    const merchant = await step.run("fetch-merchant", async () => {
      const { data } = await supabaseAdmin
        .from("merchants")
        .select("klaviyo_api_key, store_name")
        .eq("id", merchantId)
        .single();
      return data;
    });

    if (!merchant?.klaviyo_api_key) {
      throw new Error("Merchant missing Klaviyo API key");
    }

    // Create audit record
    const auditId = await step.run("create-audit-record", async () => {
      const { data } = await supabaseAdmin
        .from("audits")
        .insert({
          merchant_id: merchantId,
          conversation_id: conversationId,
          audit_type: "opportunity_analysis",
          status: "running",
        })
        .select("id")
        .single();
      return data!.id;
    });

    // Insert acknowledgment message
    await step.run("send-acknowledgment", () =>
      supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        merchant_id: merchantId,
        role: "assistant",
        content: "I'm running a full analysis of your Klaviyo and Shopify data now. This includes pulling your metrics, checking industry benchmarks, and identifying revenue opportunities. I'll show you the results here when it's ready.",
        message_type: "text",
      })
    );

    // Run the audit (this is the heavy step)
    const auditResult = await step.run("run-audit", () =>
      generateAudit(decrypt(merchant.klaviyo_api_key), merchantId)
    );

    // Save results
    await step.run("save-results", async () => {
      await supabaseAdmin
        .from("audits")
        .update({ status: "complete", result_data: auditResult })
        .eq("id", auditId);

      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        merchant_id: merchantId,
        role: "assistant",
        content: JSON.stringify(auditResult),
        message_type: "audit_result",
        metadata: { audit_id: auditId, audit_type: "opportunity_analysis" },
      });

      await supabaseAdmin
        .from("merchants")
        .update({ merchant_state: "awaiting_opportunity_confirmation" })
        .eq("id", merchantId);

      await supabaseAdmin.from("usage_events").insert({
        merchant_id: merchantId,
        event_type: "audit_started",
        metadata: { audit_id: auditId },
      });
    });

    return { success: true, auditId };
  }
);
