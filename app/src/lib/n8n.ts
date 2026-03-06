import { createHmac } from "crypto";

/**
 * Calls an n8n webhook URL with HMAC-SHA256 signature.
 * Returns the raw Response so callers can parse JSON or stream.
 */
export async function callN8nWebhook(
  url: string,
  payload: Record<string, unknown>
): Promise<Response> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (secret) {
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    headers["X-Webhook-Signature"] = signature;
  }

  return fetch(url, {
    method: "POST",
    headers,
    body,
  });
}

/**
 * Verifies an HMAC-SHA256 signature from an incoming n8n webhook callback.
 */
export function verifyN8nSignature(body: string, signature: string): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}
