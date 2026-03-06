/**
 * Skill: Firecrawl Scrape
 * Web scraping for competitor email analysis and brand extraction.
 */

const FIRECRAWL_API_BASE = "https://api.firecrawl.dev/v2";

export interface ScrapeResult {
  markdown: string;
  metadata: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

export interface CrawlResult {
  pages: ScrapeResult[];
  total: number;
}

function headers(): Record<string, string> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not configured");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function scrapePage(url: string): Promise<ScrapeResult> {
  const res = await fetch(`${FIRECRAWL_API_BASE}/scrape`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    throw new Error(`Firecrawl scrape error (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return {
    markdown: json.data?.markdown ?? "",
    metadata: {
      title: json.data?.metadata?.title,
      description: json.data?.metadata?.description,
      ogImage: json.data?.metadata?.ogImage,
    },
  };
}

export async function crawlSite(
  url: string,
  maxPages: number = 10
): Promise<CrawlResult> {
  const res = await fetch(`${FIRECRAWL_API_BASE}/crawl`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      url,
      limit: maxPages,
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  if (!res.ok) {
    throw new Error(`Firecrawl crawl error (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return {
    pages: (json.data ?? []).map((page: Record<string, unknown>) => ({
      markdown: page.markdown ?? "",
      metadata: {
        title: (page.metadata as Record<string, unknown>)?.title,
        description: (page.metadata as Record<string, unknown>)?.description,
        ogImage: (page.metadata as Record<string, unknown>)?.ogImage,
      },
    })),
    total: json.total ?? 0,
  };
}

export async function searchAndScrape(
  query: string,
  limit: number = 5
): Promise<ScrapeResult[]> {
  const res = await fetch(`${FIRECRAWL_API_BASE}/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ query, limit }),
  });

  if (!res.ok) {
    throw new Error(`Firecrawl search error (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return (json.data ?? []).map((result: Record<string, unknown>) => ({
    markdown: result.markdown ?? "",
    metadata: {
      title: (result.metadata as Record<string, unknown>)?.title,
      description: (result.metadata as Record<string, unknown>)?.description,
      ogImage: (result.metadata as Record<string, unknown>)?.ogImage,
    },
  }));
}
