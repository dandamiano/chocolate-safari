# Chocolate Safari

A Next.js tasting catalogue for discovering chocolates — dark cocoa UI, brass accents, AI Sommelier stub, and Git-based content editable via **Keystatic** or JSON in `/content`.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- shadcn/ui primitives
- **Keystatic** admin at `/keystatic` (local storage in dev; GitHub storage on Vercel — see below)
- Zod-validated JSON in `/content`

## Develop

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Content editing (Keystatic)

1. Start the dev server.
2. Open **[http://127.0.0.1:43127/keystatic](http://127.0.0.1:43127/keystatic)**.
3. Edit **Site settings** (hero, stats, sommelier, footer) or **Chocolates** (catalogue).
4. Save — Keystatic writes to `content/site-settings/index.json` and `content/chocolates/*.json`. Refresh the site to see changes.

For production on Vercel with Git-backed editing, set storage to GitHub in `keystatic.config.ts` and configure:

| Variable | Purpose |
| --- | --- |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App secret |
| `KEYSTATIC_SECRET` | Session encryption (random string) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | GitHub App slug |

Until those are set, edit content via PRs to `/content` or use local Keystatic in dev.

See also [`content/README.md`](content/README.md).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port **43127** |
| `npm run build` | Production build |
| `npm run start` | Start production server (port 43127) |
| `npm run lint` | ESLint |

## Routes

| Path | Notes |
| --- | --- |
| `/` | Landing page (design sections) |
| `/explore` | Search / tag / country / sort |
| `/chocolates/[slug]` | Detail pages |
| `/sommelier` | Full sommelier chat stub |
| `/keystatic` | CMS admin UI |
| `/reviews`, `/collections`, `/guides`, `/community` | Coming-soon stubs |
| `/api/newsletter`, `/api/sommelier` | Stub APIs |

## Deploy (Vercel)

### One-click (recommended)

1. Import [OAFdeveloper/chocolate-safari](https://github.com/OAFdeveloper/chocolate-safari) in the Vercel dashboard.
2. Framework preset: **Next.js** (see `vercel.json`).
3. Deploy — no env vars required for read-only JSON content.

### CLI (when `VERCEL_TOKEN` is available)

```bash
npm i -g vercel
vercel link   # once, select the project
vercel --prod
```

### Manual checklist

- Node.js 20+ on the host
- `npm install && npm run build && npm run start`
- Bind to port **43127** or set `PORT` as your host requires

Keystatic admin on production needs GitHub App env vars (table above) or content changes go through git.

## Out of scope (MVP)

Real LLM recommendations, auth/synced tasting logs, reviews CRUD, rankings, commerce.
