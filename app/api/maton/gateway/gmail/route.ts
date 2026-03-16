import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/store";
import { gatewayCall } from "@/lib/gateway";

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    const maxResults = new URL(req.url).searchParams.get("maxResults") || "10";

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const conn = getConnection(email, "google-mail");
    if (!conn) {
      return NextResponse.json({ error: "No Gmail connection found" }, { status: 404 });
    }

    // List messages
    const listResult = await gatewayCall({
      email,
      app: "google-mail",
      connectionId: conn.connectionId,
      path: `gmail/v1/users/me/messages?maxResults=${maxResults}`,
    });

    const messages = (listResult.data as { messages?: { id: string }[] }).messages ?? [];

    // Fetch details for each message (first 5 for performance)
    const details = await Promise.all(
      messages.slice(0, 5).map(async (m) => {
        const detail = await gatewayCall({
          email,
          app: "google-mail",
          connectionId: conn.connectionId,
          path: `gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        });
        return detail.data;
      })
    );

    return NextResponse.json({ messages: details });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
