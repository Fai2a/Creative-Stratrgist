-- Creative Strategist - Phase 1 schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  mode text not null check (mode in ('brand', 'general')),

  -- Product intake
  product_name text not null,
  raw_description text,
  chosen_description text not null,
  usp text not null,
  industry text not null,
  product_image_url text,
  website_url text,
  price numeric,

  -- Audience (deliberately excludes sexual orientation, health, religion,
  -- race, and political belief - banned targeting categories on Meta,
  -- Google, and TikTok)
  age_min integer not null,
  age_max integer not null,
  gender text not null check (gender in ('all', 'male', 'female')),
  location text not null,

  -- Budget (from /api/budget)
  goal text not null,
  campaign_length_days integer not null,
  user_budget_cap numeric,
  budget_range_total jsonb not null,
  daily_spend_range jsonb not null,
  platform_split jsonb not null,
  mode_recommendation text not null check (mode_recommendation in ('suggest_only', 'auto_manage_eligible')),
  budget_reasoning text not null,
  budget_warning text,

  status text not null default 'active' check (status in ('draft', 'active')),
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Users can view their own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert their own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- Storage bucket for uploaded product images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Users may only manage files under a folder named after their own user id
-- (e.g. product-images/<user_id>/photo.png).
create policy "Users can upload their own product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- ---------------------------------------------------------------------------
-- Phase 2: ad copy generation (/api/content)
-- If your project already ran the block above, you only need to run this
-- section - it's safe to paste into the SQL editor on its own.
-- ---------------------------------------------------------------------------

create table if not exists public.ad_content (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null unique references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  meta jsonb not null,
  google jsonb not null,
  tiktok jsonb not null,

  created_at timestamptz not null default now()
);

alter table public.ad_content enable row level security;

create policy "Users can view their own ad content"
  on public.ad_content for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ad content"
  on public.ad_content for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ad content"
  on public.ad_content for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own ad content"
  on public.ad_content for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Phase 2: competitor analysis (/api/competitor-analysis)
-- If your project already ran the blocks above, you only need to run this
-- section - it's safe to paste into the SQL editor on its own.
-- ---------------------------------------------------------------------------

create table if not exists public.competitor_analyses (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null unique references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- The competitor list the user entered, so the form can be restored.
  competitors jsonb not null,

  competitor_insights jsonb not null,
  overall_differentiation_strategy text not null,
  suggested_messaging_angle text not null,
  caveat text,

  created_at timestamptz not null default now()
);

alter table public.competitor_analyses enable row level security;

create policy "Users can view their own competitor analyses"
  on public.competitor_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own competitor analyses"
  on public.competitor_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own competitor analyses"
  on public.competitor_analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own competitor analyses"
  on public.competitor_analyses for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Monetization: Stripe subscriptions
-- If your project already ran the blocks above, you only need to run this
-- section - it's safe to paste into the SQL editor on its own.
-- ---------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'free' check (status in ('free', 'active', 'canceled', 'past_due')),
  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Users may only read their own subscription row. There are deliberately
-- no insert/update/delete policies for the authenticated role - only the
-- Stripe webhook (using the service role key, which bypasses RLS) writes
-- to this table, so a user can never grant themselves Pro access directly.
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
