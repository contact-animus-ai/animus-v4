/**
 * Skill: Klaviyo Metrics
 * Pulls and computes KPIs from Klaviyo API for audit analysis.
 */

const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const REVISION = "2024-10-15";

function headers(apiKey: string): Record<string, string> {
  return {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: REVISION,
    Accept: "application/json",
  };
}

export interface KlaviyoFlowMetrics {
  id: string;
  name: string;
  status: string;
  trigger_type: string;
}

export interface KlaviyoCampaignMetrics {
  id: string;
  name: string;
  status: string;
  send_time: string | null;
  subject: string | null;
}

export interface KlaviyoAccountMetrics {
  flows: KlaviyoFlowMetrics[];
  campaigns: KlaviyoCampaignMetrics[];
  lists: { id: string; name: string; profile_count: number }[];
  segments: { id: string; name: string; profile_count: number }[];
  total_profiles: number;
}

async function fetchPaginated<T>(
  apiKey: string,
  path: string,
  extractItems: (json: Record<string, unknown>) => T[]
): Promise<T[]> {
  const items: T[] = [];
  let url: string | null = `${KLAVIYO_API_BASE}${path}`;

  while (url) {
    const res: Response = await fetch(url, { headers: headers(apiKey) });
    if (!res.ok) {
      throw new Error(`Klaviyo ${path} error (${res.status}): ${await res.text()}`);
    }
    const json: Record<string, unknown> = await res.json();
    items.push(...extractItems(json));
    url = (json.links as Record<string, string> | undefined)?.next ?? null;
  }

  return items;
}

export async function getKlaviyoMetrics(apiKey: string): Promise<KlaviyoAccountMetrics> {
  const [flows, campaigns, lists, segments] = await Promise.all([
    fetchPaginated<KlaviyoFlowMetrics>(apiKey, "/flows/?page[size]=50", (json) =>
      (json.data as Array<Record<string, unknown>>).map((f: Record<string, unknown>) => ({
        id: f.id as string,
        name: (f.attributes as Record<string, unknown>).name as string,
        status: (f.attributes as Record<string, unknown>).status as string,
        trigger_type: (f.attributes as Record<string, unknown>).trigger_type as string,
      }))
    ),
    fetchPaginated<KlaviyoCampaignMetrics>(apiKey, "/campaigns/?page[size]=50", (json) =>
      (json.data as Array<Record<string, unknown>>).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: (c.attributes as Record<string, unknown>).name as string,
        status: (c.attributes as Record<string, unknown>).status as string,
        send_time: ((c.attributes as Record<string, unknown>).send_time as string) ?? null,
        subject: ((c.attributes as Record<string, unknown>).subject as string) ?? null,
      }))
    ),
    fetchPaginated<{ id: string; name: string; profile_count: number }>(
      apiKey,
      "/lists/?page[size]=50",
      (json) =>
        (json.data as Array<Record<string, unknown>>).map((l: Record<string, unknown>) => ({
          id: l.id as string,
          name: (l.attributes as Record<string, unknown>).name as string,
          profile_count: ((l.attributes as Record<string, unknown>).profile_count as number) ?? 0,
        }))
    ),
    fetchPaginated<{ id: string; name: string; profile_count: number }>(
      apiKey,
      "/segments/?page[size]=50",
      (json) =>
        (json.data as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: (s.attributes as Record<string, unknown>).name as string,
          profile_count: ((s.attributes as Record<string, unknown>).profile_count as number) ?? 0,
        }))
    ),
  ]);

  const totalProfiles = lists.reduce((sum, l) => sum + l.profile_count, 0);

  return {
    flows,
    campaigns,
    lists,
    segments,
    total_profiles: totalProfiles,
  };
}
