/**
 * Skill: Image Generator
 * Generates email hero images and product visuals using Ideogram API.
 */

const IDEOGRAM_API_BASE = "https://api.ideogram.ai";

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export async function generateEmailImage(
  prompt: string,
  brandColors?: { primary: string; secondary: string }
): Promise<GeneratedImage> {
  const key = process.env.IDEOGRAM_API_KEY;
  if (!key) throw new Error("IDEOGRAM_API_KEY not configured");

  const colorContext = brandColors
    ? ` Use brand colors: primary ${brandColors.primary}, secondary ${brandColors.secondary}.`
    : "";

  const fullPrompt = `Professional email marketing hero image. ${prompt}${colorContext} Clean, modern, high-quality, suitable for email header at 600px wide.`;

  const res = await fetch(`${IDEOGRAM_API_BASE}/generate`, {
    method: "POST",
    headers: {
      "Api-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_request: {
        prompt: fullPrompt,
        aspect_ratio: "ASPECT_3_1",
        model: "V_2",
        magic_prompt_option: "AUTO",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ideogram API error (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  const imageUrl = json.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error("No image returned from Ideogram");
  }

  return { url: imageUrl, prompt: fullPrompt };
}
