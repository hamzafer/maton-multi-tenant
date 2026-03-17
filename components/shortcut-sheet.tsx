"use client";

import { useEffect, useState } from "react";
import { playClick } from "@/lib/sounds";
import { unlockAchievement } from "@/components/achievements";

interface Shortcut {
  keys: string[];
  label: string;
  description: string;
}

interface Category {
  title: string;
  icon: string;
  shortcuts: Shortcut[];
}

const CATEGORIES: Category[] = [
  {
    title: "Navigation",
    icon: "◈",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Command Palette", description: "Fuzzy search & jump to any page" },
      { keys: ["?"], label: "This Sheet", description: "Show all shortcuts & secrets" },
      { keys: ["F"], label: "Focus Mode", description: "Dim all chrome, zen mode" },
      { keys: ["Esc"], label: "Close", description: "Close any overlay or modal" },
    ],
  },
  {
    title: "Easter Eggs",
    icon: "◆",
    shortcuts: [
      { keys: ["`"], label: "CRT Terminal", description: "Retro hacker terminal with commands" },
      { keys: ["m", "a", "t", "r", "i", "x"], label: "Matrix Rain", description: "Digital rain cascade" },
      { keys: ["c", "r", "e", "d", "i", "t", "s"], label: "Credits Roll", description: "Star Wars-style credits crawl" },
      { keys: ["d", "j"], label: "Sound Board", description: "Play all 13 procedural sounds" },
      { keys: ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"], label: "Konami Code", description: "The classic secret" },
    ],
  },
  {
    title: "Interactive",
    icon: "◇",
    shortcuts: [
      { keys: ["Hover"], label: "Headings", description: "Cipher scramble decrypt effect" },
      { keys: ["Hover"], label: "Form Card", description: "Holographic 3D tilt effect" },
      { keys: ["Click"], label: "Heartbeat Bar", description: "Expand system vital signs" },
      { keys: ["🎵"], label: "Ambient Toggle", description: "Generative drone music in sidebar" },
      { keys: ["Near"], label: "Magnetic Buttons", description: "Buttons pull toward your cursor" },
      { keys: ["Right", "Click"], label: "Context Menu", description: "Custom menu with quick actions" },
      { keys: ["Idle"], label: "Screensaver", description: "Lissajous curves after 45s idle" },
      { keys: ["Dbl", "Click"], label: "Fireworks", description: "Launch a firework from any point" },
    ],
  },
  {
    title: "Hidden Games",
    icon: "▸",
    shortcuts: [
      { keys: ["Dashboard"], label: "Connect the APIs", description: "Visit /dashboard without email" },
      { keys: ["Empty"], label: "Breakout", description: "Classic game in empty connections" },
      { keys: ["s", "n", "a", "k", "e"], label: "Snake", description: "Classic snake eating API services" },
      { keys: ["Reload"], label: "Boot Sequence", description: "New session shows startup animation" },
    ],
  },
];

function KeyCap({ char }: { char: string }) {
  const isWide = char.length > 1;
  return (
    <span
      className={`keycap ${isWide ? "keycap-wide" : ""}`}
    >
      {char}
    </span>
  );
}

export default function ShortcutSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        playClick();
        setOpen((p) => { if (!p) unlockAchievement("shortcuts"); return !p; });
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="shortcut-overlay" onClick={() => setOpen(false)}>
      <div className="shortcut-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="shortcut-header">
          <div>
            <h2 className="shortcut-title">Keyboard Shortcuts & Secrets</h2>
            <p className="shortcut-subtitle">Everything hidden in this app</p>
          </div>
          <button className="shortcut-close" onClick={() => setOpen(false)}>
            <KeyCap char="Esc" />
          </button>
        </div>

        {/* Grid */}
        <div className="shortcut-grid">
          {CATEGORIES.map((cat, catIdx) => (
            <div
              key={cat.title}
              className="shortcut-category"
              style={{ animationDelay: `${catIdx * 80}ms` }}
            >
              <div className="shortcut-cat-header">
                <span className="shortcut-cat-icon">{cat.icon}</span>
                <span className="shortcut-cat-title">{cat.title}</span>
              </div>

              <div className="shortcut-list">
                {cat.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className="shortcut-item"
                    style={{ animationDelay: `${catIdx * 80 + scIdx * 40}ms` }}
                  >
                    <div className="shortcut-keys">
                      {sc.keys.map((k, ki) => (
                        <span key={ki}>
                          <KeyCap char={k} />
                          {ki < sc.keys.length - 1 && sc.keys.length <= 3 && (
                            <span className="shortcut-plus">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="shortcut-info">
                      <span className="shortcut-label">{sc.label}</span>
                      <span className="shortcut-desc">{sc.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shortcut-footer">
          <span>Press <KeyCap char="?" /> to toggle this sheet</span>
        </div>
      </div>
    </div>
  );
}
