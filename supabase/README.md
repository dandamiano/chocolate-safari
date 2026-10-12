# Supabase

## Tables

- `chocolates` — catalogue rows (slug PK), mirrors Zod / JSON fields in snake_case
- `site_settings` — singleton `id = 'default'` with full settings as `document` jsonb

## Apply migrations

**Dashboard:** SQL editor → run in order:

1. `migrations/20261012120000_init.sql`
2. `migrations/20261012154500_admin_cms.sql`

**CLI** (after `npx supabase login` + `npx supabase link --project-ref <ref>`):

```bash
npx supabase db push
```

## RLS

- Public (`anon` / `authenticated`): `SELECT` published chocolates + site settings
- Authenticated admins (`user_metadata.role` or `app_metadata.role` = `admin`): full chocolate CRUD + site_settings writes
- App `/admin` writes use the **service role** after verifying `ADMIN_EMAILS` and/or metadata role (bypasses RLS)

## Seed

From the repo root with `.env.local` filled:

```bash
npm run seed:supabase
```
