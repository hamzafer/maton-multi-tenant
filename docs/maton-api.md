# Maton API Reference (as used in this app)

## Control Plane — `https://ctrl.maton.ai`

Manages OAuth connections. All requests need `Authorization: Bearer <MATON_API_KEY>`.

### Create Connection

```
POST /connections
Body: { "app": "google-sheets" }
Response: { "connection_id": "uuid" }
```

Returns just the ID. Call Get Connection next for full details (including the OAuth URL).

### Get Connection

```
GET /connections/{id}
Response: {
  "connection": {
    "connection_id": "uuid",
    "status": "PENDING" | "ACTIVE" | "FAILED",
    "url": "https://connect.maton.ai/?session_token=...",
    "app": "google-sheets",
    "metadata": { "email": "user@example.com", "picture": "..." },
    "method": "OAUTH2",
    "creation_time": "...",
    "last_updated_time": "..."
  }
}
```

The `url` is what users open to complete OAuth. `metadata` gets populated after OAuth with user profile info.

### List Connections

```
GET /connections?app=google-sheets&status=ACTIVE
Response: { "connections": [...] }
```

Both query params are optional. Omit both to get all connections.

### Delete Connection

```
DELETE /connections/{id}
Response: {}
```

## API Gateway — `https://gateway.maton.ai`

Proxies requests to third-party APIs using managed OAuth tokens.

```
https://gateway.maton.ai/{app}/{native-api-path}
```

Headers:
- `Authorization: Bearer <MATON_API_KEY>`
- `Maton-Connection: <connection_id>` (required when multiple connections exist for same app)

### Examples

**Google Sheets** — read values:
```
GET /google-sheets/v4/spreadsheets/{id}/values/{range}
```

**Slack** — send message:
```
POST /slack/api/chat.postMessage
Body: { "channel": "C0123456", "text": "Hello!" }
```

**Gmail** — list messages:
```
GET /google-mail/gmail/v1/users/me/messages?maxResults=10
```

**Notion** — search databases:
```
POST /notion/v1/search
Headers: Notion-Version: 2022-06-28
Body: { "filter": { "property": "object", "value": "database" } }
```

**GitHub** — list repos:
```
GET /github/user/repos?sort=updated&per_page=10
```

## Connection Flow

1. `POST /connections { app }` → get `connection_id`
2. `GET /connections/{id}` → get OAuth `url`
3. User opens URL in browser → completes OAuth
4. Poll `GET /connections/{id}` → status changes from `PENDING` to `ACTIVE`
5. Call gateway with `Maton-Connection: {id}` header

## Important Notes

- **One API key, many connections**: Your API key manages all user connections
- **Connection metadata**: After OAuth, contains user's email and profile picture
- **Rate limit**: 10 requests/second per account
- **App names in gateway URL**: Must match exactly (e.g., `google-mail` not `gmail`)
