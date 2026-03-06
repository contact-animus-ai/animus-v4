import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyN8nSignature } from "@/lib/n8n";
import { z } from "zod";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  type: z.enum(["audit_complete", "email_generated", "general"]),
  merchantId: z.string().uuid(),
  conversationId: z.string().uuid(),
  data: z.object({
    content: z.string(),
    messageType: z.string().default("text"),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Verify HMAC signature
    const signature = request.headers.get("X-Webhook-Signature");
    if (!signature || !verifyN8nSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = payloadSchema.parse(JSON.parse(rawBody));
    const { type, merchantId, conversationId, data } = payload;

    // Insert assistant message
    await supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      merchant_id: merchantId,
      role: "assistant",
      content: data.content,
      message_type: data.messageType,
      ...(data.metadata ? { metadata: data.metadata } : {}),
    });

    // If audit complete, update audits table
    if (type === "audit_complete" && data.metadata?.auditId) {
      await supabaseAdmin
        .from("audits")
        .update({ status: "complete", completed_at: new Date().toISOString() })
        .eq("id", data.metadata.auditId as string);
    }

    // Update conversation timestamp
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("n8n webhook error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
