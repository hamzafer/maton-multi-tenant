import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/store";
import { getActivities } from "@/lib/activity-store";

export async function GET(req: NextRequest) {
  const file = new URL(req.url).searchParams.get("file");

  if (file === "users") {
    const users = await getAllUsers();
    return NextResponse.json(users);
  }

  if (file === "activity") {
    const activities = await getActivities();
    return NextResponse.json(activities);
  }

  return NextResponse.json({ error: "file param must be 'users' or 'activity'" }, { status: 400 });
}
