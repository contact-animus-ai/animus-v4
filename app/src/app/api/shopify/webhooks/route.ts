import { NextResponse } from "next/server";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

function verifyShopifyHmac(rawBody: string, hmacHeader: string, secret: string): boolean {
  const computed = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  return computed === hmacHeader;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const hmac = request.headers.get("X-Shopify-Hmac-Sha256");
    const topic = request.headers.get("X-Shopify-Topic");

    const secret = process.env.SHOPIFY_CLIENT_SECRET;
    if (secret && hmac) {
      if (!verifyShopifyHmac(rawBody, hmac, secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    console.log(`[Shopify Webhook] ${topic}`);

    // TODO: Handle Shopify webhook topics when integration is complete
    // topics: orders/create, products/update, app/uninstalled, etc.

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Shopify webhook error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
