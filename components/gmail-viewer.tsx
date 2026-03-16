"use client";

import { useState } from "react";

interface GmailMessage {
  id: string;
  snippet: string;
  payload?: {
    headers?: { name: string; value: string }[];
  };
}

export default function GmailViewer({ email }: { email: string }) {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  async function handleFetch() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/maton/gateway/gmail?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(data.messages ?? []);
      setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  function getHeader(msg: GmailMessage, name: string): string {
    return msg.payload?.headers?.find((h) => h.name === name)?.value ?? "";
  }

  return (
    <div>
      {!fetched && (
        <button
          onClick={handleFetch}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-accent text-surface font-semibold text-[12px] py-2 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
        >
          {loading ? "Fetching..." : "Fetch Recent Emails"}
        </button>
      )}
      {error && <p className="text-danger text-[13px] mt-2">{error}</p>}
      {fetched && messages.length === 0 && <p className="text-text-muted text-[13px]">No emails found.</p>}
      {messages.length > 0 && (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="p-3 bg-surface border border-border-subtle rounded-lg">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[13px] font-medium text-text-primary truncate">{getHeader(msg, "Subject") || "(No subject)"}</p>
                <span className="text-[10px] text-text-muted whitespace-nowrap">{getHeader(msg, "Date").split(",")[0]}</span>
              </div>
              <p className="text-[11px] text-text-muted truncate">{getHeader(msg, "From")}</p>
              <p className="text-[12px] text-text-secondary mt-1 line-clamp-2">{msg.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
