"use client";

import { useCallback, useEffect, useState } from "react";
import { getAppConfig } from "@/lib/apps";

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

  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-fade-up mb-8">
          <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">Admin</h1>
          <p className="text-[13px] text-text-muted">All connections across all users</p>
        </div>

        {/* Summary cards */}
        <div className="animate-fade-up-delay-1 grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: connections.length, color: "text-text-primary" },
            { label: "Active", value: active, color: "text-accent" },
            { label: "Pending", value: pending, color: "text-warning" },
            { label: "Failed", value: failed, color: "text-danger" },
          ].map((card) => (
            <div key={card.label} className="bg-surface-raised border border-border-subtle rounded-xl p-4">
              <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{card.label}</p>
              <p className={`text-[24px] font-semibold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="animate-fade-up-delay-2 card-glow bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-16 text-text-muted text-[13px]">No connections found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-hover/30">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">App</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-secondary uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((conn) => {
                    const appConfig = getAppConfig(conn.app);
                    const userEmail = conn.metadata?.email as string | undefined;
                    const userPicture = conn.metadata?.picture as string | undefined;

                    return (
                      <tr key={conn.connection_id} className="sheet-row border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {userPicture ? (
                              <img src={userPicture} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-surface-hover border border-border-subtle flex items-center justify-center text-[10px] text-text-muted">?</div>
                            )}
                            <span className="text-text-primary font-mono text-[12px]">{userEmail ?? conn.connection_id.slice(0, 12)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-text-primary">{appConfig?.name ?? conn.app}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            conn.status === "ACTIVE"
                              ? "text-accent bg-accent/10"
                              : conn.status === "PENDING"
                              ? "text-warning bg-warning/10"
                              : "text-danger bg-danger/10"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              conn.status === "ACTIVE" ? "bg-accent" : conn.status === "PENDING" ? "bg-warning" : "bg-danger"
                            }`} />
                            {conn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-[12px]">{conn.method ?? "—"}</td>
                        <td className="px-4 py-3 text-text-muted text-[12px] font-mono">
                          {new Date(conn.creation_time).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(conn.connection_id)}
                            disabled={deleting === conn.connection_id}
                            className="text-[11px] text-text-muted hover:text-danger font-medium transition-colors disabled:opacity-50"
                          >
                            {deleting === conn.connection_id ? "..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-2 bg-surface-hover/20 border-t border-border-subtle">
            <span className="text-[11px] text-text-muted">Auto-refreshes every 10s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
