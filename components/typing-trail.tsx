"use client";

import { useEffect, useState, useRef } from "react";

interface FloatingChar {
  id: number;
  char: string;
  x: number;
  exiting: boolean;
}

let charCounter = 0;

export default function TypingTrail() {
  const [chars, setChars] = useState<FloatingChar[]>([]);
  const xRef = useRef(50); // percentage across viewport, drifts

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return; // only printable characters

      // Drift x position slightly so chars don't stack
      xRef.current += (Math.random() - 0.5) * 6;
      xRef.current = Math.max(20, Math.min(80, xRef.current));

      const id = ++charCounter;
      setChars((prev) => [...prev.slice(-8), { id, char: e.key, x: xRef.current, exiting: false }]);

      // Start exit after 800ms
      setTimeout(() => {
        setChars((prev) => prev.map((c) => c.id === id ? { ...c, exiting: true } : c));
      }, 800);

      // Remove after animation completes
      setTimeout(() => {
        setChars((prev) => prev.filter((c) => c.id !== id));
      }, 1400);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (chars.length === 0) return null;

  return (
    <div className="typing-trail-container">
      {chars.map((c) => (
        <span
          key={c.id}
          className={`typing-trail-char ${c.exiting ? "typing-trail-exit" : ""}`}
          style={{ left: `${c.x}%` }}
        >
          {c.char}
        </span>
      ))}
    </div>
  );
}
