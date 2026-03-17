"use client";

import { useEffect, useRef } from "react";

interface TimeColors {
  orb1: string;
  orb2: string;
  orb3: string;
  accent: string;
  accentGlow: string;
}

function getTimeColors(hour: number): TimeColors {
  // Dawn: 5-8 — warm amber/gold
  if (hour >= 5 && hour < 8) {
    return {
      orb1: "#f59e0b",   // amber
      orb2: "#f97316",   // orange
      orb3: "#fbbf24",   // yellow
      accent: "#f59e0b",
      accentGlow: "rgba(245, 158, 11, 0.12)",
    };
  }

  // Day: 8-17 — default emerald
  if (hour >= 8 && hour < 17) {
    return {
      orb1: "#34d399",   // emerald
      orb2: "#818cf8",   // indigo
      orb3: "#06b6d4",   // cyan
      accent: "#34d399",
      accentGlow: "rgba(52, 211, 153, 0.12)",
    };
  }

  // Dusk: 17-20 — sunset rose/coral
  if (hour >= 17 && hour < 20) {
    return {
      orb1: "#fb7185",   // rose
      orb2: "#c084fc",   // purple
      orb3: "#f472b6",   // pink
      accent: "#fb7185",
      accentGlow: "rgba(251, 113, 133, 0.12)",
    };
  }

  // Night: 20-5 — deep blue/indigo
  return {
    orb1: "#6366f1",   // indigo
    orb2: "#3b82f6",   // blue
    orb3: "#8b5cf6",   // violet
    accent: "#818cf8",
    accentGlow: "rgba(129, 140, 248, 0.12)",
  };
}

// Smoothly interpolate hex colors
function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b2 = Math.round(ab + (bb - ab) * t);
  return `#${((r << 16) | (g << 8) | b2).toString(16).padStart(6, "0")}`;
}

export default function TimeTheme() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    function apply() {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const colors = getTimeColors(hour);

      // Check if we're near a transition boundary — blend
      const boundaries = [5, 8, 17, 20];
      let finalColors = colors;

      for (const boundary of boundaries) {
        const prevHour = boundary - 1;
        // If we're within 30 min before or after a boundary, blend
        if (hour === prevHour && minute >= 30) {
          const t = (minute - 30) / 30; // 0-1 in the 30 min
          const from = getTimeColors(prevHour);
          const to = getTimeColors(boundary);
          finalColors = {
            orb1: lerpColor(from.orb1, to.orb1, t),
            orb2: lerpColor(from.orb2, to.orb2, t),
            orb3: lerpColor(from.orb3, to.orb3, t),
            accent: lerpColor(from.accent, to.accent, t),
            accentGlow: to.accentGlow, // can't lerp rgba easily, just snap
          };
          break;
        }
        if (hour === boundary && minute < 30) {
          const t = minute / 30; // 0-1 in the 30 min
          const from = getTimeColors(prevHour);
          const to = getTimeColors(boundary);
          finalColors = {
            orb1: lerpColor(from.orb1, to.orb1, 0.5 + t * 0.5),
            orb2: lerpColor(from.orb2, to.orb2, 0.5 + t * 0.5),
            orb3: lerpColor(from.orb3, to.orb3, 0.5 + t * 0.5),
            accent: lerpColor(from.accent, to.accent, 0.5 + t * 0.5),
            accentGlow: to.accentGlow,
          };
          break;
        }
      }

      // Apply CSS custom properties
      const root = document.documentElement;
      root.style.setProperty("--time-orb1", finalColors.orb1);
      root.style.setProperty("--time-orb2", finalColors.orb2);
      root.style.setProperty("--time-orb3", finalColors.orb3);
      root.style.setProperty("--time-accent", finalColors.accent);
      root.style.setProperty("--time-accent-glow", finalColors.accentGlow);
    }

    apply();
    // Update every 60 seconds
    intervalRef.current = setInterval(apply, 60000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return null;
}
