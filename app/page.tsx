"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/dashboard?email=${encodeURIComponent(email.trim())}`);
    }
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center px-4 relative">
      {/* Animated gradient mesh */}
      <div className="bg-mesh" />

      <div className="animate-fade-up w-full max-w-[420px] relative z-10">
        {/* Logo mark */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 10.875c-.621 0-1.125.504-1.125 1.125m0 0v1.5c0 .621.504 1.125 1.125 1.125m-1.125-2.625c0 .621.504 1.125 1.125 1.125" />
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-text-primary">Maton</h1>
            <p className="text-[11px] text-text-muted tracking-wide uppercase">API Gateway Demo</p>
          </div>
        </div>

        {/* Card */}
        <div className="card-glow bg-surface-raised border border-border-subtle rounded-2xl p-8">
          <div className="animate-fade-up-delay-1">
            <h2 className="text-[22px] font-semibold tracking-tight text-text-primary mb-2">
              Get started
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed mb-8">
              Connect to 100+ APIs through Maton&apos;s unified OAuth gateway. Sheets, Slack, Gmail, Notion, GitHub and more.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="animate-fade-up-delay-2">
            <label htmlFor="email" className="block text-[12px] font-medium text-text-secondary mb-2 uppercase tracking-wider">
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-surface border border-border-default rounded-xl text-[14px] text-text-primary placeholder-text-muted transition-all duration-300"
              />
              {focused && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent/50">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-accent text-surface font-semibold text-[14px] py-3 px-4 rounded-xl btn-press hover:brightness-110 transition-all duration-200"
            >
              Continue
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-text-muted mt-6">
          Powered by <span className="text-text-secondary">Maton</span> &middot; OAuth 2.0
        </p>
      </div>
    </div>
  );
}
