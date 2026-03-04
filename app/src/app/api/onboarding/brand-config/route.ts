import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse } from "@/lib/errors";
import { z } from "zod";

const bodySchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  fontHeading: z.string().min(1, "Heading font is required"),
  fontBody: z.string().min(1, "Body font is required"),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const body = await request.json();
    const { primaryColor, secondaryColor, fontHeading, fontBody, logoUrl } = bodySchema.parse(body);

    // Get merchant ID
    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!merchant) return errorResponse({ message: "Merchant not found", code: "NOT_FOUND", status: 404 });

    // Upsert brand config
    const { error: brandError } = await supabaseAdmin
      .from("brand_configs")
      .upsert(
        {
          merchant_id: merchant.id,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          font_heading: fontHeading,
          font_body: fontBody,
          logo_url: logoUrl || null,
        },
        { onConflict: "merchant_id" }
      );

    if (brandError) throw brandError;

    // Update merchant state
    const { error: stateError } = await supabaseAdmin
      .from("merchants")
      .update({ merchant_state: "awaiting_audit" })
      .eq("id", merchant.id);

    if (stateError) throw stateError;

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
