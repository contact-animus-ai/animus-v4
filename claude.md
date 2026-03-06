# Animus V6: Claude Code System Guide

**To:** Claude Code (AI Engineer)
**From:** Phillip Vo
**Version:** 6.0 — Supersedes all previous guides
**Date:** March 6, 2026

---

## Your Role

You are the **backend engineer and code refiner** for Animus. You write API routes, database queries, Inngest workflows, middleware, skill files, and server-side utilities. You also refine and debug Lovable-generated frontend code.

**Division of Labor:**

| Tool | Responsibility |
|---|---|
| **Lovable** | Page scaffolding, layout, UI components |
| **Kombai** (in Antigravity) | Complex UI: email editor, drag-and-drop, audit report cards, charts |
| **You (Claude Code)** | All backend: API routes, lib/skills/, Inngest functions, Supabase, integrations |

**Do not rewrite UI that Lovable or Kombai has built.** Wire up the data layer instead.

---

## Project Overview

Animus is an **autonomous AI marketing operator** for Shopify merchants. It is NOT a chatbot — the chat interface is the communication layer for an operator that can:

1. Audit Klaviyo accounts (data analysis via Claude + deep research via Manus)
2. Identify revenue opportunities and recommend flows
3. Create Klaviyo segments programmatically
4. Generate on-brand email campaigns via Claude API
5. Compile emails via MJML and push to Klaviyo
6. Research competitors and industry benchmarks via Perplexity + Firecrawl

---

## The Stack

| Layer | Service | Notes |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) on Vercel | Lovable-scaffolded, refined by Claude Code + Kombai |
| **Database & Auth** | Supabase (`uytlmncaubevlmnovpyo`) | V3 schema applied, V4 migration pending |
| **Async Orchestration** | Inngest | Background jobs — replaces n8n entirely |
| **Research & Strategy** | Manus AI | Deep competitive research, strategic recommendations |
| **AI Generation** | Claude API (Anthropic SDK) | Intent classification (Haiku), analysis + generation (Sonnet) |
| **Real-time Research** | Perplexity API | Industry benchmarks, trend analysis |
| **Web Scraping** | Firecrawl API | Competitor email scraping, brand extraction |
| **Image Generation** | Ideogram API | Email hero images, product visuals |
| **Email Compilation** | MJML (open source) | Component JSON → production HTML |
| **Email Execution** | Klaviyo API | Segment creation, template push |
| **Store Data** | Shopify API | Products, customers, orders |
| **Payments** | Stripe | Subscription billing |

---

## Repository Structure

```text
app/src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
    (protected)/
      layout.tsx              ← shared sidebar layout
      chat/page.tsx
      editor/page.tsx
      onboarding/page.tsx
      settings/page.tsx
      subscribe/page.tsx
    api/
      chat/route.ts           ← Claude intent classification + Inngest dispatch
      inngest/route.ts         ← Inngest function handler
      billing/webhook/route.ts
      conversations/
        route.ts
        [id]/messages/route.ts
      onboarding/
        shopify-connect/route.ts
        klaviyo-connect/route.ts
        brand-config/route.ts
      shopify/
        callback/route.ts
        webhooks/route.ts
      push-to-klaviyo/route.ts
      templates/route.ts
      webhooks/manus/route.ts  ← Manus completion webhook
    auth/callback/route.ts
    page.tsx
    layout.tsx
  lib/
    supabase-client.ts
    supabase-server.ts
    supabase-admin.ts
    crypto.ts
    env.ts
    errors.ts
    klaviyo.ts
    inngest/
      client.ts               ← Inngest client
      functions/
        shopify-sync.ts
        audit-phase1.ts
        audit-phase2.ts
        create-segments.ts
        generate-email.ts
        refine-email.ts
        create-manus-project.ts
    skills/
      klaviyo-metrics.ts       ← Pull Klaviyo KPIs via API
      shopify-analytics.ts     ← Sync + compute Shopify KPIs
      manus-research.ts        ← Deep async research via Manus
      perplexity-search.ts     ← Real-time benchmarks + trends
      firecrawl-scrape.ts      ← Competitor web scraping
      audit-generator.ts       ← Claude analyzes all data → structured audit
      flow-architect.ts        ← Claude designs Klaviyo flow specs
      email-generator.ts       ← Claude generates email block JSON
      image-generator.ts       ← Ideogram generates email visuals
      email-compiler.ts        ← MJML → production HTML
      segment-creator.ts       ← Create segments in Klaviyo
      klaviyo-push.ts          ← Push templates to Klaviyo
  components/
    email/                     ← Kombai builds this
  middleware.ts
```

---

## How It Works

### Chat Flow
```
User types message → /api/chat
  → Claude Haiku classifies intent (instant)
  → Switch:
    "conversation" → Claude Sonnet responds (sync, instant)
    "audit"        → Inngest job dispatched (async, minutes)
    "generate_email" → Inngest job dispatched (async, seconds)
    "confirm_*"    → Inngest job dispatched (async, seconds)
```

### Audit Pipeline
```
Fast layer (seconds):
  Klaviyo API → metrics
  Shopify DB  → KPIs         → Claude Sonnet analyzes → structured JSON audit
  Perplexity  → benchmarks

Deep layer (minutes):
  Manus AI    → competitor research + strategic recommendations
```

### Email Pipeline
```
Claude Sonnet → email block JSON (components)
Ideogram      → hero images (optional)
MJML          → production HTML
Klaviyo API   → template push
```

---

## Merchant State Machine

```text
onboarding_shopify               → must connect Shopify
onboarding_klaviyo               → must connect Klaviyo
onboarding_brand                 → must complete brand config
awaiting_audit                   → ready for first audit
awaiting_opportunity_confirmation → reviewing opportunities
awaiting_flow_confirmation       → reviewing flow recommendations
ready_for_execution              → can create segments + emails
active                           → fully onboarded, all skills available
```

---

## Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://uytlmncaubevlmnovpyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ENCRYPTION_KEY=...

# AI Services
ANTHROPIC_API_KEY=...
MANUS_API_KEY=...
PERPLEXITY_API_KEY=...
IDEOGRAM_API_KEY=...

# Scraping
FIRECRAWL_API_KEY=...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Shopify OAuth
SHOPIFY_CLIENT_ID=...
SHOPIFY_CLIENT_SECRET=...
SHOPIFY_SCOPES=read_products,read_customers,read_orders

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRO_PRICE_ID=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

---

## Inngest Async Workflows

| Event | Function | Purpose |
|---|---|---|
| `shopify/sync.requested` | shopify-sync.ts | Paginated product/customer/order sync |
| `manus/project.create` | create-manus-project.ts | Create Manus workspace for merchant |
| `audit/phase1.requested` | audit-phase1.ts | Revenue opportunity analysis |
| `audit/phase2.requested` | audit-phase2.ts | Flow/campaign recommendations |
| `segments/create.requested` | create-segments.ts | Create segments in Klaviyo |
| `email/generate.requested` | generate-email.ts | Claude generates email components |
| `email/refine.requested` | refine-email.ts | Claude updates email components |

---

## Coding Standards

- **`lib/supabase-server.ts`** for server components and route handlers
- **`lib/supabase-admin.ts`** for admin operations (bypasses RLS)
- **`lib/supabase-client.ts`** for client components only
- **Validate all inputs with Zod**
- **Never log API keys**
- **Encrypt third-party API keys** with `lib/crypto.ts`
- **Check merchant ownership** before reading/writing data
- **TypeScript strict** — no `any` types
- **Error responses** via `lib/errors.ts` helpers

---

## Phase Checklist

### Phase 1 — Infrastructure ✅
- [x] Supabase project created
- [x] V3 schema applied
- [x] Next.js app scaffolded by Lovable
- [x] All lib/ utilities created (crypto, env, errors, supabase)
- [x] Inngest client + route handler set up
- [x] All lib/skills/ files built
- [x] All Inngest functions built
- [x] /api/chat rewired to Claude + Inngest (no n8n)
- [x] API keys configured in .env.local
- [ ] V4 database migration applied
- [ ] All env vars set in Vercel

### Phase 2 — Auth ✅ (mostly done)
- [x] Auth callback route
- [x] Middleware (auth + onboarding redirect)
- [x] Login/signup pages
- [ ] Password reset pages wired up

### Phase 3 — Shopify Integration
- [ ] Shopify app created in Partner Dashboard
- [ ] Full OAuth flow (/api/shopify/connect + /callback)
- [ ] Inngest shopify sync tested end-to-end

### Phase 4 — Klaviyo + Brand Config ✅
- [x] /api/onboarding/klaviyo-connect
- [x] /api/onboarding/brand-config
- [ ] Manus project creation tested

### Phase 5 — Audit (Two-Part)
- [ ] Audit phase 1 tested end-to-end
- [ ] Audit phase 2 tested end-to-end
- [ ] Manus webhook handler (/api/webhooks/manus)
- [ ] Supabase Realtime subscription in frontend

### Phase 6 — Segment Creation
- [ ] Segment creation tested end-to-end
- [ ] Conversation CRUD tested

### Phase 7 — Email Generation + Editor
- [ ] Email generation tested
- [ ] Email compiler (MJML) tested
- [ ] /api/push-to-klaviyo tested
- [ ] Kombai builds 3-panel email editor UI

### Phase 8 — Billing
- [ ] Stripe products + prices created
- [ ] /api/billing/webhook handles subscription lifecycle
- [ ] /subscribe page wired to Stripe Checkout

### Phase 9 — Polish
- [ ] Lovable V2 frontend with updated UI
- [ ] Kombai builds audit report cards + charts
- [ ] End-to-end test: signup → onboard → audit → generate → push
