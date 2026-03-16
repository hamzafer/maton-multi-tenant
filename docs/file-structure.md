# File Structure

```
maton-test/
├── .env.local                          # MATON_API_KEY (git-ignored)
├── data/
│   ├── users.json                      # User → connections mapping
│   └── activity.json                   # API call activity log
│
├── lib/
│   ├── maton.ts                        # Server-side Maton API client
│   ├── store.ts                        # User/connection JSON file store
│   ├── activity-store.ts               # Activity log JSON file store
│   ├── apps.ts                         # App registry (slug, name, icon, color)
│   └── gateway.ts                      # Gateway call helper with activity logging
│
├── app/
│   ├── layout.tsx                      # Root layout with NavBar
│   ├── page.tsx                        # Landing page (email input)
│   ├── dashboard/page.tsx              # Multi-app connection grid + demo actions
│   ├── admin/page.tsx                  # Admin panel (all connections)
│   ├── activity/page.tsx               # Activity log with chart
│   ├── store/page.tsx                  # Raw JSON viewer
│   └── api/maton/
│       ├── connect/route.ts            # POST — create connection for user+app
│       ├── disconnect/route.ts         # POST — delete connection for user+app
│       ├── user/route.ts               # GET — fetch user's connections (syncs with Maton)
│       ├── status/[id]/route.ts        # GET — poll connection status
│       ├── sheets/route.ts             # GET — read Google Sheet via gateway
│       ├── store/route.ts              # GET — serve raw JSON files
│       ├── admin/connections/route.ts  # GET all / DELETE by ID
│       ├── activity/route.ts           # GET activity log with filters
│       └── gateway/
│           ├── slack/route.ts          # POST — send Slack message
│           ├── gmail/route.ts          # GET — list recent emails
│           ├── notion/route.ts         # GET — list databases
│           └── github/route.ts         # GET — list repositories
│
└── components/
    ├── nav-bar.tsx                     # Top navigation (Dashboard, Admin, Activity, {})
    ├── app-card.tsx                    # App card in the connection grid
    ├── connection-status.tsx           # OAuth polling UI (pending state)
    ├── connect-button.tsx              # (legacy, used in v1)
    ├── sheet-reader.tsx                # Google Sheets query form + table
    ├── slack-sender.tsx                # Slack message sender form
    ├── gmail-viewer.tsx                # Gmail email list
    ├── notion-viewer.tsx               # Notion database list
    └── github-viewer.tsx               # GitHub repo list
```

## Data Model

### users.json

```json
{
  "user@email.com": {
    "connections": {
      "google-sheets": {
        "connectionId": "uuid",
        "status": "ACTIVE",
        "app": "google-sheets",
        "oauthUrl": "https://connect.maton.ai/..."
      },
      "slack": { ... }
    }
  }
}
```

Supports multiple apps per user. Lazy-migrates from the old flat format on first read.

### activity.json

```json
[
  {
    "id": "1710626400000-abc123",
    "timestamp": "2026-03-16T22:00:00.000Z",
    "email": "user@email.com",
    "app": "google-sheets",
    "endpoint": "v4/spreadsheets/.../values/...",
    "method": "GET",
    "statusCode": 200,
    "responseTimeMs": 342
  }
]
```

FIFO capped at 1000 entries.
