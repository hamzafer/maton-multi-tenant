import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/store";
import { gatewayCall } from "@/lib/gateway";

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const conn = getConnection(email, "notion");
    if (!conn) {
      return NextResponse.json({ error: "No Notion connection found" }, { status: 404 });
    }

    const result = await gatewayCall({
      email,
      app: "notion",
      connectionId: conn.connectionId,
      path: "v1/search",
      method: "POST",
      body: { filter: { property: "object", value: "database" } },
      extraHeaders: { "Notion-Version": "2022-06-28" },
    });

    return NextResponse.json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
