# Maton Demo App — Overview

A Next.js app that demonstrates Maton's multi-user OAuth connection flow and API gateway. One developer API key manages connections for multiple end users, each with their own OAuth tokens.

## What This App Does

- **Multi-user**: Each user enters their email, connects their own accounts via OAuth
- **Multi-app**: Supports Google Sheets, Slack, Gmail, Notion, GitHub
- **Admin panel**: See all connections across all users, manage them
- **Activity log**: Every API gateway call is tracked with response times
- **Raw store viewer**: Live JSON view of the local data files

## Architecture

```
Browser (User A, B, C...)
  |
  v
Next.js App (API Routes — keeps MATON_API_KEY server-side)
  |
  v
Maton Control Plane (ctrl.maton.ai)     — create/manage per-user connections
Maton API Gateway (gateway.maton.ai)    — proxy API calls with per-user OAuth tokens
  |
  v
Google Sheets API, Slack API, Gmail API, Notion API, GitHub API
```

**Key concept**: One API key, many connections. Each user gets a unique `connection_id`. The `Maton-Connection` header tells the gateway which user's OAuth tokens to use.

## Background

Built during a session with Richard from Maton (2026-03-16) to test and demonstrate the Maton connection APIs end-to-end. The API reference and gateway skill docs were shared on a Zoom call.
