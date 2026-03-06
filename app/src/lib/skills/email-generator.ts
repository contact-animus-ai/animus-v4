/**
 * Skill: Email Generator
 * Claude generates structured JSON email components using merchant's brand config.
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface EmailComponent {
  id: string;
  type: "HeadingBlock" | "TextBlock" | "ButtonBlock" | "ImageBlock" | "SpacerBlock" | "DividerBlock" | "SectionBlock";
  props: Record<string, unknown>;
  children?: EmailComponent[];
}

export interface BrandConfig {
  primary_color: string;
  secondary_color: string;
  font_heading: string;
  font_body: string;
  logo_url: string;
}

export interface EmailGenerationResult {
  components: EmailComponent[];
  subject_line: string;
  preview_text: string;
}

export async function generateEmail(
  brandConfig: BrandConfig,
  request: string,
  strategyContext?: string
): Promise<EmailGenerationResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: `You are an expert email designer for Shopify merchants. Generate a structured email as a JSON object.

Brand Configuration:
- Primary Color: ${brandConfig.primary_color}
- Secondary Color: ${brandConfig.secondary_color}
- Heading Font: ${brandConfig.font_heading}
- Body Font: ${brandConfig.font_body}
- Logo URL: ${brandConfig.logo_url}

Available component types and their props:

1. HeadingBlock: { text: string, level: "h1"|"h2"|"h3", alignment: "left"|"center"|"right", color: string, fontSize: string }
2. TextBlock: { text: string, alignment: "left"|"center"|"right", color: string, fontSize: string }
3. ButtonBlock: { text: string, href: string, bgColor: string, textColor: string, borderRadius: string, padding: string }
4. ImageBlock: { src: string, alt: string, width: string, height: string }
5. SpacerBlock: { height: string }
6. DividerBlock: { borderColor: string, borderWidth: string }
7. SectionBlock: { backgroundColor: string, paddingTop: string, paddingBottom: string, children: Component[] }

Return a JSON object with:
- components: array of components (each with unique "id", "type", and "props")
- subject_line: compelling email subject line
- preview_text: preview/preheader text

Rules:
- Use the brand colors and fonts consistently
- Every component must have a unique "id" field (use short random strings like "h1_abc")
- Make the email compelling, professional, and conversion-focused
- Include a clear CTA button
- Use SectionBlock to group related content with background colors

Return ONLY valid JSON, no markdown.`,
    messages: [
      {
        role: "user",
        content: `${strategyContext ? `Strategy context: ${strategyContext}\n\n` : ""}Merchant request: ${request}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text) as EmailGenerationResult;
}

export async function refineEmail(
  brandConfig: BrandConfig,
  currentComponents: EmailComponent[],
  instruction: string
): Promise<EmailComponent[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: `You are editing an existing email template. The merchant wants to change specific parts. Return ONLY the updated components as a JSON array. Only include components that changed — use the same "id" values so the frontend can merge them. If adding new components, generate new unique IDs.

Brand: primary=${brandConfig.primary_color}, secondary=${brandConfig.secondary_color}, heading_font=${brandConfig.font_heading}, body_font=${brandConfig.font_body}

Return ONLY valid JSON array, no markdown.`,
    messages: [
      {
        role: "user",
        content: `Current email components:\n${JSON.stringify(currentComponents, null, 2)}\n\nChange requested: ${instruction}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text) as EmailComponent[];
}
