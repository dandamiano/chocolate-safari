# Supabase

## Tables

- `chocolates` — catalogue rows (slug PK), mirrors Zod / JSON fields in snake_case
- `site_settings` — singleton `id = 'default'` with full settings as `document` jsonb

## Apply migration

**Dashboard:** SQL editor → run `migrations/20261012120000_init.sql`.

**CLI** (after `npx supabase login` + `npx supabase link --project-ref <ref>`):

```bash
npx supabase db push
```

## Seed

From the repo root with `.env.local` filled:

```bash
npm run seed:supabase
```
