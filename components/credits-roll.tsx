"use client";

import { useEffect, useRef, useState } from "react";
import { playClick } from "@/lib/sounds";

const CREDITS = `
A  M A T O N  P R O D U C T I O N




ONE API KEY. EVERY SERVICE.



━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


THE GATEWAY

Built on Next.js 16 App Router
Powered by the Maton OAuth Gateway
5 API integrations · Multi-tenant architecture


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


VISUAL EFFECTS

Particle Constellation · Cursor Glow
Shooting Stars · Click Shockwave Rings
Flow Field Canvas · Wave Divider
Animated Mesh Gradients · Noise Overlay
Time-of-Day Color Shifting


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


MICRO-INTERACTIONS

Holographic Tilt Card · Magnetic Field
Scramble Text Cipher · Ripple Buttons
Gradient Borders · Spotlight Table
Screen Shake & Bounce · Number Ticker


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


EASTER EGGS

↑↑↓↓←→←→BA · Konami Code
\` · CRT Hacker Terminal (12 commands)
"matrix" · Digital Rain Cascade
"snake" · Classic Snake Game
"credits" · You're watching it right now
? · Shortcut Cheatsheet
Breakout · Hidden in empty states


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


SOUND DESIGN

20+ Procedural Web Audio Sounds
Ambient Generative Drone
Mechanical Key Clicks · Sonar Pings
Celestial Whooshes · Digital Warbles
Heartbeat Thuds · Success Chimes


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


THE EXPERIENCE

Boot Splash Sequence
Page Transition Wipes
Lissajous Screensaver
Dynamic Favicon · Tab Notifications
Custom Context Menu
Scroll Progress Bar
Achievement System (10 badges)
JSON Syntax Viewer
Radar Sweep · Heartbeat Monitor


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


50+ COMPONENTS
120+ COMMITS
0 GENERIC AESTHETICS


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



Thank you for exploring.

Every pixel was intentional.
Every sound was crafted.
Every interaction was considered.



M A T O N
gateway.maton.ai



`.trim();

export default function CreditsRoll() {
  const [open, setOpen] = useState(false);
  const bufferRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  // Listen for "credits" typed
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (open) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      bufferRef.current += e.key.toLowerCase();
      if (bufferRef.current.length > 7) bufferRef.current = bufferRef.current.slice(-7);
      if (bufferRef.current.endsWith("credits")) {
        bufferRef.current = "";
        playClick();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-scroll the crawl
  useEffect(() => {
    if (!open || !scrollRef.current) return;
    const el = scrollRef.current;
    let y = 0;

    function tick() {
      y += 0.6; // pixels per frame
      el.style.transform = `translateY(-${y}px)`;

      // Stop when fully scrolled past
      if (y > el.scrollHeight + 200) {
        setOpen(false);
        return;
      }

      animRef.current = requestAnimationFrame(tick);
    }

    // Start from below the viewport
    el.style.transform = "translateY(100vh)";
    // Small delay then begin
    const t = setTimeout(() => {
      y = -window.innerHeight;
      animRef.current = requestAnimationFrame(tick);
    }, 500);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animRef.current);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="credits-overlay" onClick={() => setOpen(false)}>
      <div className="credits-perspective">
        <div ref={scrollRef} className="credits-crawl">
          {CREDITS.split("\n").map((line, i) => {
            const isSeparator = line.includes("━━━");
            const isTitle = line === line.toUpperCase() && line.trim().length > 0 && !isSeparator;
            const isEmpty = line.trim() === "";

            return (
              <p
                key={i}
                className={
                  isSeparator
                    ? "credits-separator"
                    : isTitle
                    ? "credits-title"
                    : isEmpty
                    ? "credits-spacer"
                    : "credits-line"
                }
              >
                {line || "\u00A0"}
              </p>
            );
          })}
        </div>
      </div>

      <div className="credits-hint">Click or press Esc to exit</div>
    </div>
  );
}
