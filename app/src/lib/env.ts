import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  MANUS_API_KEY: z.string().optional(),
  N8N_CHAT_URL: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  SHOPIFY_CLIENT_ID: z.string().optional(),
  SHOPIFY_CLIENT_SECRET: z.string().optional(),
  SHOPIFY_SCOPES: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  THESYS_API_KEY: z.string().optional(),
  THESYS_PROJECT_ID: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

// Validate at import time — crashes early if required vars are missing
export const env = envSchema.parse(process.env);
