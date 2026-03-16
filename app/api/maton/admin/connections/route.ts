import { NextRequest, NextResponse } from "next/server";
import { listConnections, deleteConnectionById } from "@/lib/maton";

export async function GET() {
  try {
    const connections = await listConnections();
    return NextResponse.json({ connections });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { connectionId } = await req.json();
    if (!connectionId) {
      return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
    }
    await deleteConnectionById(connectionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
