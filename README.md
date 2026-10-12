# Chocolate Safari

A Next.js tasting catalogue for discovering chocolates — dark cocoa UI, brass accents, AI Sommelier stub, and content from **Supabase (Postgres)** when configured, otherwise JSON/`content/` via **Keystatic**.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- shadcn/ui primitives
- **Supabase** Postgres for production content (optional locally)
- **Keystatic** admin at `/keystatic` for local file editing in `/content`
- Zod-validated content shapes in `src/lib/schemas.ts`

## Develop

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

With no Supabase env vars set, the app reads `content/` (Keystatic / JSON) so local `npm run dev` always works.

## Supabase + Vercel

Production source of truth for chocolates and site settings is Supabase. Keystatic remains useful for **local** file editing; when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set (server-only), the site prefers Postgres (and falls back to JSON if a query fails or tables are empty).

### 1. Create a free Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Note **Project URL**, **anon public** key, and **service_role** key under **Project Settings → API**.

### 2. Run the schema SQL

In the Supabase SQL editor, paste and run:

[`supabase/migrations/20261012120000_init.sql`](supabase/migrations/20261012120000_init.sql)

Or with the CLI (after `npx supabase login` and `npx supabase link`):

```bash
npx supabase db push
```

### 3. Local env

```bash
cp .env.example .env.local
# paste SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

Never commit `.env.local` or the service role key. Legacy `NEXT_PUBLIC_SUPABASE_*` names still work as a temporary fallback.

### 4. Seed from `content/`

```bash
npm run seed:supabase
```

This upserts every `content/chocolates/*.json` row and `content/site-settings/index.json` into Supabase (service role required).

### 5. Deploy on Vercel

1. Import [OAFdeveloper/chocolate-safari](https://github.com/OAFdeveloper/chocolate-safari) in the [Vercel dashboard](https://vercel.com/new).
2. Framework: **Next.js** (`vercel.json` is already set).
3. Add env vars (Production + Preview as needed) as **Sensitive / encrypted** server env vars — **not** “Config” / public / `NEXT_PUBLIC_*` (content reads are server-side only):

| Variable | Where | Vercel |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | Sensitive (not exposed to browser) |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | Sensitive (not exposed to browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional on Vercel — only if you run seed/admin from a server path; **not** required for public reads | Sensitive |

In the Vercel UI: **delete** any `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` and add `SUPABASE_URL` + `SUPABASE_ANON_KEY` as regular encrypted env vars.

4. Deploy. Without Supabase env vars, Vercel still builds and serves JSON from `content/` in the repo.

### CLI deploy (when logged in)

```bash
npx vercel login
npx vercel link
npx vercel --prod
# then: vercel env add SUPABASE_URL / SUPABASE_ANON_KEY
```

## Content editing (Keystatic)

1. Start the dev server (no Supabase env needed).
2. Open **[http://127.0.0.1:43127/keystatic](http://127.0.0.1:43127/keystatic)**.
3. Edit **Site settings** or **Chocolates** → saves under `content/`.
4. To push edits to production Postgres: `npm run seed:supabase`.

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
| `SUPABASE_URL` | Supabase reads | Prefer Postgres over JSON when set with anon key; server-only |
| `SUPABASE_ANON_KEY` | Supabase reads | RLS: select published chocolates + site settings; server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed only | Bypasses RLS; never ship to the browser |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy fallback | Still accepted for one release; prefer the names above |

## Routes

| Path | Notes |
| --- | --- |
| `/` | Landing page |
| `/explore` | Search / tag / country / sort |
| `/chocolates/[slug]` | Detail pages |
| `/sommelier` | Full sommelier chat stub |
| `/keystatic` | CMS admin UI (local files) |
| `/reviews`, `/collections`, `/guides`, `/community` | Coming-soon stubs |
| `/api/newsletter`, `/api/sommelier` | Stub APIs |

## Out of scope (MVP)

Real LLM recommendations, auth/synced tasting logs, reviews CRUD, rankings, commerce, live Keystatic→Supabase sync.
