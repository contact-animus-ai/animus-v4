import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse } from "@/lib/errors";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const { id } = await params;

    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!merchant) return errorResponse({ message: "Merchant not found", code: "NOT_FOUND", status: 404 });

    // Verify conversation belongs to this merchant
    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("merchant_id", merchant.id)
      .single();

    if (!conversation) return errorResponse({ message: "Conversation not found", code: "NOT_FOUND", status: 404 });

    const { data: messages } = await supabaseAdmin
      .from("messages")
      .select("id, role, content, message_type, metadata, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    return successResponse(messages || []);
  } catch (error) {
    return errorResponse(error);
  }
}
