# Maton Demo

Multi-user app that connects to 100+ APIs through [Maton](https://maton.ai)'s OAuth gateway. One API key manages connections for all your users.

## Quick Start

```bash
npm install
echo "MATON_API_KEY=your-key" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. User enters their email on the landing page
2. Dashboard shows a grid of apps (Google Sheets, Slack, Gmail, Notion, GitHub)
3. Click **Connect** on any app → OAuth flow opens in a new tab
4. Once authorized, the app can call that service's API on behalf of the user

All API calls go through Maton's gateway (`gateway.maton.ai`), which injects the user's OAuth token automatically. Your `MATON_API_KEY` stays server-side.

## Features

### Dashboard (`/dashboard?email=...`)

The main user view. Shows 5 app cards — each can be independently connected/disconnected.

**Connected apps** show a demo action when clicked:

| App | Demo Action |
|-----|-------------|
| Google Sheets | Enter a spreadsheet ID + range → renders data as a table |
| Slack | Enter a channel ID + message → sends it |
| Gmail | Fetches and displays your 5 most recent emails |
| Notion | Lists all databases in your workspace |
| GitHub | Lists your 10 most recently updated repos |

### Admin (`/admin`)

Shows all connections across all users in a single table. Displays user avatars and emails from OAuth metadata. Delete any connection. Auto-refreshes every 10 seconds.

### Activity Log (`/activity`)

Every API call made through the gateway is logged. Shows a response time bar chart and a filterable table with timestamp, app, method, endpoint, status code, and response time. Filter by app. Auto-refreshes every 5 seconds.

### Raw Store (`/store`)

Live view of the raw JSON data files (`users.json` and `activity.json`). Toggle between tabs. Auto-refreshes every 3 seconds. Useful for debugging.

## Example: Connect Google Sheets and Read Data

```
1. Go to http://localhost:3000
2. Enter: test@example.com → click Continue
3. Click "Connect" on the Google Sheets card
4. Complete Google OAuth in the new tab
5. Return to the dashboard → card shows "Active"
6. Click the Google Sheets card
7. Enter spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
8. Enter range: Sheet1!A1:D10
9. Click "Fetch Data" → table renders
```

## Example: Test Multi-User Isolation

```
1. Open two browser tabs
2. Tab 1: log in as user-a@example.com → connect Google Sheets
3. Tab 2: log in as user-b@example.com → connect Google Sheets
4. Go to /admin → both connections appear with different connection IDs
5. Each user can only read their own spreadsheets
```

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Maton API** — OAuth connection management + API gateway
- **JSON file storage** — `data/users.json` and `data/activity.json`

## API Key

Get yours at [maton.ai/settings](https://maton.ai/settings). The key authenticates with Maton but grants no access to third-party services — each service requires explicit OAuth authorization by the user.

## Docs

See the [`docs/`](docs/) directory for detailed documentation:

- [Overview](docs/overview.md) — architecture and background
- [Setup](docs/setup.md) — installation and configuration
- [Maton API](docs/maton-api.md) — endpoint reference as used in this app
- [File Structure](docs/file-structure.md) — every file and data model
- [Lessons Learned](docs/lessons-learned.md) — bugs encountered and fixes
