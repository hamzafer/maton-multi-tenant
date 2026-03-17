"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { APP_CONFIGS } from "@/lib/apps";
import AppCard from "@/components/app-card";
import ConnectionStatus from "@/components/connection-status";
import SheetReader from "@/components/sheet-reader";
import SlackSender from "@/components/slack-sender";
import GmailViewer from "@/components/gmail-viewer";
import NotionViewer from "@/components/notion-viewer";
import GithubViewer from "@/components/github-viewer";
import EmptyState from "@/components/empty-state";
import { DashboardSkeleton } from "@/components/skeleton";
import OrbitalSpinner from "@/components/orbital-spinner";
import { useConfetti } from "@/components/confetti";
import { useToast } from "@/components/toast";
import ScrambleText from "@/components/scramble-text";

// --- "Connect the APIs" mini game ---
const GAME_NODES = [
  { id: "sheets", label: "Sheets", color: "#34A853", x: 50, y: 15, icon: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" },
  { id: "slack", label: "Slack", color: "#E01E5A", x: 85, y: 40, icon: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" },
  { id: "gmail", label: "Gmail", color: "#EA4335", x: 70, y: 75, icon: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
  { id: "notion", label: "Notion", color: "#EEEEEE", x: 30, y: 75, icon: "M4 4.5A2.5 2.5 0 016.5 2H18a2 2 0 012 2v16a2 2 0 01-2 2H6.5A2.5 2.5 0 014 19.5v-15zM8 7h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" },
  { id: "github", label: "GitHub", color: "#FFFFFF", x: 15, y: 40, icon: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" },
];

function ConnectTheAPIsGame() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [connections, setConnections] = useState<[string, string][]>([]);
  const [gameEmail, setGameEmail] = useState("");
  const [complete, setComplete] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const gameConfetti = useConfetti();

  const totalPossible = 10; // C(5,2)
  const progress = Math.min(connections.length / 3, 1); // unlock at 3

  function handleNodeClick(id: string) {
    if (complete) return;

    if (!selected) {
      setSelected(id);
      return;
    }

    if (selected === id) {
      setSelected(null);
      return;
    }

    // Check if already connected
    const exists = connections.some(
      ([a, b]) => (a === selected && b === id) || (a === id && b === selected)
    );

    if (!exists) {
      const next = [...connections, [selected, id] as [string, string]];
      setConnections(next);
      if (next.length >= 3 && !complete) {
        setComplete(true);
        gameConfetti();
      }
    }

    setSelected(null);
  }

  function getNodePos(id: string) {
    const node = GAME_NODES.find((n) => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (gameEmail.trim()) {
      router.push(`/dashboard?email=${encodeURIComponent(gameEmail.trim())}`);
    }
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="bg-mesh" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Title */}
        <div className="text-center mb-6 animate-fade-up">
          <h2 className="text-[22px] font-bold tracking-tight text-text-primary mb-1">
            <ScrambleText text="Connect the APIs" scrambleOnMount speed={22} />
          </h2>
          <p className="text-[13px] text-text-muted">
            Click two services to link them together
          </p>
        </div>

        {/* Game board */}
        <div
          ref={boardRef}
          className="relative w-full aspect-square max-w-[400px] mx-auto mb-8 animate-fade-up-delay-1"
        >
          {/* SVG connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {/* Selection line (follows from selected node to hovered) */}
            {selected && hovered && hovered !== selected && (
              <line
                x1={`${getNodePos(selected).x}%`}
                y1={`${getNodePos(selected).y}%`}
                x2={`${getNodePos(hovered).x}%`}
                y2={`${getNodePos(hovered).y}%`}
                stroke="rgba(52,211,153,0.15)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            )}

            {/* Completed connections */}
            {connections.map(([a, b], i) => {
              const posA = getNodePos(a);
              const posB = getNodePos(b);
              return (
                <g key={i}>
                  {/* Glow */}
                  <line
                    x1={`${posA.x}%`} y1={`${posA.y}%`}
                    x2={`${posB.x}%`} y2={`${posB.y}%`}
                    stroke="rgba(52,211,153,0.08)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Line */}
                  <line
                    x1={`${posA.x}%`} y1={`${posA.y}%`}
                    x2={`${posB.x}%`} y2={`${posB.y}%`}
                    stroke="rgba(52,211,153,0.35)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="animate-fade-in"
                  />
                  {/* Midpoint dot */}
                  <circle
                    cx={`${(posA.x + posB.x) / 2}%`}
                    cy={`${(posA.y + posB.y) / 2}%`}
                    r="2"
                    fill="#34d399"
                    opacity="0.4"
                  />
                </g>
              );
            })}
          </svg>

          {/* Center hub */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 2 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/8 border border-accent/20 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.12)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
          </div>

          {/* Nodes */}
          {GAME_NODES.map((node) => {
            const isSelected = selected === node.id;
            const isConnected = connections.some(([a, b]) => a === node.id || b === node.id);

            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group transition-transform duration-300 hover:scale-110"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  zIndex: 10,
                }}
              >
                {/* Pulse ring when selected */}
                {isSelected && (
                  <div className="absolute inset-[-8px] rounded-2xl border-2 border-accent/40 animate-pulse" />
                )}

                {/* Node */}
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300"
                  style={{
                    background: isSelected
                      ? "rgba(52,211,153,0.12)"
                      : isConnected
                      ? "rgba(16,16,22,0.8)"
                      : "rgba(16,16,22,0.6)",
                    border: `1px solid ${
                      isSelected
                        ? "rgba(52,211,153,0.4)"
                        : isConnected
                        ? `${node.color}30`
                        : "rgba(255,255,255,0.08)"
                    }`,
                    boxShadow: isSelected
                      ? "0 0 24px rgba(52,211,153,0.2)"
                      : isConnected
                      ? `0 0 20px ${node.color}10`
                      : "none",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={node.color} opacity={isConnected ? 0.9 : 0.5}>
                    <path d={node.icon} />
                  </svg>
                </div>

                {/* Label */}
                <span className={`block text-[10px] font-medium mt-1.5 text-center transition-colors ${
                  isSelected ? "text-accent" : isConnected ? "text-text-secondary" : "text-text-muted"
                }`}>
                  {node.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="animate-fade-up-delay-2 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-text-muted uppercase tracking-widest">
              {complete ? "APIs Connected!" : `${connections.length} / 3 connections`}
            </span>
            {connections.length > 0 && !complete && (
              <button
                onClick={() => { setConnections([]); setSelected(null); setComplete(false); }}
                className="text-[10px] text-text-muted hover:text-text-secondary transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <div className="h-1 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Email input — revealed after 3 connections */}
        <div
          className={`transition-all duration-700 ease-out overflow-hidden ${
            complete ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass-card rounded-2xl p-6 animate-fade-up">
            <p className="text-[13px] text-text-secondary mb-4 text-center">
              Now enter your email to connect for real
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={gameEmail}
                onChange={(e) => setGameEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 px-4 py-2.5 bg-[rgba(255,255,255,0.03)] border border-border-subtle rounded-xl text-[13px] text-text-primary placeholder-text-muted font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent text-surface font-semibold text-[12px] rounded-xl btn-press hover:brightness-110 transition-all"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Skip link */}
        {!complete && (
          <div className="text-center mt-4 animate-fade-up-delay-3">
            <a href="/" className="text-[11px] text-text-muted hover:text-text-secondary transition-colors">
              or go back to sign in
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConnectionState {
  connectionId: string;
  status: string;
  oauthUrl?: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [connections, setConnections] = useState<Record<string, ConnectionState>>({});
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingApp, setLoadingApp] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fireConfetti = useConfetti();
  const { toast } = useToast();

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch(`/api/maton/user?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.connections) {
        const mapped: Record<string, ConnectionState> = {};
        for (const [app, conn] of Object.entries(data.connections)) {
          const c = conn as ConnectionState;
          mapped[app] = c;
          // If we were waiting for this app and it's now active, auto-select it
          if (c.status === "ACTIVE" && app === connectingApp) {
            setConnectingApp(null);
            setSelectedApp(app);
          }
        }
        setConnections(mapped);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [email, connectingApp]);

  // Fetch on mount
  useEffect(() => {
    if (email) fetchConnections();
  }, [email, fetchConnections]);

  // Re-fetch when user comes back to the tab (after completing OAuth in another tab)
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && email) {
        fetchConnections();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    // Also re-fetch on window focus (covers more cases)
    window.addEventListener("focus", () => { if (email) fetchConnections(); });
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [email, fetchConnections]);

  async function handleConnect(app: string) {
    setError("");
    setLoadingApp(app);
    try {
      const res = await fetch("/api/maton/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, app }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConnections((prev) => ({
        ...prev,
        [app]: {
          connectionId: data.connectionId,
          status: data.status,
          oauthUrl: data.oauthUrl,
        },
      }));

      if (data.status === "ACTIVE" || data.existing) {
        setSelectedApp(app);
      } else {
        setConnectingApp(app);
        if (data.oauthUrl) window.open(data.oauthUrl, "_blank");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoadingApp(null);
    }
  }

  async function handleDisconnect(app: string) {
    setError("");
    try {
      const res = await fetch("/api/maton/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, app }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setConnections((prev) => {
        const next = { ...prev };
        delete next[app];
        return next;
      });
      if (selectedApp === app) setSelectedApp(null);
      toast("Disconnected successfully", "info");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to disconnect";
      setError(msg);
      toast(msg, "error");
    }
  }

  function handleConnected(app: string) {
    setConnections((prev) => ({
      ...prev,
      [app]: { ...prev[app], status: "ACTIVE" },
    }));
    setSelectedApp(app);
    setConnectingApp(null);
    fireConfetti();
    toast(`${app.replace("google-", "").replace(/^\w/, c => c.toUpperCase())} connected!`, "success");
    // Also sync with server to update the store
    fetchConnections();
  }

  if (!email) {
    return <ConnectTheAPIsGame />;
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="animate-fade-up mb-8">
          <h1 className="text-[20px] font-semibold tracking-tight text-text-primary"><ScrambleText text="Dashboard" scrambleOnMount /></h1>
          <p className="text-[13px] text-text-muted font-mono">{email}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger-dim/20 border border-danger/20 rounded-xl text-danger text-[13px] animate-fade-up">
            {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Pending connection modal */}
            {connectingApp && connections[connectingApp] && (
              <div className="mb-6 card-glow bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden animate-fade-up">
                <ConnectionStatus
                  connectionId={connections[connectingApp].connectionId}
                  oauthUrl={connections[connectingApp].oauthUrl ?? ""}
                  app={connectingApp}
                  onConnected={() => handleConnected(connectingApp)}
                />
              </div>
            )}

            {/* App grid */}
            <div className="animate-fade-up-delay-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {APP_CONFIGS.map((app) => (
                <AppCard
                  key={app.slug}
                  app={app}
                  status={connections[app.slug]?.status ?? null}
                  onConnect={() => handleConnect(app.slug)}
                  onDisconnect={() => handleDisconnect(app.slug)}
                  onSelect={() => setSelectedApp(selectedApp === app.slug ? null : app.slug)}
                  selected={selectedApp === app.slug}
                  loading={loadingApp === app.slug}
                />
              ))}
            </div>

            {/* Selected app action panel */}
            {selectedApp && connections[selectedApp]?.status === "ACTIVE" && (
              <div className="animate-fade-up card-glow bg-surface-raised border border-border-subtle rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[13px] font-semibold text-text-primary">
                    {APP_CONFIGS.find((a) => a.slug === selectedApp)?.name}
                  </span>
                  <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium">Demo</span>
                </div>

                {selectedApp === "google-sheets" && <SheetReader email={email} />}
                {selectedApp === "slack" && <SlackSender email={email} />}
                {selectedApp === "google-mail" && <GmailViewer email={email} />}
                {selectedApp === "notion" && <NotionViewer email={email} />}
                {selectedApp === "github" && <GithubViewer email={email} />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-grid flex items-center justify-center">
          <OrbitalSpinner size={48} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
