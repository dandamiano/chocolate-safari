-- Chocolate Safari: chocolates catalogue + site settings singleton
-- Run via Supabase SQL editor or: supabase db push / migration up

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- chocolates
-- ---------------------------------------------------------------------------
create table if not exists public.chocolates (
  slug text primary key,
  title text not null,
  brand text not null,
  short_description text not null,
  description text not null,
  image text not null,
  gallery text[] not null default '{}',
  origin_country text not null default '',
  origin_code text not null default '',
  origin_flag_emoji text not null default '',
  tags text[] not null default '{}',
  rating numeric(3, 2) not null check (rating >= 0 and rating <= 5),
  price numeric(10, 2) not null,
  currency text not null default 'USD',
  featured boolean not null default false,
  recent_rank integer,
  published_at timestamptz not null,
  status text not null default 'published'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chocolates_status_idx on public.chocolates (status);
create index if not exists chocolates_recent_rank_idx on public.chocolates (recent_rank);
create index if not exists chocolates_origin_code_idx on public.chocolates (origin_code);

-- ---------------------------------------------------------------------------
-- site_settings (singleton document)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id text primary key default 'default',
  document jsonb not null,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 'default')
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chocolates_set_updated_at on public.chocolates;
create trigger chocolates_set_updated_at
  before update on public.chocolates
  for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: public read for published content; writes via service role only
-- ---------------------------------------------------------------------------
alter table public.chocolates enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public read published chocolates" on public.chocolates;
create policy "Public read published chocolates"
  on public.chocolates
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anon/authenticated.
-- Seed and admin writes use the service role key (bypasses RLS).
