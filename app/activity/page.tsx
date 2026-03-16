"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/empty-state";
import { ActivitySkeleton } from "@/components/skeleton";

interface ActivityEntry {
  id: string;
  timestamp: string;
  email: string;
  app: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterApp, setFilterApp] = useState("");

  const fetchActivity = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterApp) params.set("app", filterApp);
      params.set("limit", "100");
      const res = await fetch(`/api/maton/activity?${params}`);
      const data = await res.json();
      setEntries(data.activities ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterApp]);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  const maxTime = Math.max(...entries.map((e) => e.responseTimeMs), 1);
  const apps = [...new Set(entries.map((e) => e.app))];

  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-fade-up flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">Activity Log</h1>
            <p className="text-[13px] text-text-muted">Gateway API calls tracked in real-time</p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterApp("")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                !filterApp ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              All
            </button>
            {apps.map((app) => (
              <button
                key={app}
                onClick={() => setFilterApp(app === filterApp ? "" : app)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  filterApp === app ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {app}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <ActivitySkeleton />
        ) : (
        <>
        {/* Response time chart */}
        {entries.length > 0 && (
          <div className="animate-fade-up-delay-1 bg-surface-raised border border-border-subtle rounded-2xl p-4 mb-6">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-3">Response Time (ms)</p>
            <div className="flex items-end gap-[2px] h-16">
              {entries.slice(0, 50).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex-1 min-w-[3px] rounded-t-sm transition-all hover:opacity-80"
                  style={{
                    height: `${Math.max((entry.responseTimeMs / maxTime) * 100, 4)}%`,
                    backgroundColor: entry.statusCode >= 400 ? "#f87171" : "#34d399",
                    opacity: 0.7,
                  }}
                  title={`${entry.app} — ${entry.responseTimeMs}ms`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-muted">Older</span>
              <span className="text-[10px] text-text-muted">Recent</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="animate-fade-up-delay-2 glass-card rounded-2xl overflow-hidden">
          {entries.length === 0 ? (
            <EmptyState variant="activity" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-hover/30">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">App</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Endpoint</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="sheet-row border-b border-border-subtle last:border-0">
                      <td className="px-4 py-2.5 text-text-muted font-mono text-[11px] whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2.5 text-text-primary text-[12px]">{entry.app}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-mono font-medium ${
                          entry.method === "GET" ? "text-accent" : entry.method === "POST" ? "text-warning" : "text-text-secondary"
                        }`}>
                          {entry.method}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary font-mono text-[11px] max-w-[300px] truncate">{entry.endpoint}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-[11px] font-mono font-medium ${
                          entry.statusCode >= 400 ? "text-danger" : "text-accent"
                        }`}>
                          {entry.statusCode}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-text-muted font-mono text-[11px]">{entry.responseTimeMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-2 bg-surface-hover/20 border-t border-border-subtle">
            <span className="text-[11px] text-text-muted">{entries.length} entries &middot; Auto-refreshes every 5s</span>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
