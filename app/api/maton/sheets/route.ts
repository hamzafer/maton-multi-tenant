import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/store";
import { gatewayCall } from "@/lib/gateway";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const spreadsheetId = searchParams.get("spreadsheetId");
    const range = searchParams.get("range");

    if (!email || !spreadsheetId || !range) {
      return NextResponse.json(
        { error: "email, spreadsheetId, and range are required" },
        { status: 400 }
      );
    }

    const conn = await getConnection(email, "google-sheets");
    if (!conn) {
      return NextResponse.json({ error: "No connection found" }, { status: 404 });
    }

    const result = await gatewayCall({
      email,
      app: "google-sheets",
      connectionId: conn.connectionId,
      path: `v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
    });

    return NextResponse.json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
