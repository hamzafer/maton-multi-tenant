import { NextRequest, NextResponse } from "next/server";
import { deleteConnectionById } from "@/lib/maton";
import { getConnection, deleteConnection } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { email, app } = await req.json();
    if (!email || !app) {
      return NextResponse.json({ error: "email and app are required" }, { status: 400 });
    }

    const conn = await getConnection(email, app);
    if (!conn) {
      return NextResponse.json({ error: "No connection found" }, { status: 404 });
    }

    await deleteConnectionById(conn.connectionId);
    await deleteConnection(email, app);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
