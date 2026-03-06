import { inngest } from "@/lib/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { decrypt } from "@/lib/crypto";
import { createKlaviyoSegments } from "@/lib/skills/segment-creator";

export const createSegmentsFunction = inngest.createFunction(
  { id: "create-klaviyo-segments", retries: 1 },
  { event: "segments/create.requested" },
  async ({ event, step }) => {
    const { merchantId, conversationId, auditId, segments } = event.data;

    // Get Klaviyo key
    const apiKey = await step.run("get-klaviyo-key", async () => {
      const { data } = await supabaseAdmin
        .from("merchants")
        .select("klaviyo_api_key")
        .eq("id", merchantId)
        .single();
      if (!data?.klaviyo_api_key) throw new Error("No Klaviyo API key");
      return decrypt(data.klaviyo_api_key);
    });

    // Create segments in Klaviyo
    const results = await step.run("create-segments", () =>
      createKlaviyoSegments(apiKey, segments)
    );

    // Save to database
    await step.run("save-segments", async () => {
      for (const result of results) {
        await supabaseAdmin.from("klaviyo_segments").insert({
          merchant_id: merchantId,
          audit_id: auditId,
          klaviyo_segment_id: result.klaviyo_segment_id,
          name: result.name,
          definition: segments.find((s: { name: string }) => s.name === result.name)?.definition ?? {},
          status: result.status,
        });

        if (result.status === "created") {
          await supabaseAdmin.from("usage_events").insert({
            merchant_id: merchantId,
            event_type: "segment_created",
            metadata: { segment_name: result.name },
          });
        }
      }

      const created = results.filter((r) => r.status === "created");
      const segmentNames = created.map((r) => r.name).join(", ");

      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        merchant_id: merchantId,
        role: "assistant",
        content: `I've created ${created.length} segments in your Klaviyo account: ${segmentNames}. Ready to generate emails for these segments.`,
        message_type: "text",
      });

      await supabaseAdmin
        .from("merchants")
        .update({ merchant_state: "ready_for_execution" })
        .eq("id", merchantId);
    });

    return { success: true, created: results.filter((r) => r.status === "created").length };
  }
);
