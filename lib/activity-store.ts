import { put, get } from "@vercel/blob";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_KEY = "activity.json";
const LOCAL_PATH = join(process.cwd(), "data", "activity.json");
const MAX_ENTRIES = 1000;

export interface ActivityEntry {
  id: string;
  timestamp: string;
  email: string;
  app: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
}

async function read(): Promise<ActivityEntry[]> {
  if (useBlob) {
    try {
      const result = await get(BLOB_KEY, { access: "private" });
      if (!result || result.statusCode !== 200) return [];
      const text = await new Response(result.stream).text();
      return JSON.parse(text);
    } catch {
      return [];
    }
  }
  if (!existsSync(LOCAL_PATH)) return [];
  return JSON.parse(readFileSync(LOCAL_PATH, "utf-8"));
}

async function write(entries: ActivityEntry[]): Promise<void> {
  if (useBlob) {
    await put(BLOB_KEY, JSON.stringify(entries, null, 2), {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
    return;
  }
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(LOCAL_PATH, JSON.stringify(entries, null, 2));
}

export async function logActivity(entry: Omit<ActivityEntry, "id" | "timestamp">): Promise<void> {
  const entries = await read();
  entries.push({
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  });
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }
  await write(entries);
}

export async function getActivities(filters?: {
  app?: string;
  email?: string;
  limit?: number;
}): Promise<ActivityEntry[]> {
  let entries = await read();

  if (filters?.app) {
    entries = entries.filter((e) => e.app === filters.app);
  }
  if (filters?.email) {
    entries = entries.filter((e) => e.email === filters.email);
  }

  entries.reverse();

  if (filters?.limit) {
    entries = entries.slice(0, filters.limit);
  }

  return entries;
}
