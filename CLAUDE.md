# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

Next.js 16 App Router app that uses Maton.ai as an OAuth gateway to connect multiple users to multiple third-party APIs (Google Sheets, Slack, Gmail, Notion, GitHub) through a single developer API key.

### Key Concept

One `MATON_API_KEY` (server-side only) manages OAuth connections for all users. Each user gets their own `connection_id`. The `Maton-Connection` header tells the gateway which user's OAuth tokens to use.

### Two Maton APIs

- **Control Plane** (`ctrl.maton.ai`) — CRUD for connections. `POST /connections` returns just `{ connection_id }` (not a full object — must call `GET /connections/{id}` after).
- **Gateway** (`gateway.maton.ai/{app}/{native-api-path}`) — proxies requests to third-party APIs with auto-injected OAuth tokens.

### Data Flow

1. User enters email → navigates to `/dashboard?email=...`
2. Clicks Connect on an app → `POST /api/maton/connect` creates a Maton connection, saves to Vercel Blob (or `data/users.json` locally), returns OAuth URL
3. User completes OAuth in new tab → connection status changes to ACTIVE on Maton's side
4. Dashboard detects via polling (`ConnectionStatus` component, 3s interval) + `visibilitychange` listener
5. Gateway calls go through `lib/gateway.ts` → `matonFetchWithMeta()` which logs to Vercel Blob (or `data/activity.json` locally)

### Server-Side Libraries (`lib/`)

- **`maton.ts`** — Maton API client. `matonFetch` for control plane, `matonFetchWithMeta` returns `{ data, statusCode, responseTimeMs }` for gateway calls.
- **`store.ts`** — Async CRUD for user connections. Uses Vercel Blob (`@vercel/blob`) when `BLOB_READ_WRITE_TOKEN` is set, falls back to `data/users.json` locally. Model: `email → { connections: { [app]: record } }`. All exported functions are async.
- **`activity-store.ts`** — Async append-only log, FIFO capped at 1000 entries. Same Blob/filesystem dual backend as `store.ts`.
- **`gateway.ts`** — Wraps `matonFetchWithMeta` with `Maton-Connection` header and auto-logs activity.
- **`apps.ts`** — Registry of supported apps (slug, name, icon SVG path, color).

### API Routes (`app/api/maton/`)

All Maton API calls are server-side (API key never exposed to client).

- `connect` and `disconnect` take `{ email, app }` body
- `user` route syncs local store with Maton's live status — deletes stale connections that 404
- `gateway/*` routes (slack, gmail, notion, github) use `gatewayCall()` from `lib/gateway.ts`

### Gotchas

- **Never reuse connections across users.** Maton connections are account-level (one API key). The connect route must check the local store for the specific user, not `listConnections` globally.
- **Stale connections:** The user route auto-cleans entries where Maton returns 404. The connect route falls through to create new if existing connection is gone.
- **`POST /connections` returns only `{ connection_id }`**, not the full object. Always follow up with `GET /connections/{id}`.

### Middleware

Basic Auth via `middleware.ts`. Protects `/admin`, `/activity`, `/store`, and `/api/maton/*`. Dashboard (`/dashboard`) and landing page (`/`) are public. Credentials from `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` env vars.

### Styling

Tailwind CSS v4 with `@theme` block in `globals.css`. Dark theme with emerald accent (`--color-accent: #34d399`). Fonts: DM Sans + JetBrains Mono. Key custom classes: `.glass-card`, `.bg-grid`, `.bg-mesh`, `.app-card`, `.btn-press`, `.noise-overlay`, `.skeleton-bone`, `.animate-fade-up`. Layout uses a collapsible `Sidebar` component.
