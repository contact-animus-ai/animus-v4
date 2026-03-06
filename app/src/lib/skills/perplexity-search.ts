/**
 * Skill: Perplexity Search
 * Real-time web search for industry benchmarks, trends, and competitor intel.
 */

const PERPLEXITY_API_BASE = "https://api.perplexity.ai";

export interface PerplexitySearchResult {
  answer: string;
  citations: string[];
}

export async function searchPerplexity(
  query: string,
  context?: string
): Promise<PerplexitySearchResult> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY not configured");

  const systemMessage = context
    ? `You are a research assistant for an email marketing AI platform. Context: ${context}. Provide data-driven, specific answers with numbers and benchmarks where possible.`
    : "You are a research assistant for an email marketing AI platform. Provide data-driven, specific answers with numbers and benchmarks where possible.";

  const res = await fetch(`${PERPLEXITY_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: query },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return {
    answer: json.choices?.[0]?.message?.content ?? "",
    citations: json.citations ?? [],
  };
}

export async function getIndustryBenchmarks(
  industry: string
): Promise<PerplexitySearchResult> {
  return searchPerplexity(
    `What are the 2026 email marketing benchmarks for ${industry} e-commerce? Include average open rates, click rates, conversion rates, revenue per email, and list growth rate. Compare Klaviyo-specific data if available.`,
    `Researching benchmarks for ${industry} vertical`
  );
}

export async function researchCompetitorEmails(
  competitorUrl: string
): Promise<PerplexitySearchResult> {
  return searchPerplexity(
    `Analyze the email marketing strategy of ${competitorUrl}. What types of emails do they send? What is their welcome series like? How often do they send promotional emails? What design patterns do they use?`,
    `Competitive research for ${competitorUrl}`
  );
}
