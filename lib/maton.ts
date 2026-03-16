const CTRL_BASE = "https://ctrl.maton.ai";
const GATEWAY_BASE = "https://gateway.maton.ai";

function getApiKey(): string {
  const key = process.env.MATON_API_KEY;
  if (!key) throw new Error("MATON_API_KEY environment variable is not set");
  return key;
}

async function matonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Maton API error (${res.status}): ${body}`);
  }
  return res.json();
}

export interface FetchWithMetaResult {
  data: unknown;
  statusCode: number;
  responseTimeMs: number;
}

export async function matonFetchWithMeta(
  url: string,
  init?: RequestInit
): Promise<FetchWithMetaResult> {
  const start = Date.now();
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const responseTimeMs = Date.now() - start;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = typeof data === "object" && data ? JSON.stringify(data) : String(data);
    throw Object.assign(new Error(`Maton API error (${res.status}): ${msg}`), {
      statusCode: res.status,
      responseTimeMs,
    });
  }
  return { data, statusCode: res.status, responseTimeMs };
}

export interface MatonConnection {
  connection_id: string;
  status: "PENDING" | "ACTIVE" | "FAILED";
  creation_time: string;
  last_updated_time: string;
  url?: string;
  app: string;
  metadata: Record<string, unknown>;
  method?: string;
}

export async function createConnection(app: string): Promise<MatonConnection> {
  const { connection_id } = await matonFetch(`${CTRL_BASE}/connections`, {
    method: "POST",
    body: JSON.stringify({ app }),
  });
  return getConnection(connection_id);
}

export async function getConnection(id: string): Promise<MatonConnection> {
  const data = await matonFetch(`${CTRL_BASE}/connections/${id}`);
  return data.connection;
}

export async function listConnections(app?: string, status?: string): Promise<MatonConnection[]> {
  const params = new URLSearchParams();
  if (app) params.set("app", app);
  if (status) params.set("status", status);
  const qs = params.toString();
  const data = await matonFetch(`${CTRL_BASE}/connections${qs ? `?${qs}` : ""}`);
  return data.connections ?? [];
}

export async function deleteConnectionById(id: string): Promise<void> {
  await matonFetch(`${CTRL_BASE}/connections/${id}`, { method: "DELETE" });
}

export function gatewayUrl(app: string, path: string): string {
  return `${GATEWAY_BASE}/${app}/${path.replace(/^\//, "")}`;
}
