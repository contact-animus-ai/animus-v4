import { NextResponse } from "next/server";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

function verifyStripeSignature(payload: string, sigHeader: string, secret: string): boolean {
  const parts = sigHeader.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signature = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sigHeader = request.headers.get("stripe-signature");

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (secret && sigHeader) {
      if (!verifyStripeSignature(rawBody, sigHeader, secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log(`[Stripe Webhook] ${event.type} — ${event.id}`);

    // TODO: Handle subscription events when Stripe is fully configured
    // event.type: checkout.session.completed, customer.subscription.updated, etc.

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
