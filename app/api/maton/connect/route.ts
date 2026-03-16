import { NextRequest, NextResponse } from "next/server";
import { createConnection, getConnection as matonGetConnection } from "@/lib/maton";
import { getConnection, saveConnection } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { email, app } = await req.json();
    if (!email || !app) {
      return NextResponse.json({ error: "email and app are required" }, { status: 400 });
    }

    // Check if THIS user already has a connection for this app in our local store
    const existing = await getConnection(email, app);
    if (existing) {
      // Verify it's still active on Maton's side
      try {
        const live = await matonGetConnection(existing.connectionId);
        if (live.status === "ACTIVE") {
          await saveConnection(email, app, { ...existing, status: "ACTIVE" });
          return NextResponse.json({
            connectionId: live.connection_id,
            status: live.status,
            existing: true,
          });
        }
      } catch {
        // Connection no longer exists on Maton, fall through to create new
      }
    }

    // Always create a NEW connection for this user
    const connection = await createConnection(app);

    await saveConnection(email, app, {
      connectionId: connection.connection_id,
      status: connection.status,
      app: connection.app,
      oauthUrl: connection.url,
    });

    return NextResponse.json({
      connectionId: connection.connection_id,
      oauthUrl: connection.url,
      status: connection.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
