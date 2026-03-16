"use client";

import { useCallback, useEffect, useState } from "react";
import { getAppConfig } from "@/lib/apps";
import EmptyState from "@/components/empty-state";
import { AdminSkeleton } from "@/components/skeleton";

interface Connection {
  connection_id: string;
  status: string;
  app: string;
  creation_time: string;
  last_updated_time: string;
  metadata: Record<string, unknown>;
  method?: string;
}

export default function AdminPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/maton/admin/connections");
      const data = await res.json();
      if (data.connections) setConnections(data.connections);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 10000);
    return () => clearInterval(interval);
  }, [fetchConnections]);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch("/api/maton/admin/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: id }),
      });
      setConnections((prev) => prev.filter((c) => c.connection_id !== id));
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  }

  const active = connections.filter((c) => c.status === "ACTIVE").length;
  const pending = connections.filter((c) => c.status === "PENDING").length;
  const failed = connections.filter((c) => c.status === "FAILED").length;

  const summaryCards = [
    { label: "Total", value: connections.length, color: "text-text-primary", accent: "rgba(255,255,255,0.06)" },
    { label: "Active", value: active, color: "text-accent", accent: "rgba(52,211,153,0.08)" },
    { label: "Pending", value: pending, color: "text-warning", accent: "rgba(251,191,36,0.08)" },
    { label: "Failed", value: failed, color: "text-danger", accent: "rgba(248,113,113,0.08)" },
  ];

  return (
    <div className="min-h-screen bg-grid">
      <div className="bg-mesh" />
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="animate-fade-up mb-8">
          <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">Admin</h1>
          <p className="text-[13px] text-text-muted">All connections across all users</p>
        </div>

        {loading ? (
          <AdminSkeleton />
        ) : (
        <>
        {/* Summary cards */}
        <div className="animate-fade-up-delay-1 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="glass-card rounded-xl p-4"
              style={{ borderColor: card.accent }}
            >
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">{card.label}</p>
              <p className={`text-[28px] font-bold tracking-tight ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="animate-fade-up-delay-2 glass-card rounded-2xl overflow-hidden">
          {/* Table header bar */}
          <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent/50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.879" />
              </svg>
              <span className="text-[11px] text-text-secondary font-medium">Connections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-[10px] text-text-muted">Live</span>
            </div>
          </div>

          {connections.length === 0 ? (
            <EmptyState variant="connections" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">User</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">App</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Status</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Method</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Created</th>
                    <th className="px-4 py-2.5 text-right bg-[rgba(255,255,255,0.015)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((conn) => {
                    const appConfig = getAppConfig(conn.app);
                    const userEmail = conn.metadata?.email as string | undefined;
                    const userPicture = conn.metadata?.picture as string | undefined;

                    return (
                      <tr key={conn.connection_id} className="sheet-row border-b border-[rgba(255,255,255,0.03)] last:border-0 group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {userPicture ? (
                              <img src={userPicture} alt="" className="w-7 h-7 rounded-full ring-1 ring-[rgba(255,255,255,0.08)]" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.05)] ring-1 ring-[rgba(255,255,255,0.06)] flex items-center justify-center text-[10px] text-text-muted font-medium">?</div>
                            )}
                            <span className="text-text-primary font-mono text-[12px]">{userEmail ?? conn.connection_id.slice(0, 12)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {appConfig && (
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{ backgroundColor: `${appConfig.color}12` }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill={appConfig.color} opacity={0.7}>
                                  <path d={appConfig.icon} />
                                </svg>
                              </div>
                            )}
                            <span className="text-text-primary text-[12px]">{appConfig?.name ?? conn.app}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            conn.status === "ACTIVE"
                              ? "text-accent bg-accent/8"
                              : conn.status === "PENDING"
                              ? "text-warning bg-warning/8"
                              : "text-danger bg-danger/8"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              conn.status === "ACTIVE" ? "bg-accent" : conn.status === "PENDING" ? "bg-warning animate-pulse" : "bg-danger"
                            }`} />
                            {conn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-[11px] font-mono">{conn.method ?? "—"}</td>
                        <td className="px-4 py-3 text-text-muted text-[11px] font-mono">
                          {new Date(conn.creation_time).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(conn.connection_id)}
                            disabled={deleting === conn.connection_id}
                            className="text-[11px] text-transparent group-hover:text-text-muted hover:!text-danger font-medium transition-all duration-200 disabled:opacity-50"
                          >
                            {deleting === conn.connection_id ? (
                              <div className="w-3 h-3 border border-danger/50 border-t-danger rounded-full animate-spin" />
                            ) : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.03)] flex items-center justify-between">
            <span className="text-[10px] text-text-muted">{connections.length} connections</span>
            <span className="text-[10px] text-text-muted">Refreshes every 10s</span>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
