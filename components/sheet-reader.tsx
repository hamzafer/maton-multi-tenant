"use client";

import { useState } from "react";

export default function SheetReader({ email }: { email: string }) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [range, setRange] = useState("Sheet1!A1:D10");
  const [data, setData] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRead() {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams({ email, spreadsheetId, range });
      const res = await fetch(`/api/maton/sheets?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.values ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read sheet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Spreadsheet ID</label>
          <input
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="1BxiMVs0XRA5nFMd..."
            className="w-full px-3 py-2 bg-surface border border-border-default rounded-lg text-[13px] font-mono text-text-primary placeholder-text-muted"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Range</label>
          <input
            type="text"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="Sheet1!A1:D10"
            className="w-full px-3 py-2 bg-surface border border-border-default rounded-lg text-[13px] font-mono text-text-primary placeholder-text-muted"
          />
        </div>
      </div>

      <button
        onClick={handleRead}
        disabled={!spreadsheetId || loading}
        className="inline-flex items-center gap-2 bg-accent text-surface font-semibold text-[12px] py-2 px-4 rounded-lg hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-40"
      >
        {loading ? "Fetching..." : "Fetch Data"}
      </button>

      {error && <p className="text-danger text-[13px]">{error}</p>}

      {data && data.length > 0 && (
        <div className="rounded-xl border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-hover/50">
                  {data[0].map((cell, j) => (
                    <th key={j} className="px-3 py-2 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row, i) => (
                  <tr key={i} className="sheet-row border-b border-border-subtle last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-text-primary font-mono text-[12px]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 bg-surface-hover/30 border-t border-border-subtle">
            <span className="text-[11px] text-text-muted">{data.length - 1} rows &middot; {data[0]?.length ?? 0} columns</span>
          </div>
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-text-muted text-[13px]">No data found in this range.</p>
      )}
    </div>
  );
}
