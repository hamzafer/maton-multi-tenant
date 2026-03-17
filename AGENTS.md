## Cursor Cloud specific instructions

Single-process Next.js 16 App Router application — no database, no Docker, no external services to self-host.

### Running the app

- `npm run dev` starts the dev server on port 3000
- `npm run build` for production build
- `npm run lint` for ESLint (pre-existing warnings exist in the repo)

### Environment variables

- `MATON_API_KEY` (required) — injected via Cursor Secrets. Written to `.env.local` at setup time.
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` (optional) — if set, middleware enforces HTTP Basic Auth on all dashboard/admin/activity/store/API routes. When testing via `curl`, pass `-u $BASIC_AUTH_USER:$BASIC_AUTH_PASSWORD`. When testing via browser (computerUse), the browser will prompt for credentials.

### Gotchas

- The `.env.local` file must exist for the Next.js server to pick up `MATON_API_KEY`. The update script creates it from the environment variable.
- Lint exits non-zero due to pre-existing `@next/next/no-html-link-for-pages` errors in the repo — this is expected.
- Data is stored in `data/users.json` and `data/activity.json` (created at runtime, gitignored). No database setup needed.
- OAuth flows (connecting apps) require a real Maton account and third-party OAuth consent — these cannot be fully tested in CI.
