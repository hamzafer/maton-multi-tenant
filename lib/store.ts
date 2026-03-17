import { put, get } from "@vercel/blob";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_KEY = "users.json";
const LOCAL_PATH = join(process.cwd(), "data", "users.json");

export interface ConnectionRecord {
  connectionId: string;
  status: string;
  app: string;
  oauthUrl?: string;
}

export interface UserRecord {
  connections: Record<string, ConnectionRecord>;
}

type Store = Record<string, UserRecord>;

async function read(): Promise<Store> {
  if (useBlob) {
    try {
      const result = await get(BLOB_KEY, { access: "private" });
      if (!result || result.statusCode !== 200) return {};
      const text = await new Response(result.stream).text();
      return JSON.parse(text);
    } catch {
      return {};
    }
  }
  if (!existsSync(LOCAL_PATH)) return {};
  return JSON.parse(readFileSync(LOCAL_PATH, "utf-8"));
}

async function write(store: Store): Promise<void> {
  if (useBlob) {
    await put(BLOB_KEY, JSON.stringify(store, null, 2), {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
    return;
  }
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(LOCAL_PATH, JSON.stringify(store, null, 2));
}

export async function getUserConnections(email: string): Promise<Record<string, ConnectionRecord> | null> {
  const user = (await read())[email];
  return user?.connections ?? null;
}

export async function getConnection(email: string, app: string): Promise<ConnectionRecord | null> {
  const connections = await getUserConnections(email);
  return connections?.[app] ?? null;
}

export async function saveConnection(email: string, app: string, record: ConnectionRecord): Promise<void> {
  const store = await read();
  if (!store[email]) store[email] = { connections: {} };
  store[email].connections[app] = record;
  await write(store);
}

export async function deleteConnection(email: string, app: string): Promise<void> {
  const store = await read();
  if (store[email]?.connections) {
    delete store[email].connections[app];
    if (Object.keys(store[email].connections).length === 0) {
      delete store[email];
    }
  }
  await write(store);
}

export async function deleteConnectionById(connectionId: string): Promise<void> {
  const store = await read();
  for (const email of Object.keys(store)) {
    for (const app of Object.keys(store[email].connections)) {
      if (store[email].connections[app].connectionId === connectionId) {
        delete store[email].connections[app];
        if (Object.keys(store[email].connections).length === 0) {
          delete store[email];
        }
        await write(store);
        return;
      }
    }
  }
}

export async function getAllUsers(): Promise<Store> {
  return read();
}
