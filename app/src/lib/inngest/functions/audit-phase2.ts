import { inngest } from "@/lib/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { designFlows } from "@/lib/skills/flow-architect";

export const auditPhase2Function = inngest.createFunction(
  { id: "audit-phase2", retries: 1 },
  { event: "audit/phase2.requested" },
  async ({ event, step }) => {
    const { merchantId, conversationId, parentAuditId, confirmedOpportunities } = event.data;

    // Get parent audit context
    const parentAudit = await step.run("fetch-parent-audit", async () => {
      const { data } = await supabaseAdmin
        .from("audits")
        .select("result_data")
        .eq("id", parentAuditId)
        .single();
      return data;
    });

    // Create phase 2 audit record
    const auditId = await step.run("create-audit-record", async () => {
      const { data } = await supabaseAdmin
        .from("audits")
        .insert({
          merchant_id: merchantId,
          conversation_id: conversationId,
          audit_type: "flow_recommendation",
          parent_audit_id: parentAuditId,
          confirmed_opportunities: confirmedOpportunities,
          status: "running",
        })
        .select("id")
        .single();
      return data!.id;
    });

    // Send acknowledgment
    await step.run("send-acknowledgment", () =>
      supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        merchant_id: merchantId,
        role: "assistant",
        content: "Great choices. I'm now designing the optimal flow architecture and segment definitions for your confirmed opportunities. This will take a moment.",
        message_type: "text",
      })
    );

    // Design flows
    const flowResult = await step.run("design-flows", () =>
      designFlows(
        confirmedOpportunities,
        JSON.stringify(parentAudit?.result_data ?? {})
      )
    );

    // Save results
    await step.run("save-results", async () => {
      await supabaseAdmin
        .from("audits")
        .update({ status: "complete", result_data: flowResult })
        .eq("id", auditId);

      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        merchant_id: merchantId,
        role: "assistant",
        content: JSON.stringify(flowResult),
        message_type: "audit_result",
        metadata: { audit_id: auditId, audit_type: "flow_recommendation" },
      });

      await supabaseAdmin
        .from("merchants")
        .update({ merchant_state: "awaiting_flow_confirmation" })
        .eq("id", merchantId);
    });

    return { success: true, auditId };
  }
);
