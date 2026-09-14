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
