import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { errorResponse, successResponse } from "@/lib/errors";
import { inngest } from "@/lib/inngest/client";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic();

const bodySchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid(),
});

type Intent =
  | "audit"
  | "confirm_opportunities"
  | "confirm_flows"
  | "generate_email"
  | "refine_email"
  | "conversation";

async function classifyIntent(
  message: string,
  merchantState: string
): Promise<Intent> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 50,
    system: `You are an intent classifier for an email marketing operator. Classify the user's message into exactly one of these intents:
- audit: user wants to analyze their Klaviyo/Shopify data or run an audit
- confirm_opportunities: user is confirming which revenue opportunities to pursue (only valid when merchant_state is 'awaiting_opportunity_confirmation')
- confirm_flows: user is confirming flow recommendations (only valid when merchant_state is 'awaiting_flow_confirmation')
- generate_email: user wants to create, build, or generate an email template
- refine_email: user wants to modify a specific part of an existing email
- conversation: general question, advice, or anything else

Respond with ONLY the intent name, nothing else.`,
    messages: [
      { role: "user", content: `Merchant state: ${merchantState}\nMessage: ${message}` },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") return "conversation";
  const intent = content.text.trim().toLowerCase() as Intent;
  const validIntents: Intent[] = ["audit", "confirm_opportunities", "confirm_flows", "generate_email", "refine_email", "conversation"];
  return validIntents.includes(intent) ? intent : "conversation";
}

async function handleConversation(
  message: string,
  merchantState: string,
  conversationHistory: { role: string; content: string }[]
): Promise<string> {
  const messages = conversationHistory
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Ensure alternating roles by keeping last 20 properly
  const cleaned: { role: "user" | "assistant"; content: string }[] = [];
  for (const msg of messages) {
    if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== msg.role) {
      cleaned.push(msg);
    }
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `You are Animus, an AI email marketing operator for Shopify merchants. You help with email strategy, Klaviyo optimization, campaign planning, and e-commerce marketing. Be concise, actionable, and data-driven. The merchant's current state is: ${merchantState}.

When the merchant is in 'awaiting_audit' state, suggest they type "audit my account" to begin their first analysis.`,
    messages: cleaned.length > 0 ? cleaned : [{ role: "user", content: message }],
  });

  const content = response.content[0];
  return content.type === "text" ? content.text : "I couldn't generate a response. Please try again.";
}

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

    // Fetch last 20 messages for conversation history
    const { data: history } = await supabaseAdmin
      .from("messages")
      .select("role, content, message_type")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversationHistory = (history ?? []).reverse();

    // Classify intent
    const intent = await classifyIntent(message, merchant.merchant_state);

    let assistantContent: string;
    const messageType = "text";
    let metadata: Record<string, unknown> | undefined;

    switch (intent) {
      case "audit": {
        await inngest.send({
          name: "audit/phase1.requested",
          data: { merchantId: merchant.id, conversationId },
        });
        assistantContent = "Starting your account audit now. I'll pull your Klaviyo metrics, Shopify data, and industry benchmarks. This will take a minute — I'll post the results here when ready.";
        break;
      }

      case "confirm_opportunities": {
        // Get the latest audit for this merchant
        const { data: latestAudit } = await supabaseAdmin
          .from("audits")
          .select("id")
          .eq("merchant_id", merchant.id)
          .eq("audit_type", "opportunity_analysis")
          .eq("status", "complete")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestAudit) {
          await inngest.send({
            name: "audit/phase2.requested",
            data: {
              merchantId: merchant.id,
              conversationId,
              parentAuditId: latestAudit.id,
              confirmedOpportunities: message,
            },
          });
          assistantContent = "Got it. I'm designing the optimal flow architecture for your confirmed opportunities now.";
        } else {
          assistantContent = "I don't have a completed audit to reference. Try running an audit first by saying 'audit my account'.";
        }
        break;
      }

      case "confirm_flows": {
        const { data: latestFlowAudit } = await supabaseAdmin
          .from("audits")
          .select("id, result_data")
          .eq("merchant_id", merchant.id)
          .eq("audit_type", "flow_recommendation")
          .eq("status", "complete")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestFlowAudit) {
          const resultData = latestFlowAudit.result_data as { segments_to_create?: { name: string; definition: Record<string, unknown> }[] };
          const segments = resultData?.segments_to_create ?? [];
          await inngest.send({
            name: "segments/create.requested",
            data: {
              merchantId: merchant.id,
              conversationId,
              auditId: latestFlowAudit.id,
              segments,
            },
          });
          assistantContent = `Creating ${segments.length} segments in your Klaviyo account now.`;
        } else {
          assistantContent = "I don't have flow recommendations to confirm yet. Run an audit first.";
        }
        break;
      }

      case "generate_email": {
        await inngest.send({
          name: "email/generate.requested",
          data: { merchantId: merchant.id, conversationId, message },
        });
        assistantContent = "Generating your email now using your brand config. I'll show you a preview here when it's ready.";
        break;
      }

      case "refine_email": {
        // For refinement, we need the template ID — get the latest one
        const { data: latestTemplate } = await supabaseAdmin
          .from("templates")
          .select("id")
          .eq("merchant_id", merchant.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestTemplate) {
          await inngest.send({
            name: "email/refine.requested",
            data: {
              merchantId: merchant.id,
              templateId: latestTemplate.id,
              instruction: message,
            },
          });
          assistantContent = "Updating your email now based on your feedback.";
        } else {
          assistantContent = "No email template found to refine. Try generating one first.";
        }
        break;
      }

      case "conversation":
      default: {
        assistantContent = await handleConversation(
          message,
          merchant.merchant_state,
          conversationHistory
        );
        break;
      }
    }

    // Save assistant message (for sync responses only — async jobs save their own)
    if (intent === "conversation") {
      await supabaseAdmin.from("messages").insert({
        conversation_id: conversationId,
        merchant_id: merchant.id,
        role: "assistant",
        content: assistantContent,
        message_type: messageType,
        ...(metadata ? { metadata } : {}),
      });
    }

    // Update conversation updated_at
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    // Log usage
    await supabaseAdmin.from("usage_events").insert({
      merchant_id: merchant.id,
      event_type: "chat_message",
      metadata: { intent },
    });

    return successResponse({
      role: "assistant",
      content: assistantContent,
      type: messageType,
      ...(metadata ? { metadata } : {}),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
