# AGENTS.md

Guidance for AI coding agents working in this repository. For deeper detail on Maton flows and `lib/`, see `CLAUDE.md`.

## Cursor Cloud

Single-process Next.js 16 App Router app — no database, no Docker, no external services to self-host.

### Commands

- `npm run dev` — dev server on port 3000
- `npm run build` — production build
- `npm run start` — production server (after build)
- `npm run lint` — ESLint (pre-existing warnings exist)

### Environment variables

- `MATON_API_KEY` (required) — server-side Maton API key. In Cursor Cloud, injected via Secrets and written to `.env.local` at setup.
- `BLOB_READ_WRITE_TOKEN` (optional) — when set, user and activity data use Vercel Blob; otherwise `data/users.json` and `data/activity.json`.
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` (optional) — HTTP Basic Auth on protected routes. For `curl`, use `-u $BASIC_AUTH_USER:$BASIC_AUTH_PASSWORD`; browsers prompt when credentials are required.

### Cursor Cloud gotchas

- `.env.local` must exist for Next.js to load `MATON_API_KEY`; the setup script creates it from the environment.
- Lint may exit non-zero due to pre-existing `@next/next/no-html-link-for-pages` issues — expected unless those are fixed.
- Runtime data files are gitignored; no DB migration step.
- Full OAuth (Maton + third parties) needs real accounts and consent — not suitable for full CI automation.

## Architecture (short)

Next.js 16 App Router app using [Maton.ai](https://maton.ai) as an OAuth gateway: one `MATON_API_KEY` manages many users; each user has their own `connection_id`. Gateway requests send `Maton-Connection` so the correct tokens are used.

- **Control plane** (`ctrl.maton.ai`) — connections CRUD. `POST /connections` returns only `{ connection_id }`; always follow with `GET /connections/{id}`.
- **Gateway** (`gateway.maton.ai/{app}/{native-api-path}`) — proxies to Google Sheets, Slack, Gmail, Notion, GitHub, etc.

### Data flow

1. User enters email → `/dashboard?email=...`
2. Connect → `POST /api/maton/connect` creates a connection, persists to Blob or `data/users.json`, returns OAuth URL
3. After OAuth, status becomes ACTIVE; dashboard uses polling (`ConnectionStatus`, ~3s) and `visibilitychange`
4. Gateway traffic → `lib/gateway.ts` → `matonFetchWithMeta()`; activity logged to Blob or `data/activity.json`

### `lib/` modules

| File | Role |
|------|------|
| `maton.ts` | `matonFetch` (control plane), `matonFetchWithMeta` (gateway; returns data + status + timing) |
| `store.ts` | Async user connections: `email → { connections: { [app]: record } }` |
| `activity-store.ts` | Append-only activity log, FIFO cap 1000 |
| `gateway.ts` | `Maton-Connection` header + activity logging |
| `apps.ts` | Supported apps registry (slug, name, icon, color) |

### API routes (`app/api/maton/`)

All Maton calls stay server-side (API key never exposed). `connect` / `disconnect` body: `{ email, app }`. `user` syncs store with Maton and drops 404 connections. `gateway/*` routes delegate to `gatewayCall()` in `lib/gateway.ts`.

### Agent-relevant gotchas

- Do not reuse Maton connections across users; the connect route must use the **current user’s** store entry, not a global connection list.
- Stale connections: `user` route removes 404s; connect may create a new connection if the old id is invalid.

### Middleware and UI

- `middleware.ts` — Basic Auth only when `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` are both set; applies to `/admin`, `/activity`, `/store`, and `/api/maton/*` (see `config.matcher`). `/` and `/dashboard` are not matched.
- Styling: Tailwind v4, `@theme` in `globals.css`, dark theme, accent `#34d399`. Common classes: `.glass-card`, `.bg-grid`, `.app-card`, `.btn-press`, etc.; layout uses `Sidebar`.
