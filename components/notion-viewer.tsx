"use client";

import { useState } from "react";

interface NotionDb {
  id: string;
  title?: { plain_text: string }[];
  icon?: { emoji?: string };
  last_edited_time?: string;
}

export default function NotionViewer({ email }: { email: string }) {
  const [databases, setDatabases] = useState<NotionDb[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  async function handleFetch() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/maton/gateway/notion?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDatabases(data.results ?? []);
      setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!fetched && (
        <button
          onClick={handleFetch}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-accent text-surface font-semibold text-[12px] py-2 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
        >
          {loading ? "Fetching..." : "List Databases"}
        </button>
      )}
      {error && <p className="text-danger text-[13px] mt-2">{error}</p>}
      {fetched && databases.length === 0 && <p className="text-text-muted text-[13px]">No databases found.</p>}
      {databases.length > 0 && (
        <div className="space-y-2">
          {databases.map((db) => (
            <div key={db.id} className="flex items-center gap-3 p-3 bg-surface border border-border-subtle rounded-lg">
              <span className="text-lg">{db.icon?.emoji ?? "📋"}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">
                  {db.title?.[0]?.plain_text ?? "Untitled"}
                </p>
                <p className="text-[11px] text-text-muted font-mono">{db.id.slice(0, 8)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
