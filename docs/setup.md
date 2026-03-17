# Setup

## Prerequisites

- Node.js 20+
- A Maton API key (get one at [maton.ai/settings](https://maton.ai/settings))

## Install & Run

```bash
npm install
```

Create `.env.local` in the project root:

```
MATON_API_KEY=your-api-key-here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Path | Description |
|------|-------------|
| `/` | Landing page — enter email to start |
| `/dashboard?email=...` | Multi-app connection grid + demo actions |
| `/admin` | All connections across all users (auto-refreshes 10s) |
| `/activity` | Gateway API call log with response time chart (auto-refreshes 5s) |
| `/store` | Raw JSON viewer for `users.json` and `activity.json` (auto-refreshes 3s) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MATON_API_KEY` | Yes | Your Maton API key. Never exposed to the client. |
| `BASIC_AUTH_USER` | No | Username for Basic Auth on protected pages (Admin, Activity, Store). |
| `BASIC_AUTH_PASSWORD` | No | Password for Basic Auth. If either auth var is unset, auth is disabled. |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for persistent storage. Auto-injected on Vercel. For local dev, run `vercel env pull` to get it. Without it, the app uses `data/*.json` files. |
