import { NextResponse } from "next/server";
import { getConnection as getMatonConnection } from "@/lib/maton";
import { getAllUsers, deleteConnection } from "@/lib/store";

export async function POST() {
  try {
    const store = await getAllUsers();
    let removed = 0;
    const details: string[] = [];

    for (const email of Object.keys(store)) {
      const connections = store[email]?.connections ?? {};
      for (const app of Object.keys(connections)) {
        const record = connections[app];
        try {
          await getMatonConnection(record.connectionId);
          // Still alive on Maton — keep it
        } catch {
          // 404 or error — zombie, remove it
          await deleteConnection(email, app);
          removed++;
          details.push(`${email} / ${app} (${record.connectionId})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      removed,
      details,
      message: removed > 0
        ? `Cleaned ${removed} zombie connection${removed > 1 ? "s" : ""}`
        : "No zombies found — store is clean",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
