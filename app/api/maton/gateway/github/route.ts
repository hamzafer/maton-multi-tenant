import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/store";
import { gatewayCall } from "@/lib/gateway";

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const conn = await getConnection(email, "github");
    if (!conn) {
      return NextResponse.json({ error: "No GitHub connection found" }, { status: 404 });
    }

    const result = await gatewayCall({
      email,
      app: "github",
      connectionId: conn.connectionId,
      path: "user/repos?sort=updated&per_page=10",
    });

    return NextResponse.json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
