/**
 * Skill: Audit Generator
 * Combines Klaviyo metrics, Shopify KPIs, Perplexity benchmarks,
 * and Manus research into a structured audit JSON.
 */

import Anthropic from "@anthropic-ai/sdk";
import { getKlaviyoMetrics, type KlaviyoAccountMetrics } from "./klaviyo-metrics";
import { getShopifyKPIs, type ShopifyKPIs } from "./shopify-analytics";
import { getIndustryBenchmarks } from "./perplexity-search";

const anthropic = new Anthropic();

export interface AuditOpportunity {
  id: string;
  title: string;
  description: string;
  estimated_monthly_revenue: number;
  priority: "high" | "medium" | "low";
  category: string;
}

export interface AuditResult {
  health_score: number;
  summary: string;
  klaviyo_metrics: KlaviyoAccountMetrics;
  shopify_kpis: ShopifyKPIs;
  industry_benchmarks: string;
  opportunities: AuditOpportunity[];
  recommendations: string[];
}

export async function generateAudit(
  klaviyoApiKey: string,
  merchantId: string,
  industry?: string
): Promise<AuditResult> {
  // Pull data from all sources in parallel
  const [klaviyoMetrics, shopifyKPIs, benchmarks] = await Promise.all([
    getKlaviyoMetrics(klaviyoApiKey),
    getShopifyKPIs(merchantId),
    industry ? getIndustryBenchmarks(industry) : Promise.resolve(null),
  ]);

  // Feed all data to Claude for analysis
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: `You are an expert email marketing analyst. Analyze the provided Klaviyo and Shopify data to produce a structured audit.

Return a JSON object with:
- health_score: 0-100 overall email marketing health
- summary: 2-3 sentence overview
- opportunities: array of { id (short string), title, description, estimated_monthly_revenue (number), priority ("high"|"medium"|"low"), category (e.g. "welcome_flow", "abandoned_cart", "winback", "post_purchase", "segmentation") }
- recommendations: array of actionable recommendation strings

Be specific with revenue estimates based on the data. Identify gaps (missing flows, underperforming campaigns, unsegmented lists).

Return ONLY valid JSON, no markdown.`,
    messages: [
      {
        role: "user",
        content: `Klaviyo Data:\n${JSON.stringify(klaviyoMetrics, null, 2)}\n\nShopify KPIs:\n${JSON.stringify(shopifyKPIs, null, 2)}${benchmarks ? `\n\nIndustry Benchmarks:\n${benchmarks.answer}` : ""}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const analysis = JSON.parse(content.text) as {
    health_score: number;
    summary: string;
    opportunities: AuditOpportunity[];
    recommendations: string[];
  };

  return {
    ...analysis,
    klaviyo_metrics: klaviyoMetrics,
    shopify_kpis: shopifyKPIs,
    industry_benchmarks: benchmarks?.answer ?? "",
  };
}
