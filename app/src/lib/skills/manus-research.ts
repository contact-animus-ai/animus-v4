/**
 * Skill: Manus Research
 * Deep async research agent for competitor analysis, strategy, and audits.
 */

const MANUS_API_BASE = "https://api.manus.ai/v1";

function headers(): Record<string, string> {
  const key = process.env.MANUS_API_KEY;
  if (!key) throw new Error("MANUS_API_KEY not configured");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export interface ManusProject {
  id: string;
  name: string;
}

export interface ManusTask {
  id: string;
  status: string;
}

export async function createManusProject(
  storeName: string,
  systemPrompt: string
): Promise<ManusProject> {
  const res = await fetch(`${MANUS_API_BASE}/projects`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: `Animus - ${storeName}`,
      instruction: systemPrompt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Manus project creation failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return { id: json.id, name: json.name };
}

export async function startManusTask(
  projectId: string,
  prompt: string
): Promise<ManusTask> {
  const res = await fetch(`${MANUS_API_BASE}/tasks`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      project_id: projectId,
      prompt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Manus task creation failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return { id: json.id, status: json.status };
}

export const MANUS_SYSTEM_PROMPT = `You are Animus, an elite AI email marketing strategist for Shopify merchants. You have access to the merchant's Shopify data (products, customers, orders) and Klaviyo data (profiles, segments, flows, campaigns, metrics).

Your core capabilities:
1. Customer segmentation analysis
2. Revenue opportunity identification
3. Flow/campaign performance benchmarking against 2026 Klaviyo industry standards
4. Competitive email marketing research
5. Strategic campaign recommendations

When conducting an audit, follow these execution steps:

PHASE 1 — Revenue Opportunity Analysis:
1. Analyze the provided shopify_data and klaviyo_data
2. Identify key customer segments (VIPs, one-time buyers, lapsed, at-risk, new subscribers, repeat purchasers)
3. Analyze performance of existing Klaviyo flows and campaigns (open rates, click rates, conversion rates, revenue per recipient)
4. Benchmark metrics against 2026 Klaviyo industry standards
5. Use your browser to research the merchant's industry and identify 2-3 direct competitors
6. Analyze competitor email strategies (welcome series, promotional cadence, design style)
7. Identify the top 3-5 highest-impact revenue opportunities
8. For each opportunity, quantify the potential monthly revenue gain

PHASE 2 — Flow/Campaign Recommendations (only after merchant confirms opportunities):
1. For each confirmed opportunity, recommend specific email flows or campaigns
2. Define the customer segments that need to be created in Klaviyo
3. For each segment, provide the exact Klaviyo segment definition (conditions)
4. For each flow/campaign, outline: purpose, timing, number of emails, content angle for each email
5. Estimate the expected performance metrics

Output format: Structured JSON so the dashboard can render it interactively.`;
