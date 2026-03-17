"use client";

import { type AppConfig } from "@/lib/apps";
import { playClick, playHover } from "@/lib/sounds";

interface Props {
  app: AppConfig;
  status: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSelect: () => void;
  selected: boolean;
  loading: boolean;
}

export default function AppCard({ app, status, onConnect, onDisconnect, onSelect, selected, loading }: Props) {
  const isConnected = status === "ACTIVE";
  const isPending = status === "PENDING";

  return (
    <div
      onClick={() => { if (isConnected) { playClick(); onSelect(); } }}
      onMouseEnter={playHover}
      className={`app-card relative group border rounded-xl p-4 transition-all duration-300 ${
        selected
          ? "border-accent/30 bg-accent/5 shadow-[0_0_30px_rgba(52,211,153,0.08)] -translate-y-0.5"
          : isConnected
          ? "border-border-default bg-surface-raised cursor-pointer"
          : "border-border-subtle bg-surface-raised"
      }`}
    >
      {/* Hover glow — colored by app */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 4px 30px ${app.color}08, 0 0 60px ${app.color}04`,
        }}
      />

      {/* App icon */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${app.color}15`, border: `1px solid ${app.color}25` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={app.color} className="opacity-90">
            <path d={app.icon} />
          </svg>
        </div>

        {isConnected && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            Active
          </span>
        )}
        {isPending && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />
            Pending
          </span>
        )}
      </div>

      <h3 className="text-[14px] font-semibold text-text-primary mb-0.5 transition-colors duration-300 group-hover:text-white">{app.name}</h3>
      <p className="text-[11px] text-text-muted mb-3">{app.description}</p>

      {!isConnected && !isPending && (
        <button
          onClick={(e) => { e.stopPropagation(); playClick(); onConnect(); }}
          disabled={loading}
          className="w-full text-[12px] font-medium py-1.5 rounded-lg border border-border-default text-text-secondary hover:text-text-primary hover:border-border-default hover:bg-surface-hover btn-press transition-all disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
      )}
      {isConnected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDisconnect(); }}
          className="w-full text-[12px] font-medium py-1.5 rounded-lg border border-transparent text-text-muted hover:text-danger hover:border-danger/20 hover:bg-danger-dim/10 transition-all"
        >
          Disconnect
        </button>
      )}
      {isPending && (
        <div className="text-[11px] text-warning/70 text-center">Waiting for OAuth...</div>
      )}
    </div>
  );
}
