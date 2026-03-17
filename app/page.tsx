"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Typewriter from "@/components/typewriter";
import RippleButton from "@/components/ripple-button";
import WaveDivider from "@/components/wave-divider";
import TiltCard from "@/components/tilt-card";

const ORBIT_ICONS = [
  { label: "Sheets", color: "#34A853", delay: "0s", d: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" },
  { label: "Slack", color: "#E01E5A", delay: "-4s", d: "M5 15.2a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 010 15.2a2.5 2.5 0 012.5-2.5h2.5v2.5zm1.3 0a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5v6.3A2.5 2.5 0 018.8 24a2.5 2.5 0 01-2.5-2.5v-6.3z" },
  { label: "Gmail", color: "#EA4335", delay: "-8s", d: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
  { label: "Notion", color: "#FFFFFF", delay: "-12s", d: "M4 4.5A2.5 2.5 0 016.5 2H18a2 2 0 012 2v16a2 2 0 01-2 2H6.5A2.5 2.5 0 014 19.5v-15zM8 7h8v2H8V7zm0 4h8v2H8v-2z" },
  { label: "GitHub", color: "#FFFFFF", delay: "-16s", d: "M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.6 0 0 .8-.3 2.8 1 .8-.2 1.7-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.6.7.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.6 4.9.4.3.7.9.7 1.9V21c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12A10 10 0 0012 2z" },
];

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
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="bg-mesh" />
      <div className="bg-mesh-extra" />

      {/* Hero section — two column on larger screens */}
      <div className="relative z-10 w-full max-w-[880px] flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* Left: orbit animation */}
        <div className="hidden lg:flex items-center justify-center w-[320px] h-[320px] shrink-0 animate-fade-up">
          <div className="relative w-full h-full">
            {/* Center hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
            </div>

            {/* Orbit ring */}
            <div className="absolute inset-[30px] rounded-full border border-dashed border-border-subtle/50 orbit-ring" />
            <div className="absolute inset-[70px] rounded-full border border-dashed border-border-subtle/30" />

            {/* Orbiting icons */}
            {ORBIT_ICONS.map((icon, i) => (
              <div
                key={icon.label}
                className="orbit-item absolute top-1/2 left-1/2"
                style={{ animationDelay: icon.delay }}
              >
                <div
                  className="orbit-item-inner w-10 h-10 -ml-5 -mt-5 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${icon.color}10`,
                    borderColor: `${icon.color}20`,
                    animationDelay: icon.delay,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={icon.color} opacity={0.8}>
                    <path d={icon.d} />
                  </svg>
                </div>
              </div>
            ))}

            {/* Connecting lines that pulse */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <line x1="160" y1="160" x2="160" y2="30" stroke="#34d399" strokeWidth="0.5" opacity="0.15" className="connection-line" style={{ animationDelay: "0s" }} />
              <line x1="160" y1="160" x2="290" y2="160" stroke="#34d399" strokeWidth="0.5" opacity="0.15" className="connection-line" style={{ animationDelay: "-4s" }} />
              <line x1="160" y1="160" x2="160" y2="290" stroke="#34d399" strokeWidth="0.5" opacity="0.15" className="connection-line" style={{ animationDelay: "-8s" }} />
              <line x1="160" y1="160" x2="30" y2="160" stroke="#34d399" strokeWidth="0.5" opacity="0.15" className="connection-line" style={{ animationDelay: "-12s" }} />
              <line x1="160" y1="160" x2="250" y2="70" stroke="#34d399" strokeWidth="0.5" opacity="0.15" className="connection-line" style={{ animationDelay: "-16s" }} />
            </svg>
          </div>
        </div>

        {/* Right: content */}
        <div className="w-full max-w-[420px]">
          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center lg:hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                </svg>
              </div>
              <p className="text-[11px] text-accent font-medium tracking-widest uppercase">Maton API Gateway</p>
            </div>

            <h2 className="text-[32px] lg:text-[38px] font-bold tracking-tight text-text-primary leading-[1.1] mb-4">
              One key.<br />
              <Typewriter
                phrases={["Every API.", "Google Sheets.", "Slack.", "Gmail.", "Notion.", "GitHub.", "Every API."]}
                className="text-accent"
                typingSpeed={70}
                deletingSpeed={35}
                pauseDuration={1800}
              />
            </h2>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
              Connect your users to 100+ services through a single OAuth gateway. Sheets, Slack, Gmail, Notion, GitHub — managed for you.
            </p>
          </div>

          {/* Card with holographic tilt */}
          <TiltCard className="animate-fade-up-delay-1 glass-card gradient-border rounded-2xl p-6">
            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="block text-[11px] font-medium text-text-secondary mb-2 uppercase tracking-wider">
                Enter your email to start
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
              <RippleButton
                type="submit"
                className="mt-3 w-full bg-accent text-surface font-semibold text-[14px] py-3 px-4 rounded-xl btn-press hover:brightness-110 transition-all duration-200"
              >
                Continue
              </RippleButton>
            </form>
          </TiltCard>

          <div className="animate-fade-up-delay-2 flex items-center gap-4 mt-6">
            <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              OAuth 2.0
            </span>
            <span className="w-px h-3 bg-border-subtle" />
            <span className="text-[11px] text-text-muted">100+ integrations</span>
            <span className="w-px h-3 bg-border-subtle" />
            <span className="text-[11px] text-text-muted">Multi-tenant</span>
          </div>
        </div>
      </div>

      {/* Animated wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <WaveDivider color="rgba(52,211,153,0.06)" speed={25} />
      </div>
    </div>
  );
}
