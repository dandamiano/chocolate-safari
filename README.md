# Chocolate Safari

A Next.js tasting catalogue for discovering chocolates — dark cocoa UI, brass accents, AI Sommelier stub, and content from **Supabase (Postgres)** when configured, otherwise JSON/`content/` via **Keystatic**.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- shadcn/ui primitives
- **Supabase** Postgres for production content (optional locally)
- **Production admin CMS** at `/admin` (Supabase Auth + service-role writes)
- **Keystatic** at `/keystatic` for local file editing in `/content`
- Zod-validated content shapes in `src/lib/schemas.ts`

## Develop

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

With no Supabase env vars set, the app reads `content/` (Keystatic / JSON) so local `npm run dev` always works.

## Supabase + Vercel

Production source of truth for chocolates and site settings is Supabase. Keystatic remains useful for **local** file editing; `/admin` is the production CMS path. When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set, the public site prefers Postgres (and falls back to JSON if a query fails or tables are empty).

### 1. Create a free Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Note **Project URL**, **anon public** key, and **service_role** key under **Project Settings → API**.

### 2. Run the schema SQL

In the Supabase SQL editor, run in order:

1. [`supabase/migrations/20261012120000_init.sql`](supabase/migrations/20261012120000_init.sql)
2. [`supabase/migrations/20261012154500_admin_cms.sql`](supabase/migrations/20261012154500_admin_cms.sql) (admin RLS helpers)
3. Create the Storage bucket in the Dashboard (see below), then run [`supabase/migrations/20261012170000_storage_chocolates.sql`](supabase/migrations/20261012170000_storage_chocolates.sql) (policies only)

Or with the CLI (after `npx supabase login` and `npx supabase link`):

```bash
npx supabase db push
```

#### Product image Storage (admin uploads)

Admin create/edit forms upload primary + gallery images to the public **`chocolates`** Storage bucket via a **server action** (service role after `requireAdmin()`). The resulting public URL is stored in `image` / `gallery`.

`next.config.ts` sets `experimental.serverActions.bodySizeLimit` to **6mb** (uploads allow up to 5MB; the Next default is 1MB and will 413 larger files) and `images.remotePatterns` for `**.supabase.co` Storage public URLs. Product cards use a SoftImage helper that accepts both `/images/...` paths and absolute https URLs.

**Create the bucket in the Dashboard** (SQL Editor cannot insert into `storage.buckets` — you get `must be owner of table buckets`):

1. Dashboard → **Storage** → **New bucket**
2. Name: `chocolates`
3. Enable **Public**
4. File size limit: **5 MB**
5. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`

Then apply the `storage.objects` policies:

1. Supabase dashboard → **SQL Editor** → paste and run [`supabase/migrations/20261012170000_storage_chocolates.sql`](supabase/migrations/20261012170000_storage_chocolates.sql) (policies only; the `insert into storage.buckets` is commented out on purpose)

Writes never need a browser Supabase key — keep using server-only `SUPABASE_*` (no `NEXT_PUBLIC_SUPABASE_*`).

### 3. Local env

```bash
cp .env.example .env.local
# paste SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS
```

Never commit `.env.local` or the service role key.

### 4. Seed from `content/`

```bash
npm run seed:supabase
```

This upserts every `content/chocolates/*.json` row and `content/site-settings/index.json` into Supabase (service role required).

### 5. Deploy on Vercel

1. Import [dandamiano/chocolate-safari](https://github.com/dandamiano/chocolate-safari) (or your fork) in the [Vercel dashboard](https://vercel.com/new).
2. Framework: **Next.js** (`vercel.json` is already set).
3. Add env vars (Production + Preview as needed):

| Variable | Purpose | Vercel |
| --- | --- | --- |
| `SUPABASE_URL` | Server content reads + admin Auth | Encrypted |
| `SUPABASE_ANON_KEY` | Server content reads + admin Auth (RLS) | Encrypted |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin CMS writes + seed | Encrypted — **never** public |
| `ADMIN_EMAILS` | Comma-separated allowlist | Encrypted |

Do **not** set `NEXT_PUBLIC_SUPABASE_*` — admin login is server-only (form → server action → session cookies).

4. Deploy. Without Supabase env vars, Vercel still builds and serves JSON from `content/` in the repo. `/admin` needs the vars above.

### CLI deploy (when logged in)

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

## Production admin CMS (`/admin`)

Use this for live Supabase content. Keystatic can stay for local JSON edits.

### Enable Auth + create the first admin

1. Supabase dashboard → **Authentication** → **Providers** → enable **Email** (password and/or magic link).
2. **Authentication** → **Users** → **Add user** → create with email/password (or invite).
3. Optional: set **User Metadata** `{ "role": "admin" }` so the user is allowed even without `ADMIN_EMAILS`.
4. In `.env.local` / Vercel set:
   - `SUPABASE_URL` + `SUPABASE_ANON_KEY` (project URL / anon key — server Auth + reads)
   - `SUPABASE_SERVICE_ROLE_KEY` (server writes after the app verifies you are an admin)
   - `ADMIN_EMAILS=you@example.com` (comma-separated for several admins)
5. Local: open [http://127.0.0.1:43127/admin/login](http://127.0.0.1:43127/admin/login).  
   Production: `https://YOUR_DOMAIN/admin/login`.
6. Sign in → `/admin` dashboard → **Chocolates** or **Site settings**.

Access rules (either is enough):

- Email appears in `ADMIN_EMAILS`, **or**
- `user_metadata.role === "admin"` (or `app_metadata.role` for RLS)

Non-admins are redirected to login with a forbidden message. Session cookies are set by server actions and refreshed in `src/proxy.ts` (Next.js 16 proxy) using `SUPABASE_URL` + `SUPABASE_ANON_KEY`.

Password and magic-link sign-in both run as **server actions** (no browser Supabase client). Magic links complete via `/auth/callback`.

Admin writes run in **server actions** with the **service role** after `requireAdmin()` — the service key is never sent to the browser.

### Admin routes

| Path | Notes |
| --- | --- |
| `/admin/login` | Email/password or magic link |
| `/admin` | Dashboard + sign out |
| `/admin/chocolates` | List all rows (incl. drafts) |
| `/admin/chocolates/new` | Create (image upload + form sections) |
| `/admin/chocolates/[slug]` | Edit / archive (status=draft) / delete |
| `/admin/settings` | Structured site_settings form |

Product images: drag-drop or file picker uploads to Storage bucket `chocolates`; optional manual path/URL under **Advanced**. Public site `next/image` allows `*.supabase.co` storage URLs via `next.config.ts`.

## Content editing (Keystatic — local files)

1. Start the dev server (no Supabase env needed).
2. Open **[http://127.0.0.1:43127/keystatic](http://127.0.0.1:43127/keystatic)**.
3. Edit **Site settings** or **Chocolates** → saves under `content/`.
4. To push edits to production Postgres: `npm run seed:supabase` (or use `/admin` instead).

For Git-backed Keystatic on Vercel, set storage to GitHub in `keystatic.config.ts` and configure:

| Variable | Purpose |
| --- | --- |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App secret |
| `KEYSTATIC_SECRET` | Session encryption (random string) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | GitHub App slug |

See also [`content/README.md`](content/README.md).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port **43127** |
| `npm run build` | Production build |
| `npm run start` | Start production server (port 43127) |
| `npm run lint` | ESLint |
| `npm run seed:supabase` | Upsert `content/` → Supabase (needs service role) |

## Env vars

See [`.env.example`](.env.example).

| Variable | Required for | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Public reads + `/admin` Auth | Prefer Postgres over JSON when set with anon key |
| `SUPABASE_ANON_KEY` | Public reads + `/admin` Auth | RLS: select published chocolates + site settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed + `/admin` writes | Bypasses RLS; never ship to the browser |
| `ADMIN_EMAILS` | `/admin` gate | Comma-separated allowlist |

## Routes

| Path | Notes |
| --- | --- |
| `/` | Landing page |
| `/explore` | Search / tag / country / sort |
| `/chocolates/[slug]` | Detail pages |
| `/sommelier` | Full sommelier chat stub |
| `/admin` | Production CMS (Supabase) |
| `/keystatic` | Local file CMS |
| `/reviews`, `/collections`, `/guides`, `/community` | Coming-soon stubs |
| `/api/newsletter`, `/api/sommelier` | Stub APIs |

## Out of scope (MVP)

Real LLM recommendations, auth/synced tasting logs, reviews CRUD, rankings, commerce, live Keystatic→Supabase sync.
