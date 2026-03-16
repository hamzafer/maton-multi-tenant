import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(req: NextRequest) {
  const file = new URL(req.url).searchParams.get("file");
  const dataDir = join(process.cwd(), "data");

  if (file === "users") {
    const path = join(dataDir, "users.json");
    if (!existsSync(path)) return NextResponse.json({});
    return NextResponse.json(JSON.parse(readFileSync(path, "utf-8")));
  }

  if (file === "activity") {
    const path = join(dataDir, "activity.json");
    if (!existsSync(path)) return NextResponse.json([]);
    return NextResponse.json(JSON.parse(readFileSync(path, "utf-8")));
  }

  return NextResponse.json({ error: "file param must be 'users' or 'activity'" }, { status: 400 });
}
