import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse, AppError } from "@/lib/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const body = await request.json();
    const { apiKey } = bodySchema.parse(body);

    // Validate the Klaviyo API key
    const klaviyoRes = await fetch("https://a.klaviyo.com/api/accounts/", {
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        revision: "2024-10-15",
      },
    });

    if (!klaviyoRes.ok) {
      throw new AppError("Invalid Klaviyo API key. Please check and try again.", "INVALID_API_KEY", 400);
    }

    // Save the key and advance state
    const { error } = await supabaseAdmin
      .from("merchants")
      .update({
        klaviyo_api_key: apiKey,
        merchant_state: "onboarding_brand",
      })
      .eq("auth_user_id", user.id);

    if (error) throw error;

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
