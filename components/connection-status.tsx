"use client";

import { useEffect, useRef, useState } from "react";
import { playConnect } from "@/lib/sounds";

interface Props {
  connectionId: string;
  oauthUrl: string;
  app?: string;
  onConnected: () => void;
}

export default function ConnectionStatus({ connectionId, oauthUrl, app, onConnected }: Props) {
  const [status, setStatus] = useState("PENDING");
  const [failures, setFailures] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/maton/status/${connectionId}`);
        if (!res.ok) {
          setFailures((f) => f + 1);
          return;
        }
        const data = await res.json();
        setStatus(data.status);
        setFailures(0);

        if (data.status === "ACTIVE") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          playConnect();
          onConnected();
        }
      } catch {
        setFailures((f) => f + 1);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connectionId, onConnected]);

  if (failures >= 10) {
    return (
      <div className="px-8 py-12 text-center">
        <p className="text-danger font-medium text-[14px] mb-2">Connection timed out</p>
        <p className="text-text-muted text-[13px]">Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 text-center">
      <div className="relative inline-flex items-center justify-center w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-full border-2 border-warning/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative w-14 h-14 rounded-full bg-warning/10 border border-warning/25 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-warning rounded-full animate-pulse" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-[12px] font-medium mb-3">
        {status}
      </div>

      <p className="text-text-secondary text-[14px] mb-1">
        Waiting for {app ?? "service"} authorization...
      </p>
      <p className="text-text-muted text-[12px] mb-5">
        Complete the OAuth flow in the new tab.
      </p>

      <div className="inline-block bg-surface rounded-lg border border-border-subtle px-4 py-2 mb-4">
        <div className="flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-text-muted">ID</span>
            <p className="font-mono text-text-secondary mt-0.5">{connectionId.slice(0, 8)}...</p>
          </div>
          <div className="w-px h-5 bg-border-subtle" />
          <div>
            <span className="text-text-muted">Elapsed</span>
            <p className="font-mono text-text-secondary mt-0.5">{elapsed}s</p>
          </div>
        </div>
      </div>

      <div className="block">
        <a
          href={oauthUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:text-accent/80 font-medium transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Re-open authorization page
        </a>
      </div>
    </div>
  );
}
