import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/store";
import { gatewayCall } from "@/lib/gateway";

export async function POST(req: NextRequest) {
  try {
    const { email, channel, text } = await req.json();
    if (!email || !channel || !text) {
      return NextResponse.json({ error: "email, channel, and text are required" }, { status: 400 });
    }

    const conn = await getConnection(email, "slack");
    if (!conn) {
      return NextResponse.json({ error: "No Slack connection found" }, { status: 404 });
    }

    const result = await gatewayCall({
      email,
      app: "slack",
      connectionId: conn.connectionId,
      path: "api/chat.postMessage",
      method: "POST",
      body: { channel, text },
    });

    return NextResponse.json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
