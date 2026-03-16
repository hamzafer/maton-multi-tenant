"use client";

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

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-up">
      <div className="mb-4 opacity-80">{svg}</div>
      <p className="text-[14px] font-medium text-text-secondary mb-1">{title}</p>
      <p className="text-[12px] text-text-muted">{subtitle}</p>
    </div>
  );
}
