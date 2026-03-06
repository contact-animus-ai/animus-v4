/**
 * Skill: Segment Creator
 * Creates segments in Klaviyo based on flow architect recommendations.
 */

const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const REVISION = "2024-10-15";

export interface SegmentDefinition {
  name: string;
  definition: Record<string, unknown>;
}

export interface CreatedSegment {
  klaviyo_segment_id: string;
  name: string;
  status: "created" | "failed";
  error?: string;
}

export async function createKlaviyoSegments(
  apiKey: string,
  segments: SegmentDefinition[]
): Promise<CreatedSegment[]> {
  const results: CreatedSegment[] = [];

  for (const segment of segments) {
    try {
      const res = await fetch(`${KLAVIYO_API_BASE}/segments/`, {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${apiKey}`,
          revision: REVISION,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "segment",
            attributes: {
              name: segment.name,
              definition: segment.definition,
            },
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        results.push({
          klaviyo_segment_id: "",
          name: segment.name,
          status: "failed",
          error: `Klaviyo API error (${res.status}): ${errorText}`,
        });
        continue;
      }

      const json = await res.json();
      results.push({
        klaviyo_segment_id: json.data.id,
        name: segment.name,
        status: "created",
      });
    } catch (error) {
      results.push({
        klaviyo_segment_id: "",
        name: segment.name,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
