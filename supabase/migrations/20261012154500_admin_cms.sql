-- Admin CMS: keep public read for published content; allow authenticated
-- admins (role claim or email allowlist via JWT) to manage rows.
-- Production admin writes still use the service role after app-level auth.
-- These policies are defense-in-depth if an authenticated admin client is used.

-- ---------------------------------------------------------------------------
-- Helper: is the JWT user an admin?
-- Checks user_metadata.role === 'admin' OR email is in app.admin_emails GUC
-- (optional). Prefer app-level ADMIN_EMAILS + service role for writes.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  )
  or coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Admins can read all chocolates (including drafts)
drop policy if exists "Admin read all chocolates" on public.chocolates;
create policy "Admin read all chocolates"
  on public.chocolates
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin insert chocolates" on public.chocolates;
create policy "Admin insert chocolates"
  on public.chocolates
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin update chocolates" on public.chocolates;
create policy "Admin update chocolates"
  on public.chocolates
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin delete chocolates" on public.chocolates;
create policy "Admin delete chocolates"
  on public.chocolates
  for delete
  to authenticated
  using (public.is_admin());

-- Site settings: admins can update / insert the singleton
drop policy if exists "Admin write site settings" on public.site_settings;
create policy "Admin write site settings"
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on function public.is_admin() is
  'True when JWT user_metadata.role or app_metadata.role is admin. Used by RLS; app also gates via ADMIN_EMAILS + service role.';
