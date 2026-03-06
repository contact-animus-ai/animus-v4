import { z } from "zod";

const envSchema = z.object({
  // Supabase (required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),

  // AI Services
  ANTHROPIC_API_KEY: z.string().min(1),
  MANUS_API_KEY: z.string().optional(),
  PERPLEXITY_API_KEY: z.string().optional(),
  IDEOGRAM_API_KEY: z.string().optional(),

  // Scraping
  FIRECRAWL_API_KEY: z.string().optional(),

  // Inngest (async job orchestration)
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Shopify OAuth
  SHOPIFY_CLIENT_ID: z.string().optional(),
  SHOPIFY_CLIENT_SECRET: z.string().optional(),
  SHOPIFY_SCOPES: z.string().optional(),

  // Stripe Billing
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

// Validate at import time — crashes early if required vars are missing
export const env = envSchema.parse(process.env);
