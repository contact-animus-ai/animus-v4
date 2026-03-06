import { inngest } from "@/lib/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { refineEmail } from "@/lib/skills/email-generator";
import type { BrandConfig, EmailComponent } from "@/lib/skills/email-generator";

export const refineEmailFunction = inngest.createFunction(
  { id: "refine-email", retries: 1 },
  { event: "email/refine.requested" },
  async ({ event, step }) => {
    const { merchantId, templateId, instruction } = event.data;

    // Get brand config and current template
    const { brandConfig, currentComponents } = await step.run("fetch-data", async () => {
      const [{ data: brand }, { data: template }] = await Promise.all([
        supabaseAdmin
          .from("brand_configs")
          .select("primary_color, secondary_color, font_heading, font_body, logo_url")
          .eq("merchant_id", merchantId)
          .single(),
        supabaseAdmin
          .from("templates")
          .select("components_json")
          .eq("id", templateId)
          .eq("merchant_id", merchantId)
          .single(),
      ]);

      if (!brand) throw new Error("No brand config found");
      if (!template) throw new Error("Template not found");

      return {
        brandConfig: brand as BrandConfig,
        currentComponents: template.components_json as EmailComponent[],
      };
    });

    // Refine with Claude
    const updatedComponents = await step.run("refine-email", () =>
      refineEmail(brandConfig, currentComponents, instruction)
    );

    // Merge updated components into existing
    await step.run("save-updates", async () => {
      const merged = currentComponents.map((existing) => {
        const updated = updatedComponents.find((u) => u.id === existing.id);
        return updated ?? existing;
      });

      // Add any new components
      const newComponents = updatedComponents.filter(
        (u) => !currentComponents.some((e) => e.id === u.id)
      );
      merged.push(...newComponents);

      await supabaseAdmin
        .from("templates")
        .update({ components_json: merged })
        .eq("id", templateId);
    });

    return { success: true, updatedCount: updatedComponents.length };
  }
);
