import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = process.env.VERCEL ? "/tmp" : join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "users.json");

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

// Migrate old flat shape to new nested shape
function migrate(raw: Record<string, unknown>): Store {
  const store: Store = {};
  let needsWrite = false;

  for (const [email, value] of Object.entries(raw)) {
    const v = value as Record<string, unknown>;
    if (v.connectionId && typeof v.connectionId === "string") {
      // Old shape: { connectionId, status, app, oauthUrl? }
      const app = (v.app as string) || "google-sheets";
      store[email] = {
        connections: {
          [app]: {
            connectionId: v.connectionId as string,
            status: (v.status as string) || "PENDING",
            app,
            oauthUrl: v.oauthUrl as string | undefined,
          },
        },
      };
      needsWrite = true;
    } else if (v.connections) {
      // Already new shape
      store[email] = v as unknown as UserRecord;
    }
  }

  if (needsWrite) write(store);
  return store;
}

function read(): Store {
  if (!existsSync(STORE_PATH)) return {};
  const raw = JSON.parse(readFileSync(STORE_PATH, "utf-8"));
  return migrate(raw);
}

function write(store: Store) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function getUserConnections(email: string): Record<string, ConnectionRecord> | null {
  const user = read()[email];
  return user?.connections ?? null;
}

export function getConnection(email: string, app: string): ConnectionRecord | null {
  const connections = getUserConnections(email);
  return connections?.[app] ?? null;
}

export function saveConnection(email: string, app: string, record: ConnectionRecord) {
  const store = read();
  if (!store[email]) store[email] = { connections: {} };
  store[email].connections[app] = record;
  write(store);
}

export function deleteConnection(email: string, app: string) {
  const store = read();
  if (store[email]?.connections) {
    delete store[email].connections[app];
    if (Object.keys(store[email].connections).length === 0) {
      delete store[email];
    }
  }
  write(store);
}

export function getAllUsers(): Store {
  return read();
}
