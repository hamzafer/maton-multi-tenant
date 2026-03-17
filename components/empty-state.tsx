"use client";

import { useState } from "react";
import BreakoutGame from "@/components/breakout-game";

type Variant = "connections" | "activity" | "data" | "email";

const illustrations: Record<Variant, { svg: React.ReactNode; title: string; subtitle: string }> = {
  connections: {
    title: "No connections yet",
    subtitle: "Connect an app from the dashboard to get started",
    svg: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="8" width="20" height="20" rx="6" stroke="#34d399" strokeWidth="1.5" opacity="0.3" />
        <rect x="36" y="8" width="20" height="20" rx="6" stroke="#34d399" strokeWidth="1.5" opacity="0.15" />
        <rect x="8" y="36" width="20" height="20" rx="6" stroke="#34d399" strokeWidth="1.5" opacity="0.15" />
        <rect x="36" y="36" width="20" height="20" rx="6" stroke="#34d399" strokeWidth="1.5" opacity="0.08" />
        <circle cx="32" cy="32" r="4" fill="#34d399" opacity="0.2" />
        <path d="M28 32h-4M36 32h4M32 28v-4M32 36v4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      </svg>
    ),
  },
  activity: {
    title: "No activity yet",
    subtitle: "Make some API calls from the dashboard",
    svg: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M12 44h8l4-12 6 20 6-28 4 12h12" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" />
        <circle cx="12" cy="44" r="2" fill="#34d399" opacity="0.3" />
        <circle cx="52" cy="36" r="2" fill="#34d399" opacity="0.3" />
        <rect x="8" y="50" width="48" height="1" rx="0.5" fill="#34d399" opacity="0.1" />
      </svg>
    ),
  },
  data: {
    title: "No data found",
    subtitle: "Try a different spreadsheet ID or range",
    svg: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="12" width="40" height="40" rx="6" stroke="#34d399" strokeWidth="1.5" opacity="0.15" />
        <line x1="12" y1="24" x2="52" y2="24" stroke="#34d399" strokeWidth="1" opacity="0.1" />
        <line x1="12" y1="36" x2="52" y2="36" stroke="#34d399" strokeWidth="1" opacity="0.1" />
        <line x1="28" y1="12" x2="28" y2="52" stroke="#34d399" strokeWidth="1" opacity="0.1" />
        <circle cx="32" cy="32" r="8" stroke="#34d399" strokeWidth="1.5" opacity="0.2" />
        <path d="M29 32h6M32 29v6" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  email: {
    title: "No email provided",
    subtitle: "Go back and enter your email to get started",
    svg: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="10" y="18" width="44" height="28" rx="4" stroke="#34d399" strokeWidth="1.5" opacity="0.2" />
        <path d="M10 22l22 14 22-14" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
        <circle cx="32" cy="32" r="3" fill="#34d399" opacity="0.2" />
      </svg>
    ),
  },
};

export default function EmptyState({ variant }: { variant: Variant }) {
  const { svg, title, subtitle } = illustrations[variant];
  const [showGame, setShowGame] = useState(false);

  if (showGame && variant === "connections") {
    return <BreakoutGame onClose={() => setShowGame(false)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-up">
      <div className="mb-4 opacity-80">{svg}</div>
      <p className="text-[14px] font-medium text-text-secondary mb-1">{title}</p>
      <p className="text-[12px] text-text-muted mb-4">{subtitle}</p>
      {variant === "connections" && (
        <button
          onClick={() => setShowGame(true)}
          className="text-[11px] text-text-muted hover:text-accent transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.657-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
          </svg>
          or play Breakout while you wait
        </button>
      )}
    </div>
  );
}
