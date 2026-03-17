"use client";

import { useCallback, useEffect, useState } from "react";
import OrbitalSpinner from "@/components/orbital-spinner";
import FlowField from "@/components/flow-field";
import ScrambleText from "@/components/scramble-text";
import JsonViewer from "@/components/json-viewer";

export default function StorePage() {
  const [storeData, setStoreData] = useState<string>("");
  const [activityData, setActivityData] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "activity">("users");

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, activityRes] = await Promise.all([
        fetch("/api/maton/store?file=users"),
        fetch("/api/maton/store?file=activity"),
      ]);
      const users = await usersRes.json();
      const activity = await activityRes.json();
      setStoreData(JSON.stringify(users, null, 2));
      setActivityData(JSON.stringify(activity, null, 2));
    } catch {
      setStoreData("Error loading store");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const data = tab === "users" ? storeData : activityData;

  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Generative art header */}
        <div className="animate-fade-up mb-6 flex items-center justify-center">
          <div className="relative">
            <FlowField />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-surface via-transparent to-transparent rounded-2xl">
              <div className="text-center mt-16">
                <p className="text-[10px] text-accent/60 font-mono uppercase tracking-widest mb-1">Generative</p>
                <p className="text-[11px] text-text-muted">Data flow visualization</p>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-up flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-text-primary"><ScrambleText text="Raw Store" scrambleOnMount /></h1>
            <p className="text-[13px] text-text-muted">Live JSON data &middot; auto-refreshes every 3s</p>
          </div>
          <div className="flex items-center gap-1 bg-surface-raised border border-border-subtle rounded-lg p-0.5">
            <button
              onClick={() => setTab("users")}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                tab === "users" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              users.json
            </button>
            <button
              onClick={() => setTab("activity")}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                tab === "activity" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              activity.json
            </button>
          </div>
        </div>

        <div className="animate-fade-up-delay-1 card-glow bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <OrbitalSpinner size={48} />
            </div>
          ) : (
            <JsonViewer json={data} />
          )}
        </div>
      </div>
    </div>
  );
}
