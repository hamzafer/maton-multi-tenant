"use client";

import { useEffect, useState } from "react";
import { playNav } from "@/lib/sounds";

export default function FocusMode() {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Don't trigger if any overlay is open
        const overlays = document.querySelector(
          ".crt-overlay, .shortcut-overlay, .snake-overlay, .credits-overlay, .screensaver-overlay, .ctx-menu"
        );
        if (overlays) return;

        e.preventDefault();
        playNav();
        setFocused((p) => !p);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (focused) {
      document.documentElement.classList.add("focus-mode");
    } else {
      document.documentElement.classList.remove("focus-mode");
    }
    return () => document.documentElement.classList.remove("focus-mode");
  }, [focused]);

  // Show a brief indicator when toggling
  if (!focused) return null;

  return (
    <div className="focus-mode-badge">
      <span className="focus-mode-dot" />
      <span>Focus</span>
      <span className="focus-mode-key">F</span>
    </div>
  );
}
