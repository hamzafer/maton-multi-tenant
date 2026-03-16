"use client";

import { useState } from "react";

export default function ConnectButton({ onConnect }: { onConnect: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await onConnect();
  }

  return (
    <div className="px-8 py-12 text-center">
      {/* Icon */}
      <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-accent/8 rounded-2xl rotate-6" />
        <div className="relative w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-accent">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <h2 className="text-[18px] font-semibold tracking-tight text-text-primary mb-2">
        Connect Google Sheets
      </h2>
      <p className="text-[13px] text-text-secondary max-w-[280px] mx-auto mb-8 leading-relaxed">
        Authorize read access to your spreadsheets via Google&apos;s OAuth 2.0 flow.
      </p>

      <button
        onClick={handleClick}
        disabled={loading}
        className="group inline-flex items-center gap-2.5 bg-accent text-surface font-semibold text-[13px] py-2.5 px-6 rounded-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 disabled:opacity-60"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Connect
          </>
        )}
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-border-subtle">
        <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent/50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Secure OAuth
        </span>
        <span className="w-px h-3 bg-border-subtle" />
        <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent/50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Read-only access
        </span>
      </div>
    </div>
  );
}
