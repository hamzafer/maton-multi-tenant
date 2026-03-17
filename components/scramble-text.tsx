"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playScramble } from "@/lib/sounds";
import { unlockAchievement } from "@/components/achievements";

const GLYPHS = "アイウエオカキクケコ01!@#$%&=+<>{}[]ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Milliseconds per character resolve — lower = faster */
  speed?: number;
  /** Whether to scramble on mount (once) */
  scrambleOnMount?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  onScrambleStart?: () => void;
}

export default function ScrambleText({
  text,
  className = "",
  speed = 30,
  scrambleOnMount = false,
  as: Tag = "span",
  onScrambleStart,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const [scrambling, setScrambling] = useState(false);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(false);

  const scramble = useCallback(() => {
    if (scrambling) return;
    setScrambling(true);
    onScrambleStart?.();
    playScramble();
    unlockAchievement("scramble");

    const original = text;
    const length = original.length;
    let resolvedCount = 0;
    let frame = 0;
    const resolveOrder = Array.from({ length }, (_, i) => i)
      .sort(() => Math.random() - 0.5); // randomize which chars resolve first

    function tick() {
      frame++;
      // Every few frames, resolve the next character
      const charsToResolveThisFrame = Math.floor(frame / Math.max(1, Math.round(speed / 16)));

      const resolved = new Set(resolveOrder.slice(0, charsToResolveThisFrame));

      const result = original.split("").map((char, i) => {
        if (char === " ") return " ";
        if (resolved.has(i)) return char;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });

      setDisplay(result.join(""));

      if (charsToResolveThisFrame >= length) {
        setDisplay(original);
        setScrambling(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [text, speed, scrambling, onScrambleStart]);

  // Update display when text prop changes
  useEffect(() => {
    setDisplay(text);
  }, [text]);

  // Scramble on mount if requested
  useEffect(() => {
    if (scrambleOnMount && !mountedRef.current) {
      mountedRef.current = true;
      // Small delay so the initial render shows, then scramble kicks in
      const t = setTimeout(scramble, 100);
      return () => clearTimeout(t);
    }
  }, [scrambleOnMount, scramble]);

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <Tag
      className={`scramble-text ${scrambling ? "scramble-active" : ""} ${className}`}
      onMouseEnter={scramble}
      style={{ cursor: "default" }}
    >
      {display}
    </Tag>
  );
}
