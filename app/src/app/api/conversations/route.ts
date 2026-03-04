import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse } from "@/lib/errors";
import { z } from "zod";

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

    const { data: conversations } = await supabaseAdmin
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("merchant_id", merchant.id)
      .order("updated_at", { ascending: false });

    return successResponse(conversations || []);
  } catch (error) {
    return errorResponse(error);
  }
}

const createSchema = z.object({
  title: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const body = await request.json();
    const { title } = createSchema.parse(body);

    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!merchant) return errorResponse({ message: "Merchant not found", code: "NOT_FOUND", status: 404 });

    const { data: conversation, error } = await supabaseAdmin
      .from("conversations")
      .insert({
        merchant_id: merchant.id,
        title: title || null,
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(conversation, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
