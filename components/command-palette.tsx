"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { playClick, playNav } from "@/lib/sounds";
import { unlockAchievement } from "@/components/achievements";

interface Command {
  id: string;
  label: string;
  section: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string;
}

function CommandPaletteInner() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const navigate = useCallback((path: string) => {
    playNav();
    setOpen(false);
    router.push(path);
  }, [router]);

  const commands: Command[] = [
    {
      id: "dashboard",
      label: "Go to Dashboard",
      section: "Navigation",
      keywords: "home main apps",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" /></svg>,
      action: () => navigate(email ? `/dashboard?email=${encodeURIComponent(email)}` : "/dashboard"),
    },
    {
      id: "admin",
      label: "Go to Admin",
      section: "Navigation",
      keywords: "connections users manage",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
      action: () => navigate("/admin"),
    },
    {
      id: "activity",
      label: "Go to Activity",
      section: "Navigation",
      keywords: "logs analytics api calls",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" /></svg>,
      action: () => navigate("/activity"),
    },
    {
      id: "store",
      label: "Go to Raw Store",
      section: "Navigation",
      keywords: "json data debug",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
      action: () => navigate("/store"),
    },
    {
      id: "home",
      label: "Go to Landing Page",
      section: "Navigation",
      keywords: "sign in login email",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
      action: () => navigate("/"),
    },
    {
      id: "theme-toggle",
      label: "Toggle Particles",
      section: "Preferences",
      keywords: "background animation effects",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
      action: () => {
        const particles = document.querySelector("canvas[class*='fixed']") as HTMLCanvasElement;
        if (particles) {
          particles.style.display = particles.style.display === "none" ? "" : "none";
        }
        setOpen(false);
      },
    },
  ];

  const filtered = query
    ? commands.filter((cmd) => {
        const search = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(search) ||
          cmd.section.toLowerCase().includes(search) ||
          cmd.keywords?.toLowerCase().includes(search)
        );
      })
    : commands;

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => { if (!o) unlockAchievement("palette"); return !o; });
        setQuery("");
        setActiveIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Arrow key navigation
  useEffect(() => {
    if (!open) return;
    function handleNav(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        playClick();
        filtered[activeIndex].action();
      }
    }
    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [open, filtered, activeIndex]);

  // Reset index on query change
  useEffect(() => setActiveIndex(0), [query]);

  if (!open) return null;

  // Group commands by section
  const sections: Record<string, Command[]> = {};
  filtered.forEach((cmd) => {
    if (!sections[cmd.section]) sections[cmd.section] = [];
    sections[cmd.section].push(cmd);
  });

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm animate-fade-in" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg mx-4 glass-card rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6)] animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-text-muted shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder-text-muted outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.04)] border border-border-subtle text-[10px] text-text-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-text-muted">No commands found</p>
            </div>
          ) : (
            Object.entries(sections).map(([section, cmds]) => (
              <div key={section}>
                <p className="px-5 py-1.5 text-[10px] text-text-muted uppercase tracking-widest font-medium">
                  {section}
                </p>
                {cmds.map((cmd) => {
                  const globalIdx = filtered.indexOf(cmd);
                  const isActive = globalIdx === activeIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { playClick(); cmd.action(); }}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors duration-100 ${
                        isActive
                          ? "bg-accent/8 text-accent"
                          : "text-text-secondary hover:bg-[rgba(255,255,255,0.03)]"
                      }`}
                    >
                      <span className={isActive ? "text-accent" : "text-text-muted"}>{cmd.icon}</span>
                      <span className="text-[13px] font-medium">{cmd.label}</span>
                      {isActive && (
                        <span className="ml-auto text-[10px] text-text-muted font-mono">Enter</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-border-subtle flex items-center gap-4">
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <kbd className="px-1 py-0.5 rounded bg-[rgba(255,255,255,0.04)] border border-border-subtle font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <kbd className="px-1 py-0.5 rounded bg-[rgba(255,255,255,0.04)] border border-border-subtle font-mono">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <kbd className="px-1 py-0.5 rounded bg-[rgba(255,255,255,0.04)] border border-border-subtle font-mono">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function CommandPalette() {
  return (
    <Suspense fallback={null}>
      <CommandPaletteInner />
    </Suspense>
  );
}
