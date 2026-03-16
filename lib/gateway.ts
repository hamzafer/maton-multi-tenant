import { matonFetchWithMeta, gatewayUrl, type FetchWithMetaResult } from "./maton";
import { logActivity } from "./activity-store";

interface GatewayCallOptions {
  email: string;
  app: string;
  connectionId: string;
  path: string;
  method?: string;
  body?: unknown;
  extraHeaders?: Record<string, string>;
}

export async function gatewayCall(opts: GatewayCallOptions): Promise<FetchWithMetaResult> {
  const { email, app, connectionId, path, method = "GET", body, extraHeaders } = opts;
  const url = gatewayUrl(app, path);

  const result = await matonFetchWithMeta(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Maton-Connection": connectionId,
      ...extraHeaders,
    },
  });

  logActivity({
    email,
    app,
    endpoint: path,
    method,
    statusCode: result.statusCode,
    responseTimeMs: result.responseTimeMs,
  });

  return result;
}
