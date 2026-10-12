-- Public Storage bucket for chocolate product images.
-- Uploads go through the Next.js admin server action with the service role
-- after requireAdmin(); these policies cover public read + optional admin
-- defense-in-depth (service role bypasses RLS either way).
--
-- IMPORTANT (SQL Editor): do NOT insert into storage.buckets here.
-- Hosted Supabase rejects that with "must be owner of table buckets".
-- Create the bucket in the Dashboard first, then run only the policies below.
--
-- Dashboard → Storage → New bucket:
--   Name: chocolates
--   Public: yes
--   File size limit: 5 MB (5242880 bytes)
--   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, image/avif
--
-- Reference only (CLI / service-role migrations may use this; do not paste into SQL Editor):
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values (
--   'chocolates',
--   'chocolates',
--   true,
--   5242880, -- 5 MiB
--   array[
--     'image/jpeg',
--     'image/png',
--     'image/webp',
--     'image/gif',
--     'image/avif'
--   ]::text[]
-- )
-- on conflict (id) do update set
--   public = excluded.public,
--   file_size_limit = excluded.file_size_limit,
--   allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can read objects in the public chocolates bucket
drop policy if exists "Public read chocolate images" on storage.objects;
create policy "Public read chocolate images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'chocolates');

-- Authenticated admins may write (defense-in-depth; app uses service role)
drop policy if exists "Admin insert chocolate images" on storage.objects;
create policy "Admin insert chocolate images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'chocolates' and public.is_admin());

drop policy if exists "Admin update chocolate images" on storage.objects;
create policy "Admin update chocolate images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'chocolates' and public.is_admin())
  with check (bucket_id = 'chocolates' and public.is_admin());

drop policy if exists "Admin delete chocolate images" on storage.objects;
create policy "Admin delete chocolate images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'chocolates' and public.is_admin());
