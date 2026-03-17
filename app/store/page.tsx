"use client";

import { useCallback, useEffect, useState } from "react";
import OrbitalSpinner from "@/components/orbital-spinner";

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
        <div className="animate-fade-up flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">Raw Store</h1>
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
            <pre className="p-6 text-[12px] font-mono text-text-secondary leading-relaxed overflow-x-auto max-h-[70vh] overflow-y-auto">
              {data}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
