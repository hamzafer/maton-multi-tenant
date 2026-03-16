"use client";

import { useState } from "react";
import EmptyState from "@/components/empty-state";

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
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to read sheet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Spreadsheet ID</label>
          <input
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="1BxiMVs0XRA5nFMd..."
            className="w-full px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border border-border-subtle rounded-xl text-[13px] font-mono text-text-primary placeholder-text-muted transition-all duration-300"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-text-secondary mb-1.5 uppercase tracking-wider">Range</label>
          <input
            type="text"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="Sheet1!A1:D10"
            className="w-full px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border border-border-subtle rounded-xl text-[13px] font-mono text-text-primary placeholder-text-muted transition-all duration-300"
          />
        </div>
      </div>

      <button
        onClick={handleRead}
        disabled={!spreadsheetId || loading}
        className="inline-flex items-center gap-2 bg-accent text-surface font-semibold text-[12px] py-2.5 px-5 rounded-xl btn-press hover:brightness-110 transition-all disabled:opacity-40"
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
            Fetching...
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Fetch Data
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-danger-dim/15 border border-danger/15 text-danger text-[12px] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {data && data.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-up">
          {/* Table header bar */}
          <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent/60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625" />
              </svg>
              <span className="text-[11px] text-text-secondary font-medium">Results</span>
            </div>
            <span className="text-[10px] text-text-muted font-mono">
              {data.length - 1} rows &middot; {data[0]?.length ?? 0} cols
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  {data[0].map((cell, j) => (
                    <th key={j} className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.02)]">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row, i) => (
                  <tr
                    key={i}
                    className="sheet-row border-b border-[rgba(255,255,255,0.03)] last:border-0"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2.5 text-text-primary font-mono text-[12px]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.length === 0 && (
        <EmptyState variant="data" />
      )}
    </div>
  );
}
