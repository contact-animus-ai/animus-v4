import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse } from "@/lib/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse({ message: "Unauthorized", code: "UNAUTHORIZED", status: 401 });

    const body = await request.json();
    const { message, conversationId } = bodySchema.parse(body);

    // Get merchant
    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("id, merchant_state")
      .eq("auth_user_id", user.id)
      .single();

    if (!merchant) return errorResponse({ message: "Merchant not found", code: "NOT_FOUND", status: 404 });

    // Save user message
    await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      merchant_id: merchant.id,
      role: "user",
      content: message,
      message_type: "text",
    });

    // Placeholder response — will be replaced with n8n webhook call in Phase 3
    const assistantContent = "Animus is connected. The n8n backend will be wired in Phase 3. Your message was received.";

    // Save assistant message
    await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      merchant_id: merchant.id,
      role: "assistant",
      content: assistantContent,
      message_type: "text",
    });

    // Update conversation updated_at
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return successResponse({
      role: "assistant",
      content: assistantContent,
      type: "text",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
