# Lessons Learned

Issues encountered during development and how they were resolved.

## 1. CreateConnection response shape

**Problem**: The docs suggested `POST /connections` returns a full connection object. It actually returns just `{ "connection_id": "uuid" }`.

**Fix**: After creating, immediately call `GET /connections/{id}` to get the full object (status, OAuth URL, etc.).

## 2. Connection reuse across users

**Problem**: The connect route checked `listConnections(app, "ACTIVE")` and reused the first active connection found. Since all connections are under one API key, User B would steal User A's connection.

**Fix**: Only check the local store for the requesting user's existing connection. Always create a new connection for new users.

## 3. Stale connections in local store

**Problem**: When a connection is deleted on Maton's side (or was reassigned), the local store still references the old connection ID. The user route would try to verify it against Maton, get a 404, and show a confusing error.

**Fix**: The user route now deletes stale entries from the store when Maton returns 404. The connect route also handles this — if the existing connection 404s, it falls through to create a new one.

## 4. OAuth completion not auto-detected

**Problem**: After completing OAuth in a new tab, returning to the dashboard still showed "PENDING". Users had to manually refresh.

**Fix**: Added `visibilitychange` and `focus` event listeners. When the user switches back to the tab, the dashboard re-fetches connection status from Maton. The `ConnectionStatus` component's 3s polling also serves as a backup.

## 5. Tailwind CSS v4 + Next.js 14

**Problem**: The project was scaffolded with Next.js 16 + Tailwind v4, but had to downgrade to Next.js 14 (SWC incompatibility in the sandbox). Tailwind v4 uses `@tailwindcss/postcss` instead of the `tailwindcss` PostCSS plugin directly.

**Fix**: Updated `postcss.config.mjs` to use `@tailwindcss/postcss` and CSS to use `@import "tailwindcss"` (v4 syntax) instead of `@tailwind base/components/utilities` (v3 syntax). Later upgraded back to Next.js 16 locally.

## 6. Corrupted node_modules from sandbox

**Problem**: The sandbox environment had CPU limitations causing SWC crashes. Installing packages there corrupted TypeScript binaries that then didn't work locally.

**Fix**: `rm -rf node_modules && npm install` locally to get clean binaries.
