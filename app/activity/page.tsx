"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/empty-state";
import { ActivitySkeleton } from "@/components/skeleton";
import Reveal from "@/components/reveal";

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

// Mini sparkline bar component
function SparkBars({ values, max, color }: { values: number[]; max: number; color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-10">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 min-w-[2px] rounded-t-[1px] transition-all duration-500"
          style={{
            height: `${Math.max((v / max) * 100, 3)}%`,
            backgroundColor: color,
            opacity: 0.3 + (i / values.length) * 0.7,
          }}
        />
      ))}
    </div>
  );
}

// Circular progress ring
function ProgressRing({ value, size = 44, strokeWidth = 3, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// Horizontal distribution bar
function DistributionBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.03)]">
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div
            key={i}
            className="h-full transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>
      <div className="flex items-center gap-4">
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-text-muted">{seg.label}</span>
            <span className="text-[10px] font-mono text-text-secondary">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
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

  // Compute analytics
  const analytics = useMemo(() => {
    if (entries.length === 0) return null;

    const totalCalls = entries.length;
    const avgResponseTime = Math.round(entries.reduce((s, e) => s + e.responseTimeMs, 0) / totalCalls);
    const p95Index = Math.floor(totalCalls * 0.95);
    const sortedTimes = [...entries].sort((a, b) => a.responseTimeMs - b.responseTimeMs);
    const p95 = sortedTimes[Math.min(p95Index, totalCalls - 1)]?.responseTimeMs ?? 0;
    const successCount = entries.filter((e) => e.statusCode < 400).length;
    const successRate = Math.round((successCount / totalCalls) * 100);
    const errorCount = totalCalls - successCount;

    const gets = entries.filter((e) => e.method === "GET").length;
    const posts = entries.filter((e) => e.method === "POST").length;
    const others = totalCalls - gets - posts;

    // App breakdown
    const appCounts: Record<string, number> = {};
    entries.forEach((e) => {
      appCounts[e.app] = (appCounts[e.app] || 0) + 1;
    });
    const appBreakdown = Object.entries(appCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([app, count]) => ({ app, count, pct: Math.round((count / totalCalls) * 100) }));

    // Response time trend (last 30 entries, reversed to chronological)
    const responseTrend = entries.slice(0, 30).reverse().map((e) => e.responseTimeMs);
    const maxResponseTime = Math.max(...responseTrend, 1);

    // Fastest / slowest
    const fastest = Math.min(...entries.map((e) => e.responseTimeMs));
    const slowest = Math.max(...entries.map((e) => e.responseTimeMs));

    return {
      totalCalls, avgResponseTime, p95, successRate, successCount, errorCount,
      gets, posts, others,
      appBreakdown, responseTrend, maxResponseTime, fastest, slowest,
    };
  }, [entries]);

  const apps = useMemo(() => [...new Set(entries.map((e) => e.app))], [entries]);

  const appColors: Record<string, string> = {
    "google-sheets": "#34A853",
    "slack": "#E01E5A",
    "google-mail": "#EA4335",
    "notion": "#FFFFFF",
    "github": "#FFFFFF",
  };

  return (
    <div className="min-h-screen bg-grid">
      <div className="bg-mesh" />
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="animate-fade-up flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">Activity</h1>
              {entries.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/8 border border-accent/15">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  <span className="text-[10px] text-accent font-medium">Live</span>
                </div>
              )}
            </div>
            <p className="text-[13px] text-text-muted">API gateway performance & analytics</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.03)] border border-border-subtle rounded-xl p-1">
            <button
              onClick={() => setFilterApp("")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                !filterApp ? "bg-accent/12 text-accent shadow-[0_0_12px_rgba(52,211,153,0.08)]" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              All
            </button>
            {apps.map((app) => (
              <button
                key={app}
                onClick={() => setFilterApp(app === filterApp ? "" : app)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                  filterApp === app ? "bg-accent/12 text-accent shadow-[0_0_12px_rgba(52,211,153,0.08)]" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {app.replace("google-", "").replace(/^\w/, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <ActivitySkeleton />
        ) : entries.length === 0 ? (
          <EmptyState variant="activity" />
        ) : analytics && (
          <>
            {/* Analytics Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {/* Total Calls */}
              <Reveal delay={0} direction="up"><div className="glass-card rounded-2xl p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5">Total Calls</p>
                    <p className="text-[32px] font-bold tracking-tight text-text-primary leading-none">{analytics.totalCalls}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-accent/8 border border-accent/15 flex items-center justify-center group-hover:bg-accent/12 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                </div>
                <DistributionBar segments={[
                  { label: "GET", value: analytics.gets, color: "#34d399" },
                  { label: "POST", value: analytics.posts, color: "#fbbf24" },
                  ...(analytics.others > 0 ? [{ label: "Other", value: analytics.others, color: "#9494a8" }] : []),
                ]} />
              </div></Reveal>

              {/* Avg Response Time */}
              <Reveal delay={100} direction="up"><div className="glass-card rounded-2xl p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5">Avg Response</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-[32px] font-bold tracking-tight text-text-primary leading-none">{analytics.avgResponseTime}</p>
                      <span className="text-[12px] text-text-muted font-mono">ms</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center group-hover:bg-[rgba(6,182,212,0.12)] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-[#06b6d4]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <div>
                    <span className="text-text-muted">p95 </span>
                    <span className="font-mono text-text-secondary">{analytics.p95}ms</span>
                  </div>
                  <div className="w-px h-3 bg-border-subtle" />
                  <div>
                    <span className="text-text-muted">min </span>
                    <span className="font-mono text-accent">{analytics.fastest}ms</span>
                  </div>
                  <div className="w-px h-3 bg-border-subtle" />
                  <div>
                    <span className="text-text-muted">max </span>
                    <span className="font-mono text-danger">{analytics.slowest}ms</span>
                  </div>
                </div>
              </div></Reveal>

              {/* Success Rate */}
              <Reveal delay={200} direction="up"><div className="glass-card rounded-2xl p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5">Success Rate</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-[32px] font-bold tracking-tight text-text-primary leading-none">{analytics.successRate}</p>
                      <span className="text-[14px] text-text-muted">%</span>
                    </div>
                  </div>
                  <ProgressRing
                    value={analytics.successRate}
                    color={analytics.successRate >= 95 ? "#34d399" : analytics.successRate >= 80 ? "#fbbf24" : "#f87171"}
                  />
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-text-muted">OK</span>
                    <span className="font-mono text-text-secondary">{analytics.successCount}</span>
                  </div>
                  {analytics.errorCount > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                      <span className="text-text-muted">Err</span>
                      <span className="font-mono text-danger">{analytics.errorCount}</span>
                    </div>
                  )}
                </div>
              </div></Reveal>

              {/* App Breakdown */}
              <Reveal delay={300} direction="up"><div className="glass-card rounded-2xl p-5 group">
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-3">By Service</p>
                <div className="space-y-2.5">
                  {analytics.appBreakdown.slice(0, 4).map((item) => (
                    <div key={item.app} className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: appColors[item.app] ?? "#9494a8" }}
                      />
                      <span className="text-[11px] text-text-secondary flex-1 truncate">
                        {item.app.replace("google-", "G.")}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${item.pct}%`,
                              backgroundColor: appColors[item.app] ?? "#9494a8",
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-text-muted w-8 text-right">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div></Reveal>
            </div>

            {/* Response Time Timeline */}
            <Reveal delay={100}><div className="glass-card rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent/50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <span className="text-[12px] text-text-secondary font-medium">Response Time Timeline</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">Last {analytics.responseTrend.length} requests</span>
              </div>

              {/* Chart */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-text-muted w-10 text-right">
                        {Math.round(analytics.maxResponseTime * (1 - i / 3))}
                      </span>
                      <div className="flex-1 h-px bg-[rgba(255,255,255,0.03)]" />
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="flex items-end gap-[3px] h-28 pl-12">
                  {entries.slice(0, 50).reverse().map((entry, i) => {
                    const heightPx = Math.max((entry.responseTimeMs / analytics.maxResponseTime) * 112, 2); // 112px = h-28
                    const isError = entry.statusCode >= 400;
                    return (
                      <div key={entry.id} className="flex-1 min-w-[3px] group/bar relative h-full">
                        <div
                          className="w-full rounded-t-sm transition-all duration-300 hover:brightness-125 cursor-default absolute bottom-0"
                          style={{
                            height: `${heightPx}px`,
                            background: isError
                              ? "linear-gradient(to top, rgba(248,113,113,0.5), rgba(248,113,113,0.8))"
                              : `linear-gradient(to top, rgba(52,211,153,${0.2 + (i / 50) * 0.3}), rgba(52,211,153,${0.4 + (i / 50) * 0.5}))`,
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-20">
                          <div className="bg-[#1a1a22] border border-border-subtle rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                            <p className="text-[10px] font-mono text-text-primary">{entry.responseTimeMs}ms</p>
                            <p className="text-[9px] text-text-muted">{entry.app} &middot; {entry.statusCode}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-2 pl-12">
                  <span className="text-[9px] text-text-muted font-mono">older</span>
                  <span className="text-[9px] text-text-muted font-mono">recent</span>
                </div>
              </div>
            </div></Reveal>

            {/* Request Log Table */}
            <Reveal delay={200}><div className="glass-card rounded-2xl overflow-hidden">
              {/* Table header bar */}
              <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent/50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-[12px] text-text-secondary font-medium">Request Log</span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">{entries.length} entries</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.04)]">
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Time</th>
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Service</th>
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Method</th>
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Endpoint</th>
                      <th className="px-5 py-2.5 text-center text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Status</th>
                      <th className="px-5 py-2.5 text-right text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-[rgba(255,255,255,0.015)]">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => {
                      const isError = entry.statusCode >= 400;
                      const latencyColor = entry.responseTimeMs < 500 ? "text-accent" : entry.responseTimeMs < 1500 ? "text-warning" : "text-danger";
                      return (
                        <tr
                          key={entry.id}
                          className="sheet-row border-b border-[rgba(255,255,255,0.03)] last:border-0 group"
                          style={{ animationDelay: `${i * 20}ms` }}
                        >
                          <td className="px-5 py-3 text-text-muted font-mono text-[11px] whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: appColors[entry.app] ?? "#9494a8" }}
                              />
                              <span className="text-text-primary text-[12px]">
                                {entry.app.replace("google-", "G.")}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              entry.method === "GET"
                                ? "text-accent bg-accent/8"
                                : entry.method === "POST"
                                ? "text-warning bg-warning/8"
                                : "text-text-secondary bg-[rgba(255,255,255,0.04)]"
                            }`}>
                              {entry.method}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-text-secondary font-mono text-[11px] max-w-[280px] truncate">
                            {entry.endpoint}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                              isError ? "text-danger bg-danger/8" : "text-accent bg-accent/6"
                            }`}>
                              {!isError && <span className="w-1 h-1 rounded-full bg-accent" />}
                              {isError && <span className="w-1 h-1 rounded-full bg-danger" />}
                              {entry.statusCode}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Mini latency bar */}
                              <div className="w-12 h-1 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden hidden sm:block">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min((entry.responseTimeMs / (analytics.maxResponseTime || 1)) * 100, 100)}%`,
                                    backgroundColor: entry.responseTimeMs < 500 ? "#34d399" : entry.responseTimeMs < 1500 ? "#fbbf24" : "#f87171",
                                    opacity: 0.6,
                                  }}
                                />
                              </div>
                              <span className={`font-mono text-[11px] font-medium ${latencyColor}`}>
                                {entry.responseTimeMs}ms
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-2.5 border-t border-[rgba(255,255,255,0.03)] flex items-center justify-between">
                <span className="text-[10px] text-text-muted">{entries.length} entries</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  <span className="text-[10px] text-text-muted">Refreshes every 5s</span>
                </div>
              </div>
            </div></Reveal>
          </>
        )}
      </div>
    </div>
  );
}
