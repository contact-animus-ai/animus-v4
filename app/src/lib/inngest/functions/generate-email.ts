import { inngest } from "@/lib/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateEmail } from "@/lib/skills/email-generator";
import type { BrandConfig } from "@/lib/skills/email-generator";

export const generateEmailFunction = inngest.createFunction(
  { id: "generate-email", retries: 1 },
  { event: "email/generate.requested" },
  async ({ event, step }) => {
    const { merchantId, conversationId, message } = event.data;

    // Get brand config
    const brandConfig = await step.run("get-brand-config", async () => {
      const { data } = await supabaseAdmin
        .from("brand_configs")
        .select("primary_color, secondary_color, font_heading, font_body, logo_url")
        .eq("merchant_id", merchantId)
        .single();
      if (!data) throw new Error("No brand config found");
      return data as BrandConfig;
    });

    // Generate email
    const result = await step.run("generate-email", () =>
      generateEmail(brandConfig, message)
    );

    // Save as draft template
    const templateId = await step.run("save-template", async () => {
      const { data } = await supabaseAdmin
        .from("templates")
        .insert({
          merchant_id: merchantId,
          conversation_id: conversationId,
          name: result.subject_line,
          components_json: result.components,
          subject_line: result.subject_line,
          preview_text: result.preview_text,
          klaviyo_push_status: "draft",
        })
        .select("id")
        .single();
      return data!.id;
    });

    // Insert message with email preview
    await step.run("insert-message", async () => {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        merchant_id: merchantId,
        role: "assistant",
        content: JSON.stringify(result),
        message_type: "email_components",
        metadata: { template_id: templateId },
      });

      await supabaseAdmin.from("usage_events").insert({
        merchant_id: merchantId,
        event_type: "email_generated",
        metadata: { template_id: templateId },
      });
    });

    return { success: true, templateId };
  }
);
