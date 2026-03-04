-- Animus V2: Multi-Tenant Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Merchants (core tenant table, linked to Supabase Auth)
create table public.merchants (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  store_name text not null,
  store_url text,
  klaviyo_api_key text,
  plan text not null default 'free',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Brand Configs (Kombai-generated design system per merchant)
create table public.brand_configs (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  colors jsonb not null default '{}',
  fonts jsonb not null default '{}',
  spacing jsonb not null default '{}',
  components jsonb not null default '[]',
  raw_kombai_output jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index brand_configs_merchant_id_idx on public.brand_configs(merchant_id);

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
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages(conversation_id);

-- 5. Audits (Manus AI async audit tasks)
create table public.audits (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  target_url text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  manus_task_id text,
  result jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index audits_merchant_id_idx on public.audits(merchant_id);

-- 6. Templates (generated email templates)
create table public.templates (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  name text not null,
  subject_line text,
  html_content text,
  json_structure jsonb,
  klaviyo_template_id text,
  status text not null default 'draft' check (status in ('draft', 'finalized', 'pushed')),
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
  plan text not null default 'free',
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security (RLS) - merchants can only access their own data
alter table public.merchants enable row level security;
alter table public.brand_configs enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.audits enable row level security;
alter table public.templates enable row level security;
alter table public.subscriptions enable row level security;

-- RLS Policies
create policy "Merchants can read own record"
  on public.merchants for select
  using (auth_user_id = auth.uid());

create policy "Merchants can update own record"
  on public.merchants for update
  using (auth_user_id = auth.uid());

-- Helper function to get merchant_id from auth
create or replace function public.get_merchant_id()
returns uuid as $$
  select id from public.merchants where auth_user_id = auth.uid()
$$ language sql security definer stable;

-- Brand configs policies
create policy "Merchants can read own brand config"
  on public.brand_configs for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own brand config"
  on public.brand_configs for insert
  with check (merchant_id = public.get_merchant_id());

create policy "Merchants can update own brand config"
  on public.brand_configs for update
  using (merchant_id = public.get_merchant_id());

-- Conversations policies
create policy "Merchants can read own conversations"
  on public.conversations for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own conversations"
  on public.conversations for insert
  with check (merchant_id = public.get_merchant_id());

-- Messages policies (via conversation ownership)
create policy "Merchants can read own messages"
  on public.messages for select
  using (conversation_id in (
    select id from public.conversations where merchant_id = public.get_merchant_id()
  ));

create policy "Merchants can insert own messages"
  on public.messages for insert
  with check (conversation_id in (
    select id from public.conversations where merchant_id = public.get_merchant_id()
  ));

-- Audits policies
create policy "Merchants can read own audits"
  on public.audits for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own audits"
  on public.audits for insert
  with check (merchant_id = public.get_merchant_id());

-- Templates policies
create policy "Merchants can read own templates"
  on public.templates for select
  using (merchant_id = public.get_merchant_id());

create policy "Merchants can insert own templates"
  on public.templates for insert
  with check (merchant_id = public.get_merchant_id());

create policy "Merchants can update own templates"
  on public.templates for update
  using (merchant_id = public.get_merchant_id());

-- Subscriptions policies
create policy "Merchants can read own subscription"
  on public.subscriptions for select
  using (merchant_id = public.get_merchant_id());

-- Auto-create merchant record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.merchants (auth_user_id, store_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'store_name', 'My Store'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger function
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
create trigger templates_updated_at before update on public.templates
  for each row execute function public.update_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.update_updated_at();
