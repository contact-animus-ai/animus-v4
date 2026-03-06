/**
 * Skill: Klaviyo Push
 * Pushes finalized email HTML to Klaviyo as a template.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";
import { decrypt } from "@/lib/crypto";
import { compileEmailToHtml } from "./email-compiler";
import type { EmailComponent, BrandConfig } from "./email-generator";

export interface KlaviyoPushResult {
  template_id: string;
  name: string;
}

export async function pushToKlaviyo(
  merchantId: string,
  templateId: string
): Promise<KlaviyoPushResult> {
  // Get merchant's Klaviyo key
  const { data: merchant } = await supabaseAdmin
    .from("merchants")
    .select("klaviyo_api_key")
    .eq("id", merchantId)
    .single();

  if (!merchant?.klaviyo_api_key) {
    throw new Error("No Klaviyo API key found");
  }

  const apiKey = decrypt(merchant.klaviyo_api_key);

  // Get template
  const { data: template } = await supabaseAdmin
    .from("templates")
    .select("name, components_json")
    .eq("id", templateId)
    .eq("merchant_id", merchantId)
    .single();

  if (!template) {
    throw new Error("Template not found");
  }

  // Get brand config
  const { data: brandConfig } = await supabaseAdmin
    .from("brand_configs")
    .select("primary_color, secondary_color, font_heading, font_body, logo_url")
    .eq("merchant_id", merchantId)
    .single();

  if (!brandConfig) {
    throw new Error("Brand config not found");
  }

  // Compile to HTML
  const components = template.components_json as EmailComponent[];
  const html = compileEmailToHtml(components, brandConfig as BrandConfig);

  // Push to Klaviyo
  const res = await fetch("https://a.klaviyo.com/api/templates/", {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: "2024-10-15",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "template",
        attributes: {
          name: template.name,
          editor_type: "CODE",
          html,
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Klaviyo template push error (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  const klaviyoTemplateId = json.data.id;

  // Update template record
  await supabaseAdmin
    .from("templates")
    .update({
      klaviyo_template_id: klaviyoTemplateId,
      klaviyo_push_status: "pushed",
    })
    .eq("id", templateId);

  return {
    template_id: klaviyoTemplateId,
    name: template.name,
  };
}
