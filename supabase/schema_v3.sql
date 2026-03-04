-- Animus V3: Multi-Tenant Database Schema
-- Production-grade schema with RLS, triggers, and Shopify integration

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Merchants (core tenant table, linked to Supabase Auth)
create table public.merchants (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  email text,
  shopify_store_url text,
  shopify_access_token text,
  klaviyo_api_key text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Brand Configs (Kombai-generated design system per merchant)
create table public.brand_configs (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid unique not null references public.merchants(id) on delete cascade,
  primary_color text,
  secondary_color text,
  font_heading text,
  font_body text,
  logo_url text,
  components jsonb not null default '[]',
  raw_kombai_output jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Conversations (chat sessions per merchant)
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_merchant_id_idx on public.conversations(merchant_id);

-- 4. Messages (individual messages within conversations)
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  message_type text not null default 'text' check (message_type in ('text', 'email_components', 'audit_result', 'final_email_preview')),
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages(conversation_id);
create index messages_merchant_id_idx on public.messages(merchant_id);

-- 5. Audits (Manus AI async audit tasks)
create table public.audits (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  manus_task_id text,
  status text not null default 'pending' check (status in ('pending', 'running', 'complete', 'failed')),
  result_url text,
  result_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index audits_merchant_id_idx on public.audits(merchant_id);

-- 6. Templates (generated email templates)
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  name text not null,
  components_json jsonb,
  html_output text,
  klaviyo_template_id text,
  klaviyo_push_status text not null default 'draft' check (klaviyo_push_status in ('draft', 'pushed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index templates_merchant_id_idx on public.templates(merchant_id);

-- 7. Subscriptions (Stripe billing state)
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid unique not null references public.merchants(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled')),
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'enterprise')),
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Shopify Products (synced product catalogue)
create table public.shopify_products (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  shopify_product_id text not null,
  title text not null,
  handle text,
  product_type text,
  tags text,
  variants jsonb default '[]',
  images jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index shopify_products_merchant_product_idx on public.shopify_products(merchant_id, shopify_product_id);
create index shopify_products_merchant_id_idx on public.shopify_products(merchant_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.merchants enable row level security;
alter table public.brand_configs enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.audits enable row level security;
alter table public.templates enable row level security;
alter table public.subscriptions enable row level security;
alter table public.shopify_products enable row level security;

-- Helper function: resolve auth user to merchant_id
create or replace function public.get_merchant_id()
returns uuid as $$
  select id from public.merchants where auth_user_id = auth.uid()
$$ language sql security definer stable;

-- Merchants: users can only read/update their own record
create policy "Merchants can read own record"
  on public.merchants for select
  using (auth_user_id = auth.uid());

create policy "Merchants can update own record"
  on public.merchants for update
  using (auth_user_id = auth.uid());

-- Brand configs
create policy "Merchants can read own brand config"
  on public.brand_configs for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own brand config"
  on public.brand_configs for insert
  with check (merchant_id = public.get_merchant_id());

create policy "Merchants can update own brand config"
  on public.brand_configs for update
  using (merchant_id = public.get_merchant_id());

-- Conversations
create policy "Merchants can read own conversations"
  on public.conversations for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own conversations"
  on public.conversations for insert
  with check (merchant_id = public.get_merchant_id());

create policy "Merchants can update own conversations"
  on public.conversations for update
  using (merchant_id = public.get_merchant_id());

-- Messages (direct merchant_id check — faster than V2 subquery approach)
create policy "Merchants can read own messages"
  on public.messages for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own messages"
  on public.messages for insert
  with check (merchant_id = public.get_merchant_id());

-- Audits
create policy "Merchants can read own audits"
  on public.audits for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own audits"
  on public.audits for insert
  with check (merchant_id = public.get_merchant_id());

-- Templates
create policy "Merchants can read own templates"
  on public.templates for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own templates"
  on public.templates for insert
  with check (merchant_id = public.get_merchant_id());

create policy "Merchants can update own templates"
  on public.templates for update
  using (merchant_id = public.get_merchant_id());

-- Subscriptions
create policy "Merchants can read own subscription"
  on public.subscriptions for select
  using (merchant_id = public.get_merchant_id());

-- Shopify Products
create policy "Merchants can read own products"
  on public.shopify_products for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own products"
  on public.shopify_products for insert
  with check (merchant_id = public.get_merchant_id());

create policy "Merchants can update own products"
  on public.shopify_products for update
  using (merchant_id = public.get_merchant_id());

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-create merchant record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.merchants (auth_user_id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger merchants_updated_at before update on public.merchants
  for each row execute function public.update_updated_at();
create trigger brand_configs_updated_at before update on public.brand_configs
  for each row execute function public.update_updated_at();
create trigger conversations_updated_at before update on public.conversations
  for each row execute function public.update_updated_at();
create trigger audits_updated_at before update on public.audits
  for each row execute function public.update_updated_at();
create trigger templates_updated_at before update on public.templates
  for each row execute function public.update_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.update_updated_at();
create trigger shopify_products_updated_at before update on public.shopify_products
  for each row execute function public.update_updated_at();

-- ============================================================
-- Enable Realtime on messages (needed for Phase 7 — Manus audit push)
-- ============================================================
alter publication supabase_realtime add table public.messages;
