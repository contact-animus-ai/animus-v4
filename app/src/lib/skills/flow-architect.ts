/**
 * Skill: Flow Architect
 * Designs optimal Klaviyo flow structures based on audit insights.
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface FlowEmailStep {
  position: number;
  delay_hours: number;
  subject_line: string;
  content_angle: string;
  purpose: string;
}

export interface FlowRecommendation {
  id: string;
  name: string;
  trigger_type: "metric" | "list" | "segment" | "price_drop" | "date";
  trigger_description: string;
  segment_name: string;
  segment_definition: Record<string, unknown>;
  emails: FlowEmailStep[];
  estimated_monthly_revenue: number;
  rationale: string;
}

export interface FlowArchitectureResult {
  flows: FlowRecommendation[];
  segments_to_create: {
    name: string;
    definition: Record<string, unknown>;
  }[];
}

export async function designFlows(
  confirmedOpportunities: { id: string; title: string; description: string }[],
  auditContext: string
): Promise<FlowArchitectureResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: `You are an expert Klaviyo flow architect. Design specific email flows for confirmed revenue opportunities.

For each opportunity, return:
- Flow specification with trigger type, timing, and emails
- Exact Klaviyo segment definition (using Klaviyo's condition format)
- Subject lines and content angles for each email in the flow

Return a JSON object with:
- flows: array of flow recommendations
- segments_to_create: array of { name, definition } for segments that need to be created in Klaviyo

Each flow should have:
- id: short identifier
- name: human-readable flow name
- trigger_type: "metric" | "list" | "segment" | "price_drop" | "date"
- trigger_description: what triggers this flow
- segment_name: target segment name
- segment_definition: Klaviyo segment conditions as JSON
- emails: array of { position, delay_hours, subject_line, content_angle, purpose }
- estimated_monthly_revenue: number
- rationale: why this flow will work

Return ONLY valid JSON, no markdown.`,
    messages: [
      {
        role: "user",
        content: `Confirmed opportunities:\n${JSON.stringify(confirmedOpportunities, null, 2)}\n\nAudit context:\n${auditContext}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text) as FlowArchitectureResult;
}
