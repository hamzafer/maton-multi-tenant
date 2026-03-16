import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const ACTIVITY_PATH = join(DATA_DIR, "activity.json");
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

function read(): ActivityEntry[] {
  if (!existsSync(ACTIVITY_PATH)) return [];
  return JSON.parse(readFileSync(ACTIVITY_PATH, "utf-8"));
}

function write(entries: ActivityEntry[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(ACTIVITY_PATH, JSON.stringify(entries, null, 2));
}

export function logActivity(entry: Omit<ActivityEntry, "id" | "timestamp">) {
  const entries = read();
  entries.push({
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  });
  // FIFO cap
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }
  write(entries);
}

export function getActivities(filters?: {
  app?: string;
  email?: string;
  limit?: number;
}): ActivityEntry[] {
  let entries = read();

  if (filters?.app) {
    entries = entries.filter((e) => e.app === filters.app);
  }
  if (filters?.email) {
    entries = entries.filter((e) => e.email === filters.email);
  }

  // Most recent first
  entries.reverse();

  if (filters?.limit) {
    entries = entries.slice(0, filters.limit);
  }

  return entries;
}
