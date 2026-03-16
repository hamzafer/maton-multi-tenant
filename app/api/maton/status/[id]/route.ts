import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/maton";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await getConnection(id);
    return NextResponse.json({
      connectionId: connection.connection_id,
      status: connection.status,
      app: connection.app,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
