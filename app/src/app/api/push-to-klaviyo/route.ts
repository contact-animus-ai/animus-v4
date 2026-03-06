import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse, AppError } from "@/lib/errors";
import { createKlaviyoTemplate } from "@/lib/klaviyo";
import { decrypt } from "@/lib/crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  templateId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const body = await request.json();
    const { templateId } = bodySchema.parse(body);

    // Get merchant with Klaviyo key
    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("id, klaviyo_api_key")
      .eq("auth_user_id", user.id)
      .single();

    if (!merchant) return errorResponse({ message: "Merchant not found", code: "NOT_FOUND", status: 404 });
    if (!merchant.klaviyo_api_key) {
      throw new AppError("Klaviyo API key not configured. Complete onboarding first.", "KLAVIYO_NOT_CONNECTED", 400);
    }

    // Fetch template from DB
    const { data: template } = await supabaseAdmin
      .from("email_templates")
      .select("id, name, html_content, klaviyo_push_status")
      .eq("id", templateId)
      .eq("merchant_id", merchant.id)
      .single();

    if (!template) throw new AppError("Template not found", "NOT_FOUND", 404);
    if (!template.html_content) throw new AppError("Template has no HTML content", "NO_CONTENT", 400);

    // Decrypt Klaviyo API key
    let apiKey: string;
    try {
      apiKey = decrypt(merchant.klaviyo_api_key);
    } catch {
      // Fallback for keys stored before encryption was added
      apiKey = merchant.klaviyo_api_key;
    }

    // Push to Klaviyo
    const result = await createKlaviyoTemplate(apiKey, template.name, template.html_content);

    // Update push status
    await supabaseAdmin
      .from("email_templates")
      .update({
        klaviyo_push_status: "pushed",
        klaviyo_template_id: result.id,
        pushed_at: new Date().toISOString(),
      })
      .eq("id", templateId);

    return successResponse({
      success: true,
      klaviyoTemplateId: result.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
