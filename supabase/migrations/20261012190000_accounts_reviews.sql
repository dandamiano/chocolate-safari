-- Public accounts: bookmarks, tasting notes, community reviews
-- RLS: users manage their own rows; published reviews are publicly readable.

-- ---------------------------------------------------------------------------
-- bookmarks
-- ---------------------------------------------------------------------------
create table if not exists public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  chocolate_slug text not null references public.chocolates (slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, chocolate_slug)
);

create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id);
create index if not exists bookmarks_created_at_idx on public.bookmarks (created_at desc);

alter table public.bookmarks enable row level security;

drop policy if exists "Users read own bookmarks" on public.bookmarks;
create policy "Users read own bookmarks"
  on public.bookmarks
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own bookmarks" on public.bookmarks;
create policy "Users insert own bookmarks"
  on public.bookmarks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own bookmarks" on public.bookmarks;
create policy "Users delete own bookmarks"
  on public.bookmarks
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- tasting_notes (optional per-bookmark notes)
-- ---------------------------------------------------------------------------
create table if not exists public.tasting_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chocolate_slug text not null references public.chocolates (slug) on delete cascade,
  note text not null default '',
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chocolate_slug)
);

create index if not exists tasting_notes_user_id_idx on public.tasting_notes (user_id);

drop trigger if exists tasting_notes_set_updated_at on public.tasting_notes;
create trigger tasting_notes_set_updated_at
  before update on public.tasting_notes
  for each row execute function public.set_updated_at();

alter table public.tasting_notes enable row level security;

drop policy if exists "Users read own tasting notes" on public.tasting_notes;
create policy "Users read own tasting notes"
  on public.tasting_notes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own tasting notes" on public.tasting_notes;
create policy "Users insert own tasting notes"
  on public.tasting_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own tasting notes" on public.tasting_notes;
create policy "Users update own tasting notes"
  on public.tasting_notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own tasting notes" on public.tasting_notes;
create policy "Users delete own tasting notes"
  on public.tasting_notes
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reviews (community)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chocolate_slug text not null references public.chocolates (slug) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'published'
    check (status in ('published', 'hidden')),
  unique (user_id, chocolate_slug)
);

create index if not exists reviews_slug_status_idx
  on public.reviews (chocolate_slug, status, created_at desc);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);
create index if not exists reviews_user_id_idx on public.reviews (user_id);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "Public read published reviews" on public.reviews;
create policy "Public read published reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Users read own reviews" on public.reviews;
create policy "Users read own reviews"
  on public.reviews
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own reviews" on public.reviews;
create policy "Users insert own reviews"
  on public.reviews
  for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'published');

drop policy if exists "Users update own reviews" on public.reviews;
create policy "Users update own reviews"
  on public.reviews
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own reviews" on public.reviews;
create policy "Users delete own reviews"
  on public.reviews
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on table public.bookmarks is 'Per-user saved chocolates for the tasting log.';
comment on table public.tasting_notes is 'Optional private notes/ratings on bookmarked chocolates.';
comment on table public.reviews is 'Public community reviews; chocolates.rating stays editorial.';
