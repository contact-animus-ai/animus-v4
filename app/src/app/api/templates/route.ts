import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse } from "@/lib/errors";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!merchant) return errorResponse({ message: "Merchant not found", code: "NOT_FOUND", status: 404 });

    const { data: templates } = await supabaseAdmin
      .from("templates")
      .select("id, name, klaviyo_push_status, created_at, updated_at")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false });

    return successResponse(templates || []);
  } catch (error) {
    return errorResponse(error);
  }
}
