"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { unlockAchievement } from "@/components/achievements";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function KonamiEasterEgg() {
  const [active, setActive] = useState(false);
  const inputRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const columnsRef = useRef<number[]>([]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      inputRef.current.push(e.key);
      // Keep only last N keys
      if (inputRef.current.length > KONAMI.length) {
        inputRef.current.shift();
      }
      // Check match
      if (
        inputRef.current.length === KONAMI.length &&
        inputRef.current.every((k, i) => k === KONAMI[i])
      ) {
        setActive(true);
        unlockAchievement("konami");
        inputRef.current = [];
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const startMatrix = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    columnsRef.current = Array(cols).fill(0).map(() => Math.random() * -50);

    const chars = "MATONAPIGATEWAYアイウエオカキクケコサシスセソタチツテトナニヌネノ01";

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = "rgba(6, 6, 8, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      const columns = columnsRef.current;
      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = columns[i] * fontSize;

        // Leading character is bright
        if (y > 0) {
          ctx.fillStyle = "#34d399";
          ctx.globalAlpha = 1;
          ctx.fillText(char, x, y);

          // Trail characters fade
          ctx.fillStyle = "#065f46";
          ctx.globalAlpha = 0.6;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);
          ctx.globalAlpha = 0.3;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize * 2);
        }

        ctx.globalAlpha = 1;

        columns[i]++;
        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = 0;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
  }, []);

  useEffect(() => {
    if (active) {
      startMatrix();
      // Auto-dismiss after 8 seconds
      const timeout = setTimeout(() => {
        setActive(false);
        cancelAnimationFrame(animRef.current);
      }, 8000);
      return () => {
        clearTimeout(timeout);
        cancelAnimationFrame(animRef.current);
      };
    }
  }, [active, startMatrix]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] cursor-pointer"
      onClick={() => {
        setActive(false);
        cancelAnimationFrame(animRef.current);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center animate-fade-up">
          <p className="text-accent text-[48px] font-bold tracking-tight mb-2" style={{ textShadow: "0 0 40px rgba(52,211,153,0.5)" }}>
            MATON
          </p>
          <p className="text-accent/60 text-[14px] font-mono tracking-widest">
            YOU FOUND THE SECRET
          </p>
          <p className="text-text-muted text-[11px] mt-4">click anywhere to dismiss</p>
        </div>
      </div>
    </div>
  );
}
