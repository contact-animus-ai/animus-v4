# Animus V5: The Definitive Implementation Guide

**To:** Phillip Vo
**From:** Claude Code (Your AI Engineer)
**Date:** March 5, 2026
**Version:** 5.0
**Subject:** The complete, production-grade playbook for building Animus as a skill-based, multi-agent marketing operator. This guide supersedes all previous versions (V2, V3, V6 spec). Every workflow is n8n-native. Every API call uses real endpoints. Every prompt is written out in full.

---

## How This Guide Is Different

Previous guides described a chatbot with if/else routing. This guide builds an **autonomous marketing operator** with:

- **Skill-based architecture** — independent, composable capabilities instead of a monolithic router
- **State machine** — the merchant progresses through stages, but can trigger any skill at any time
- **Two-part analysis** — Manus audits first (revenue opportunities), merchant confirms, then strategy recommendations
- **Automated segment creation** — Klaviyo segments are created programmatically based on Manus research
- **Production email editor** — based on react-email-wysiwyg-editor with live preview, properties panel, and chat-based refinement
- **Next.js Async Orchestration** — using Inngest or Trigger.dev to natively run background workflows without serverless timeouts
- **Thesys dashboard** — audit reports and recommendations rendered as interactive components, not Google Docs

---

## Architecture Overview

### The Operator Model

Animus is not a chatbot. The chat interface is how the merchant communicates, but behind it sits an operator that can:

1. **Understand intent** — Claude classifies what the merchant wants
2. **Execute skills** — independent capabilities that can be composed in any order
3. **Track state** — knows where the merchant is in their journey
4. **Act autonomously** — creates segments, generates emails, pushes to Klaviyo without manual steps

### Skills

| Skill | Agent | Trigger | Input | Output |
| ------- | ------- | --------- | ------- | -------- |
| `extract_brand` | Claude Vision | Onboarding | Store URL | Brand config (colors, fonts, logo) |
| `sync_shopify` | Shopify API | Onboarding / on-demand | Access token | Products, customers, orders in Supabase |
| `audit_klaviyo` | Manus AI | User request or post-onboarding | Klaviyo + Shopify data | 14-point analysis, revenue opportunities |
| `recommend_flows` | Manus AI | After merchant confirms opportunities | Confirmed opportunities | Specific flow/campaign recommendations + segments |
| `create_segments` | Klaviyo API | After merchant confirms recommendations | Segment definitions from Manus | Segments created in Klaviyo |
| `generate_email` | Claude API | After segments exist or on-demand | Brand config + segment + strategy | Structured JSON email components |
| `refine_email` | Claude API | Chat message while editor is open | Current components + instruction | Updated component(s) |
| `push_to_klaviyo` | Klaviyo API | Merchant clicks "Push" in editor | Final HTML + segment/flow ID | Template live in Klaviyo |
| `classify_intent` | Claude API | Every chat message | Message text + merchant state | Intent classification → routes to correct skill |

### State Machine

The `merchant_state` field on the `merchants` table tracks progression:

```text
onboarding_shopify        → Merchant needs to connect Shopify
onboarding_klaviyo        → Merchant needs to connect Klaviyo
onboarding_brand          → Merchant needs to configure brand
awaiting_audit            → Ready for first audit (can be auto-triggered)
awaiting_opportunity_confirmation → Audit complete, merchant reviewing opportunities
awaiting_flow_confirmation       → Flow recommendations ready, merchant reviewing
ready_for_execution       → Merchant confirmed, system can create segments + generate emails
active                    → Fully onboarded, all skills available
```

The state machine is a guide, not a jail. A merchant in `active` state can trigger any skill at any time via chat. A merchant in `awaiting_audit` can still ask conversational questions.

---

## The Stack

| Layer | Service | Purpose |
| ------- | --------- | --------- |
| **Frontend** | Next.js 14 (App Router) on Vercel | UI, API routes, serverless functions |
| **Database & Auth** | Supabase | Multi-tenant DB, auth, realtime |
| **Backend Orchestration** | Inngest / Trigger.dev | Async workflow automation, retries, and state — the brain |
| **Research & Strategy** | Manus AI | 14-point audits, competitive research, strategy |
| **AI Generation** | Claude API (Anthropic) | Intent classification, email generation, refinement |
| **Brand Components** | Kombai (build-time) | Master email component library |
| **Generative UI** | Thesys | Interactive dashboard for audit reports |
| **Email Execution** | Klaviyo API | Segment creation, template push, campaign management |
| **Store Data** | Shopify API | Products, customers, orders |
| **Payments** | Stripe | Subscription billing |
| **Email Editor** | react-email-wysiwyg-editor (fork) | Structured editor with live preview |

---

## Database Schema (V4)

The V3 schema is already applied to Supabase (project `uytlmncaubevlmnovpyo`). The following migration adds the V4 fields and tables.

### Migration: V4 Additions

```sql
-- Add merchant state machine
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS merchant_state text NOT NULL DEFAULT 'onboarding_shopify'
    CHECK (merchant_state IN (
      'onboarding_shopify', 'onboarding_klaviyo', 'onboarding_brand',
      'awaiting_audit', 'awaiting_opportunity_confirmation',
      'awaiting_flow_confirmation', 'ready_for_execution', 'active'
    )),
  ADD COLUMN IF NOT EXISTS manus_project_id text,
  ADD COLUMN IF NOT EXISTS store_name text;

-- Shopify customers table
CREATE TABLE IF NOT EXISTS public.shopify_customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  shopify_customer_id text NOT NULL,
  email text,
  first_name text,
  last_name text,
  orders_count integer DEFAULT 0,
  total_spent numeric(10,2) DEFAULT 0,
  tags text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS shopify_customers_merchant_customer_idx
  ON public.shopify_customers(merchant_id, shopify_customer_id);
CREATE INDEX IF NOT EXISTS shopify_customers_merchant_id_idx
  ON public.shopify_customers(merchant_id);

-- Shopify orders table
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  shopify_order_id text NOT NULL,
  shopify_customer_id text,
  email text,
  total_price numeric(10,2),
  financial_status text,
  fulfillment_status text,
  line_items jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS shopify_orders_merchant_order_idx
  ON public.shopify_orders(merchant_id, shopify_order_id);
CREATE INDEX IF NOT EXISTS shopify_orders_merchant_id_idx
  ON public.shopify_orders(merchant_id);

-- Klaviyo segments created by Animus
CREATE TABLE IF NOT EXISTS public.klaviyo_segments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  audit_id uuid REFERENCES public.audits(id) ON DELETE SET NULL,
  klaviyo_segment_id text,
  name text NOT NULL,
  definition jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'created', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS klaviyo_segments_merchant_id_idx
  ON public.klaviyo_segments(merchant_id);

-- Usage tracking for billing and rate limiting
CREATE TABLE IF NOT EXISTS public.usage_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'chat_message', 'audit_started', 'email_generated',
    'segment_created', 'klaviyo_push', 'shopify_sync'
  )),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_events_merchant_id_idx
  ON public.usage_events(merchant_id);
CREATE INDEX IF NOT EXISTS usage_events_merchant_month_idx
  ON public.usage_events(merchant_id, created_at);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS messages_created_at_idx
  ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS audits_manus_task_id_idx
  ON public.audits(manus_task_id);

-- Update audits table for two-part workflow
ALTER TABLE public.audits
  ADD COLUMN IF NOT EXISTS audit_type text DEFAULT 'full'
    CHECK (audit_type IN ('full', 'opportunity_analysis', 'flow_recommendation')),
  ADD COLUMN IF NOT EXISTS parent_audit_id uuid REFERENCES public.audits(id),
  ADD COLUMN IF NOT EXISTS confirmed_opportunities jsonb,
  ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL;

-- RLS for new tables
ALTER TABLE public.shopify_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klaviyo_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can read own customers"
  ON public.shopify_customers FOR SELECT
  USING (merchant_id = public.get_merchant_id());

CREATE POLICY "Merchants can read own orders"
  ON public.shopify_orders FOR SELECT
  USING (merchant_id = public.get_merchant_id());

CREATE POLICY "Merchants can read own segments"
  ON public.klaviyo_segments FOR SELECT
  USING (merchant_id = public.get_merchant_id());

CREATE POLICY "Merchants can read own usage"
  ON public.usage_events FOR SELECT
  USING (merchant_id = public.get_merchant_id());

-- Triggers for new tables
CREATE TRIGGER shopify_customers_updated_at BEFORE UPDATE ON public.shopify_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER shopify_orders_updated_at BEFORE UPDATE ON public.shopify_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime on audits (for two-part workflow status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.audits;
```

---

## Phase 1: Core Infrastructure & Scaffolding

**Objective:** Live URL on Vercel with marketing page, auth, and Supabase connected.

**Testable Outcome:** Landing page loads, signup/login works, authenticated routes are protected.

### Action 1.1: Apply V4 Database Migration

Run the migration SQL above against project `uytlmncaubevlmnovpyo`. This adds the new tables and fields on top of the existing V3 schema.

### Action 1.2: Generate Frontend Shell with Lovable

Go to lovable.dev and create a new project "Animus V4". Use this prompt:

```text
Build a Next.js 14 app named "Animus" using the App Router, TypeScript, and Tailwind CSS.

Authentication & Database:
Integrate Supabase for database and authentication using environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Use @supabase/ssr for server-side auth. Create a middleware.ts that:
- Allows public access to: /, /login, /signup, /forgot-password, /auth/callback, /api/billing/webhook, /api/shopify/webhook, /api/inngest
- Redirects unauthenticated users to /login
- Checks the merchant's merchant_state: if it starts with "onboarding_", redirect to /onboarding
- Otherwise, allow access to protected routes

Pages & Routes:

1. / (Landing Page): Dark-themed (#0A0A0A background). Headline: "Your AI Marketing Operator." in white. Subheadline: "Animus audits your Klaviyo, identifies revenue opportunities, creates segments, and generates on-brand emails — automatically." in gray. CTA button: "Get Early Access" linking to /signup.

2. /login: Email + password fields. "Forgot password?" link to /forgot-password. Login button. Link to /signup. On success, redirect based on merchant_state.

3. /signup: Email, password, confirm password. On success: "Check your email to confirm your account."

4. /forgot-password: Email input. Calls supabase.auth.resetPasswordForEmail(). Shows confirmation message.

5. /onboarding (Protected): Multi-step form that reads merchant_state to determine current step:
   - Step 1 (onboarding_shopify): "Connect your Shopify store" — text input for store URL, "Connect" button
   - Step 2 (onboarding_klaviyo): "Connect your Klaviyo account" — text input for API key, "Connect" button
   - Step 3 (onboarding_brand): Brand configuration form with fields for: primary color (color picker), secondary color (color picker), heading font (text input), body font (text input), logo URL (text input). "Save & Continue" button.
   - Step 4: "Setting up your workspace..." — loading state, then redirect to /chat

6. /chat (Protected): Two-column layout.
   Left sidebar (280px, dark): conversation list, "New Chat" button at top, merchant email + logout at bottom.
   Right panel: message history at top (scrollable), input box with send button at bottom.
   Messages support multiple render types: plain text, email preview cards, audit report cards.
   Show a typing indicator (animated dots) when waiting for a response.

7. /editor (Protected): Full-screen three-panel email editor (built in Phase 8, placeholder for now).

8. /settings (Protected): Sections for Profile, Integrations (Shopify status, Klaviyo key masked), Billing (current plan, manage subscription link).

Shared Layout:
Protected routes share a layout with the left sidebar. Active route is highlighted.

API Routes (placeholders):
- POST /api/chat — accepts { message, conversationId } returns { role, content, type }
- POST /api/onboarding/shopify-connect — initiates Shopify OAuth
- POST /api/onboarding/klaviyo-connect — saves Klaviyo key
- POST /api/onboarding/brand-config — saves brand config
- POST /api/conversations — creates new conversation
- GET /api/conversations — lists conversations for current user
- GET /api/conversations/[id]/messages — lists messages for a conversation

Push to GitHub repo named "animus-v4".
```

### Action 1.3: Clone and Deploy to Vercel

```bash
cd ~/animus-v4
git clone https://github.com/YOUR_USERNAME/animus-v4.git .
npm install
```

Create `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://uytlmncaubevlmnovpyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Deploy to Vercel with these env vars. Verify: landing page loads, /chat redirects to /login.

### Action 1.4: Create Shared Utilities

These files are created by Claude Code in the codebase:

**`lib/supabase-client.ts`** — Client-side Supabase (anon key, respects RLS)
**`lib/supabase-admin.ts`** — Server-side Supabase (service role key, bypasses RLS, API routes only)
**`lib/env.ts`** — Zod validation of all environment variables at startup
**`lib/errors.ts`** — Typed error classes and standardized API response helpers
**`lib/crypto.ts`** — AES-256-GCM encryption/decryption for API keys stored in DB

---

## Phase 2: Authentication & User Flow

**Objective:** Complete auth with email confirmation, password reset, and smart routing based on merchant state.

**Testable Outcome:** Sign up → confirm email → redirected to /onboarding (Step 1). Returning user goes to /chat.

### Action 2.1: Configure Supabase Auth

1. Supabase → Authentication → Providers → Enable Email
2. Authentication → URL Configuration:
   - Site URL: your Vercel URL
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

### Action 2.2: Build Auth Callback

Claude Code prompt:

```text
Create /app/auth/callback/route.ts that:
1. Exchanges the code for a Supabase session
2. Queries the merchants table for the authenticated user
3. Reads merchant_state
4. If merchant_state starts with "onboarding_", redirect to /onboarding
5. Otherwise redirect to /chat

Update middleware.ts to allow /auth/callback through.
```

### Action 2.3: Build Password Reset

Claude Code prompt:

```text
Create /app/forgot-password/page.tsx and /app/reset-password/page.tsx.
- Forgot password: email input, calls supabase.auth.resetPasswordForEmail()
- Reset password: new password + confirm, calls supabase.auth.updateUser()
Add a link from the login page to /forgot-password.
```

---

## Phase 3: Shopify Integration

**Objective:** Merchants connect Shopify via OAuth. Products, customers, and orders sync to Supabase.

**Testable Outcome:** Merchant connects store → products, customers, and orders appear in Supabase.

### Action 3.1: Create Shopify App

1. Shopify Partner Dashboard → Apps → Create app manually
2. App name: "Animus"
3. App URL: your Vercel URL
4. Redirect URL: `https://your-app.vercel.app/api/shopify/callback`
5. Copy Client ID and Client Secret

### Action 3.2: Add Environment Variables

```text
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_SCOPES=read_products,read_customers,read_orders
```

### Action 3.3: Build Shopify OAuth + Sync

Claude Code prompt:

```text
Build the Shopify integration with these API routes:

1. /api/shopify/connect — Initiates OAuth. Accepts { shop } parameter. Generates a random state parameter, stores it in an HTTP-only cookie. Constructs the Shopify OAuth URL with client_id, scopes (read_products,read_customers,read_orders), redirect_uri, and state. Returns the redirect URL.

2. /api/shopify/callback — Handles OAuth callback. Validates the state parameter against the cookie. Verifies the HMAC signature using SHOPIFY_CLIENT_SECRET. Exchanges the code for a permanent access token. Encrypts the access token using lib/crypto.ts. Saves encrypted token + store URL to merchants table. Updates merchant_state to 'onboarding_klaviyo'. Triggers the async product/customer/order sync by dispatching the 'shopify/sync.requested' Inngest event. Redirects to /onboarding.

3. /api/shopify/webhooks — Handles Shopify product webhooks (products/create, products/update, products/delete). Verifies HMAC. Updates shopify_products table accordingly.

Use zod to validate all inputs. Use the admin Supabase client for DB writes.
```

### Action 3.4: Build the Inngest Shopify Sync Job

**Inngest Workflow: `shopify/sync.requested`**

This job handles the full data sync asynchronously using `lib/skills/shopify-analytics.ts` to avoid Vercel timeouts:

```typescript
// app/api/inngest/functions/shopify-sync.ts
import { inngest } from "@/lib/inngest/client";
import { syncShopifyData } from "@/lib/skills/shopify-analytics";

export const syncShopifyFunction = inngest.createFunction(
  { id: "sync-shopify-data" },
  { event: "shopify/sync.requested" },
  async ({ event, step }) => {
    // Step 1: Fetch and sync data in batches
    const stats = await step.run("sync-store-data", () => 
      syncShopifyData(event.data.merchantId, event.data.shopifyStoreUrl)
    );
    
    // Step 2: Log usage event
    await step.run("log-usage", () => 
      logUsageEvent(event.data.merchantId, 'shopify_sync')
    );
    
    return { success: true, ...stats };
  }
);
```

---

## Phase 4: Klaviyo Connection & Brand Configuration

**Objective:** Merchant connects Klaviyo, configures brand identity, and completes onboarding.

**Testable Outcome:** Klaviyo key saved (encrypted), brand config stored, merchant_state set to 'awaiting_audit'.

### Action 4.1: Build Klaviyo Connection Route

Claude Code prompt:

```text
Create /api/onboarding/klaviyo-connect that:
1. Validates the Klaviyo API key by calling GET https://a.klaviyo.com/api/accounts/ with header "Authorization: Klaviyo-API-Key {key}" and "revision: 2024-10-15"
2. If valid, encrypt the key using lib/crypto.ts and save to merchants.klaviyo_api_key
3. Update merchant_state to 'onboarding_brand'
4. Return success with the account name from Klaviyo

Use zod to validate the API key format. Return clear error if the key is invalid.
```

### Action 4.2: Build Brand Configuration Route

Claude Code prompt:

```text
Create /api/onboarding/brand-config that:
1. Accepts { primaryColor, secondaryColor, fontHeading, fontBody, logoUrl }
2. Validates with zod (colors must be valid hex, fonts are non-empty strings, logoUrl is a valid URL)
3. Upserts into brand_configs table for the merchant
4. Update merchant_state to 'awaiting_audit'
5. Create a Manus project for this merchant by dispatching 'manus/project.create' event
6. Return success
```

### Action 4.3: Build Brand Extraction (Claude Vision — Optional Enhancement)

For merchants who don't want to fill in the form manually, offer a "Auto-detect from my store" button:

Claude Code prompt:

```text
Create /api/onboarding/extract-brand that:
1. Accepts { storeUrl }
2. Takes a screenshot of the store using a headless browser service or the Shopify store's meta tags
3. Calls the Claude API with the screenshot:
   - Model: claude-sonnet-4-6
   - System: "Extract the design system from this e-commerce website. Return JSON with: primary_color (hex), secondary_color (hex), font_heading (font family name), font_body (font family name), logo_url (if visible). Be precise with hex colors."
4. Returns the extracted brand config for the form to pre-fill

This is an enhancement — the manual form is the primary path.
```

---

## Phase 5: Manus Integration — The Two-Part Audit

**Objective:** Manus runs a 14-point Klaviyo + Shopify audit in two phases: first identifying revenue opportunities, then recommending specific flows after merchant confirmation.

**Testable Outcome:** Merchant types "audit my account" → receives interactive audit report in Thesys → confirms opportunities → receives flow recommendations.

### Action 5.1: Manus Project Creation

When a merchant completes onboarding (Action 4.2), create a dedicated Manus project:

**Inngest Workflow: `manus/project.create`**

```text
Trigger: Inngest Event (`manus/project.create`)
Input: { merchantId, storeName, brandConfig }

Step 1: Execute `lib/skills/manus-research.ts` to POST to Manus API to create a new project
Step 2: Save manus_project_id to merchants table in Supabase
Step 3: Respond with { success: true, projectId }
### The Animus Base Skill (Manus System Prompt)

This is injected into every Manus project:

```text
You are Animus, an elite AI email marketing strategist for Shopify merchants. You have access to the merchant's Shopify data (products, customers, orders) and Klaviyo data (profiles, segments, flows, campaigns, metrics).

Your core capabilities:
1. Customer segmentation analysis
2. Revenue opportunity identification
3. Flow/campaign performance benchmarking against 2026 Klaviyo industry standards
4. Competitive email marketing research
5. Strategic campaign recommendations

When conducting an audit, follow these execution steps:

PHASE 1 — Revenue Opportunity Analysis:
1. Analyze the provided shopify_data and klaviyo_data
2. Identify key customer segments (VIPs, one-time buyers, lapsed, at-risk, new subscribers, repeat purchasers)
3. Analyze performance of existing Klaviyo flows and campaigns (open rates, click rates, conversion rates, revenue per recipient)
4. Benchmark metrics against 2026 Klaviyo industry standards
5. Use your browser to research the merchant's industry and identify 2-3 direct competitors
6. Analyze competitor email strategies (welcome series, promotional cadence, design style)
7. Identify the top 3-5 highest-impact revenue opportunities
8. For each opportunity, quantify the potential monthly revenue gain

PHASE 2 — Flow/Campaign Recommendations (only after merchant confirms opportunities):
1. For each confirmed opportunity, recommend specific email flows or campaigns
2. Define the customer segments that need to be created in Klaviyo
3. For each segment, provide the exact Klaviyo segment definition (conditions)
4. For each flow/campaign, outline: purpose, timing, number of emails, content angle for each email
5. Estimate the expected performance metrics

Output format: Structured JSON (not Google Docs) so the dashboard can render it interactively.
```

### Action 5.2: Build the Audit Skill (Phase 1 — Revenue Opportunities)

**Inngest Workflow: `audit/phase1.requested`**

```text
Trigger: Inngest Event (`audit/phase1.requested`)
Input: { merchantId, conversationId }

Step 1: Fetch merchant record and decrypt API keys
Step 2: Run `lib/skills/klaviyo-metrics.ts` to aggregate segment data, existing flows, metrics
Step 3: Run `lib/skills/shopify-analytics.ts` to pull store summary
Step 4: Create audit record in Supabase ('opportunity_analysis', 'running')
Step 5: Run `lib/skills/audit-generator.ts` to dispatch task to Manus/Claude
Step 6: Update merchant_state to 'awaiting_opportunity_confirmation'
Step 7: Insert acknowledgment message into chat
### Action 5.3: Async Webhook Handler

**Next.js Route: `/api/webhooks/manus`**

```text
Trigger: POST `/api/webhooks/manus`
Input: Manus webhook payload { task_id, stop_reason, result }

Step 1: Check stop_reason. Update audit record status in DB.
Step 2: Insert the result as a message (message_type: 'audit_result')
Step 3: The frontend will instantly render it via Supabase Realtime
### Action 5.4: Build the Audit Skill (Phase 2 — Flow Recommendations)

**Inngest Workflow: `audit/phase2.requested`**

```text
Trigger: Inngest Event (`audit/phase2.requested`)
Input: { merchantId, conversationId, parentAuditId, confirmedOpportunities }

Step 1: Create new audit record ('flow_recommendation', 'running')
Step 2: Run `lib/skills/flow-architect.ts` to formulate precise segment/flow instructions
Step 3: Save task ID, update state to 'awaiting_flow_confirmation'
The Manus Completion Handler (Action 5.3) handles the result for both Phase 1 and Phase 2 — it just checks the `audit_type` to know which it is.

---

## Phase 6: Automated Segment Creation

**Objective:** After merchant confirms flow recommendations, Animus creates the required segments in Klaviyo automatically.

**Testable Outcome:** Segments defined by Manus appear in the merchant's Klaviyo account.

### Action 6.1: Build the Segment Creation Skill

**Inngest Workflow: `segments/create.requested`**

```text
Trigger: Inngest Event (`segments/create.requested`)
Input: { merchantId, auditId, segments: [{ name, definition }] }

Step 1: Run `lib/skills/segment-creator.ts` to sequentially loop through segments
Step 2: POST to Klaviyo API to construct segments
Step 3: Save to klaviyo_segments table
Step 4: Update merchant_state to 'ready_for_execution'
Step 5: Insert confirmation message
---

## Phase 7: The Intent Classifier & Chat Engine

**Objective:** Every chat message goes through Claude for intent classification, then routes to the correct skill.

**Testable Outcome:** Natural language messages correctly trigger the right skill — "audit my account" triggers the audit, "create a welcome email" triggers email generation, conversational questions get conversational answers.

### Action 7.1: Build the Main Chat Engine

**Next.js API Route: `/api/chat` (Serverless or Edge)**

The /api/chat route handles synchronous chat intent classification and acts as the dispatcher for async backgrounds tasks.

```text
Trigger: POST `/api/chat`
Input: { merchantId, conversationId, message, merchantState }

Step 1: Classify Intent using Claude (inline API call)
Step 2: Switch on intent:
  → "audit" → inngest.send({ name: 'audit/phase1.requested' })
  → "confirm_opportunities" → inngest.send({ name: 'audit/phase2.requested' })
  → "confirm_flows" → inngest.send({ name: 'segments/create.requested' })
  → "generate_email" → inngest.send({ name: 'email/generate.requested' })
  → "refine_email" → inngest.send({ name: 'email/refine.requested' })
  → "conversation" → Send general chat response synchronously
Step 3: Return immediate fast response acknowledging the action if async job fired, or the full conversational response if 'conversation' intent.
### Action 7.2: Build the Frontend Chat API Route

Claude Code prompt:

```text
Update /api/chat to:

1. Get authenticated user from Supabase session
2. Get merchant record (merchant_id, merchant_state)
3. Get conversation history (last 20 messages from the conversation)
4. Let the `/api/chat` intent classifier handle the LLM routing directly.
5. Return the stream or the structured acknowledgment to the user.
6. The frontend should handle different response types:
   - type: "text" → render as chat bubble
   - type: "audit_result" → render as Thesys audit report component
   - type: "email_components" → render as email preview card with "Open in Editor" button

Also build the conversation CRUD routes:
- POST /api/conversations → create new conversation, return { id, title }
- GET /api/conversations → list conversations for current merchant, ordered by updated_at desc
- GET /api/conversations/[id]/messages → get messages for a conversation, ordered by created_at asc
- PATCH /api/conversations/[id] → update title
- DELETE /api/conversations/[id] → soft delete (set deleted_at)

Use the admin Supabase client for all DB operations. Validate inputs with zod.
```

### Action 7.3: Auto-Generate Conversation Titles

Claude Code prompt:

```text
After the first assistant response in a new conversation, make a background call to Claude:

POST https://api.anthropic.com/v1/messages
model: claude-haiku-4-5-20251001
system: "Generate a 4-6 word title summarizing this conversation. Return ONLY the title, nothing else."
messages: [{ role: "user", content: "{first_user_message}" }, { role: "assistant", content: "{first_assistant_response}" }]

Update the conversation title in Supabase. Use a non-blocking approach (fire and forget from the API route).
```

---

## Phase 8: Email Generation & Structured Editor

**Objective:** Claude generates structured JSON email components using the merchant's brand config. Merchant edits in a visual editor with live preview. Chat-based refinement for bigger changes.

**Testable Outcome:** "Create a welcome email" → email preview card → open editor → edit properties → push to Klaviyo.

### Action 8.1: Build the Email Generation Skill

**Inngest Workflow: `email/generate.requested`**

```text
Trigger: Inngest Event (`email/generate.requested`)
Input: { merchantId, conversationId, message }

Step 1: Run `lib/skills/email-generator.ts` with brand config and strategy
Step 2: Optionally run `lib/skills/image-generator.ts` (Ideogram) to populate images for blocks
Step 3: Save as draft template (components_json)
Step 4: Insert message with email preview card
### Action 8.2: Build the Structured Email Editor

Claude Code prompt:

```text
Build the structured email editor at /editor/[templateId]. Use the react-email-wysiwyg-editor architecture as reference (https://github.com/amiller68/react-email-wysiwyg-editor).

Three-panel layout:

Panel 1 — Component List (200px, left):
- Lists all components by type and short label
- Clicking selects and highlights in preview
- Drag-to-reorder using @dnd-kit/sortable
- "Add Component" dropdown to insert new blocks

Panel 2 — Live Preview (flexible, center):
- Renders email using EmailComponentRenderer
- Max-width 600px container (email standard)
- Clicking any block selects it (blue outline)
- Uses brand config for fonts and colors

Panel 3 — Properties Panel (280px, right):
- Shows editable fields for selected component:
  - HeadingBlock: text input, level dropdown, alignment buttons, color (locked to brand)
  - TextBlock: textarea, alignment, fontSize slider
  - ButtonBlock: text, URL, bgColor picker, textColor, borderRadius slider
  - ImageBlock: URL input, alt text, width/height
  - SpacerBlock: height slider (0-100px)
  - DividerBlock: color, width
  - SectionBlock: bgColor, padding sliders
- All changes update state immediately (live preview)
- Fonts are read-only (locked to brand config)

Footer bar:
- "Save Draft" → PUT /api/templates/[id] with current components_json
- "Chat Refinement" → opens a mini chat input for Claude-based edits
- "Push to Klaviyo" → POST /api/push-to-klaviyo

Chat Refinement:
- Text input at bottom: "Describe what you want to change..."
- Sends the current components_json + instruction to /api/refine-email
- Claude returns updated component(s) by ID
- Frontend merges the updates into state
- Preview updates instantly

State management: useState for components array and selectedComponentId.
Load initial components from the template record via /api/templates/[id].
```

### Action 8.3: Build the Email Refinement Skill

**Next.js Route or Inngest Event: `email/refine.requested`**

```text
Trigger: Inngest Event (`email/refine.requested`)
Input: { merchantId, templateId, currentComponents, instruction }

Step 1: Send current components and instruction to Claude to mutate exact blocks
Step 2: Update template in Supabase
Step 3: Trigger real-time UI refresh
### Action 8.4: Build the Klaviyo Push

Claude Code prompt:

```text
Create /api/push-to-klaviyo that:

1. Accepts { templateId }
2. Loads the template from Supabase (components_json)
3. Loads the merchant's brand_config
4. Call `lib/skills/email-compiler.ts` to convert components_json to production MJML, and compile the MJML to pixel-perfect HTML using the native `mjml` package.
```

---

## Phase 9: Thesys Dashboard

**Objective:** Audit reports and flow recommendations render as interactive dashboard components in the chat, not walls of text or Google Docs.

**Testable Outcome:** Audit results appear as interactive cards with metrics, charts, and actionable buttons.

### Action 9.1: Set Up Thesys

1. Sign up at thesys.dev, create project "Animus"
2. Add env vars: `THESYS_API_KEY`, `THESYS_PROJECT_ID`

### Action 9.2: Define Thesys Component Types

Claude Code prompt:

```text
Create Thesys component definitions for rendering in the chat interface. Install @thesys/react.

Component: AuditReportCard
- Renders Phase 1 audit results
- Shows: overall health score, 3-5 opportunity cards with title + revenue potential + description
- Each opportunity has a checkbox for confirmation
- "Confirm Selected Opportunities" button at bottom
- Renders from message_type: 'audit_result' where audit_type: 'opportunity_analysis'

Component: FlowRecommendationCard
- Renders Phase 2 flow recommendations
- Shows: recommended flows as expandable cards
- Each flow shows: name, number of emails, timing, segment target
- Each has a checkbox
- "Approve & Create Segments" button
- Renders from message_type: 'audit_result' where audit_type: 'flow_recommendation'

Component: EmailPreviewCard
- Renders a mini preview of generated email
- Shows: thumbnail of the email, template name, "Open in Editor" button
- Renders from message_type: 'email_components'

Component: SegmentCreatedCard
- Shows: list of segments created in Klaviyo with names and sizes
- Renders after segment creation skill completes

Wire these into the chat message renderer: check message_type and metadata to determine which component to render.
```

---

## Phase 10: Stripe Billing

**Objective:** Subscription billing with checkout, webhook handling, and paywall.

**Testable Outcome:** New user pays → gets access. Subscription status tracked in Supabase.

### Action 10.1: Set Up Stripe

1. Stripe dashboard → Products → Create "Animus Pro" at $99/month
2. Copy the Price ID
3. Add env vars:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Action 10.2: Build Billing Routes

Claude Code prompt:

```text
Build the Stripe billing integration:

1. /api/billing/create-checkout — Creates Stripe Checkout session for Pro plan. Associates with authenticated user's email. Returns checkout URL. On success redirect to /onboarding.

2. /api/billing/webhook — Handles Stripe webhooks. Verify signature with STRIPE_WEBHOOK_SECRET.
   - checkout.session.completed: Create/update subscriptions record (status: 'active', stripe IDs)
   - customer.subscription.updated: Update status
   - customer.subscription.deleted: Set status 'canceled'

3. /api/billing/portal — Creates Stripe Customer Portal session. Returns portal URL. For /settings page "Manage Subscription" button.

4. Update middleware: if user is authenticated but has no active subscription, redirect to /subscribe page.

5. Create /subscribe page with plan details and "Subscribe Now" button.

Install stripe and @stripe/stripe-js.
```

---

## Phase 11: Production Hardening

**Objective:** Security, error handling, monitoring, and everything needed to ship.

### Action 11.1: Security

Claude Code prompt:

```text
Add security hardening across the app:

1. lib/crypto.ts: AES-256-GCM encryption using ENCRYPTION_KEY env var. Functions: encrypt(plaintext) → ciphertext, decrypt(ciphertext) → plaintext. Used for shopify_access_token and klaviyo_api_key.

2. Inngest Authentication: Verify INNGEST_SIGNING_KEY in your /api/inngest route to ensure jobs are securely executed.

3. Input validation: Add zod schemas to every API route. Chat message max 10,000 chars. Store URL must match *.myshopify.com. API keys validated against expected formats.

4. Rate limiting: Use @upstash/ratelimit with Vercel KV. Limits:
   - /api/chat: 30 requests/minute per user
   - /api/push-to-klaviyo: 5 requests/minute per user
   - /api/onboarding/*: 10 requests/minute per user
```

### Action 11.2: Error Handling

Claude Code prompt:

```text
Add error handling infrastructure:

1. Install sonner for toast notifications. Add <Toaster /> to root layout.

2. Create a useApi hook that wraps fetch with:
   - Automatic error toast on failure
   - Loading state management
   - Typed response parsing

3. Add try/catch to every API route with structured error responses:
   { error: string, code: string, details?: any }

4. Add error boundaries to the chat page and editor page.

5. Install @sentry/nextjs for production error tracking. Configure in next.config.js.
```

### Action 11.3: Environment Variable Validation

Already specified in Phase 1 Action 1.4 (`lib/env.ts`). Ensure all 18+ env vars are validated at startup.

---

## Phase 12: End-to-End Testing & Launch

### The Full Test Script

Use a completely new email address:

1. **Landing → Payment**: Visit marketing URL → Subscribe via Stripe test card (4242 4242 4242 4242) → Verify: redirected to /onboarding

2. **Shopify Connect**: Enter dev store URL → Verify: Shopify OAuth → redirected back → products/customers/orders in Supabase

3. **Klaviyo Connect**: Enter API key → Verify: key validated, saved (encrypted), merchant_state = onboarding_brand

4. **Brand Config**: Fill in colors + fonts + logo → Verify: brand_configs record created, Manus project created, merchant_state = awaiting_audit

5. **Audit Phase 1**: Type "audit my account" → Verify: acknowledgment message → wait → interactive audit report appears in Thesys with revenue opportunities

6. **Confirm Opportunities**: Check 3 opportunities, click confirm → Verify: Phase 2 starts → flow recommendations appear

7. **Confirm Flows**: Approve recommendations → Verify: segments created in Klaviyo → confirmation card appears

8. **Email Generation**: Type "create a welcome email for new subscribers" → Verify: email preview card with brand colors/fonts

9. **Editor**: Click "Open in Editor" → Verify: three-panel editor loads → click heading → properties panel shows → edit text → preview updates instantly

10. **Chat Refinement**: In editor chat, type "make the CTA button bigger and more prominent" → Verify: button component updates in preview

11. **Push to Klaviyo**: Click "Push to Klaviyo" → Verify: template appears in Klaviyo Email Templates

---

## Environment Variables Reference

| Variable | Source | Purpose |
| ---------- | -------- | --------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Admin key (server-only) |
| `ENCRYPTION_KEY` | Generate: `openssl rand -hex 32` | API key encryption |
| `INNGEST_EVENT_KEY` | Inngest Dashboard | To dispatch events |
| `INNGEST_SIGNING_KEY` | Inngest Dashboard | Webhook verification |
| `SHOPIFY_CLIENT_ID` | Shopify Partner Dashboard | OAuth client ID |
| `SHOPIFY_CLIENT_SECRET` | Shopify Partner Dashboard | OAuth client secret |
| `SHOPIFY_SCOPES` | — | `read_products,read_customers,read_orders` |
| `STRIPE_SECRET_KEY` | Stripe dashboard | Billing (server-side) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks | Webhook verification |
| `STRIPE_PRO_PRICE_ID` | Stripe → Products | Pro plan price ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard | Billing (client-side) |
| `THESYS_API_KEY` | Thesys dashboard | Generative UI |
| `THESYS_PROJECT_ID` | Thesys dashboard | Thesys project |
| `ANTHROPIC_API_KEY` | Anthropic console | Claude API (used in n8n) |
| `MANUS_API_KEY` | Manus AI settings | Manus API |

---

## Async Workflow (Inngest) Summary

| # | Event / Route | Purpose |
| --- | ---------- | --------- |
| 1 | `api/chat` | Synchronous intent classification and dispatch |
| 2 | `shopify/sync.requested` | Async Product/customer/order sync using `lib/skills/shopify-analytics.ts` |
| 3 | `manus/project.create` | Setup Manus workspace using `lib/skills/manus-research.ts` |
| 4 | `audit/phase1.requested` | Revenue opportunity analysis using `lib/skills/audit-generator.ts` |
| 5 | `audit/phase2.requested` | Flow recommendations using `lib/skills/flow-architect.ts` |
| 6 | `segments/create.requested` | Klaviyo segment creation using `lib/skills/segment-creator.ts` |
| 7 | `email/generate.requested` | Email generation using `lib/skills/email-generator.ts` |
| 8 | `email/refine.requested` | Email refinement utilizing Claude |

All workflows run securely natively via Inngest's SDK, avoiding strict serverless timeouts and ensuring complete error resilience.

---

## Kombai's Role (Build-Time)

Kombai is used during development (in Antigravity IDE) to build the master email component library. This library includes:

- **HeadingBlock** — responsive heading with configurable level, alignment, color
- **TextBlock** — body text with rich formatting support
- **ButtonBlock** — CTA button with hover states, border radius, padding
- **ImageBlock** — responsive images with alt text, max-width constraints
- **SpacerBlock** — vertical spacing
- **DividerBlock** — horizontal rule with configurable style
- **SectionBlock** — container with background color and padding
- **ProductCardBlock** — Shopify product with image, title, price, CTA (future)
- **HeroBlock** — full-width hero section with background image (future)

These components are:

1. Built once using Kombai's design-to-code capabilities
2. Stored in the codebase as React components (`components/email/`)
3. Rendered in the editor preview using React
4. Converted to email-safe HTML (table-based, inline CSS) for Klaviyo push
5. Skinned with each merchant's brand_config at render time

The brand_config injects: fonts, colors, logo. The component structure stays locked.
