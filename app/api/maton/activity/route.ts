import { NextRequest, NextResponse } from "next/server";
import { getActivities } from "@/lib/activity-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const app = searchParams.get("app") || undefined;
  const email = searchParams.get("email") || undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

  const activities = await getActivities({ app, email, limit });
  return NextResponse.json({ activities });
}
