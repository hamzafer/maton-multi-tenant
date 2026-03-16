"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { APP_CONFIGS } from "@/lib/apps";
import AppCard from "@/components/app-card";
import ConnectionStatus from "@/components/connection-status";
import SheetReader from "@/components/sheet-reader";
import SlackSender from "@/components/slack-sender";
import GmailViewer from "@/components/gmail-viewer";
import NotionViewer from "@/components/notion-viewer";
import GithubViewer from "@/components/github-viewer";
import EmptyState from "@/components/empty-state";

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
      setError(err instanceof Error ? err.message : "Failed to connect");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    }
  }

  function handleConnected(app: string) {
    setConnections((prev) => ({
      ...prev,
      [app]: { ...prev[app], status: "ACTIVE" },
    }));
    setSelectedApp(app);
    setConnectingApp(null);
    // Also sync with server to update the store
    fetchConnections();
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <div className="text-center">
          <EmptyState variant="email" />
          <a href="/" className="text-accent text-sm hover:underline mt-2 inline-block">Go back</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="animate-fade-up mb-8">
          <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-[13px] text-text-muted font-mono">{email}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger-dim/20 border border-danger/20 rounded-xl text-danger text-[13px] animate-fade-up">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
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
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
