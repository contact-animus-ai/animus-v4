import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse } from "@/lib/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  shop: z.string().regex(/^[a-zA-Z0-9-]+\.myshopify\.com$/, "Must be a valid myshopify.com URL"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const body = await request.json();
    const { shop } = bodySchema.parse(body);

    // For now, just save the store URL and advance state
    // Full Shopify OAuth will be implemented in Phase 3
    const { error } = await supabaseAdmin
      .from("merchants")
      .update({
        shopify_store_url: shop,
        merchant_state: "onboarding_klaviyo",
      })
      .eq("auth_user_id", user.id);

    if (error) throw error;

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
