import { NextRequest, NextResponse } from "next/server";
import { getUserConnections, saveConnection, deleteConnection } from "@/lib/store";
import { getConnection as matonGetConnection } from "@/lib/maton";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email");
  const app = new URL(req.url).searchParams.get("app");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const connections = getUserConnections(email);
  if (!connections || Object.keys(connections).length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If specific app requested, sync its status from Maton
  if (app) {
    const conn = connections[app];
    if (!conn) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    try {
      const live = await matonGetConnection(conn.connectionId);
      const updated = { ...conn, status: live.status, oauthUrl: live.url };
      saveConnection(email, app, updated);
      return NextResponse.json(updated);
    } catch {
      // Stale connection — remove from store
      deleteConnection(email, app);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  // Return all connections, sync each status — remove stale ones
  const synced: Record<string, unknown> = {};
  for (const [appSlug, conn] of Object.entries(connections)) {
    try {
      const live = await matonGetConnection(conn.connectionId);
      const updated = { ...conn, status: live.status, oauthUrl: live.url };
      saveConnection(email, appSlug, updated);
      synced[appSlug] = updated;
    } catch {
      // Stale connection — remove from store
      deleteConnection(email, appSlug);
    }
  }

  if (Object.keys(synced).length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ connections: synced });
}
