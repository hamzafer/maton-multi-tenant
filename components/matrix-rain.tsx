"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// Characters: katakana + latin + digits + symbols for authentic Matrix feel
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()=+<>{}[]|;:";

interface Drop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
  brightness: number;
}

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [fading, setFading] = useState(false);
  const bufferRef = useRef("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const animRef = useRef<number>(0);

  // Listen for "matrix" typed anywhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      bufferRef.current += e.key.toLowerCase();
      // Keep only last 6 chars
      if (bufferRef.current.length > 6) {
        bufferRef.current = bufferRef.current.slice(-6);
      }
      if (bufferRef.current.endsWith("matrix")) {
        bufferRef.current = "";
        if (!active) {
          setActive(true);
          setFading(false);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!active) return;
    timeoutRef.current = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setActive(false);
        setFading(false);
      }, 1500);
    }, 6000);
    return () => clearTimeout(timeoutRef.current);
  }, [active]);

  const randomChar = useCallback(() => CHARS[Math.floor(Math.random() * CHARS.length)], []);

  // Canvas animation
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops: Drop[] = [];

    // Initialize drops staggered
    for (let i = 0; i < columns; i++) {
      drops.push({
        x: i * fontSize,
        y: -Math.random() * canvas.height,
        speed: 1.5 + Math.random() * 3,
        chars: Array.from({ length: 20 + Math.floor(Math.random() * 15) }, () => randomChar()),
        length: 15 + Math.floor(Math.random() * 15),
        brightness: 0.4 + Math.random() * 0.6,
      });
    }

    let frame = 0;
    function draw() {
      frame++;
      // Semi-transparent black to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (const drop of drops) {
        // Occasionally mutate a random char in the trail
        if (frame % 3 === 0 && Math.random() > 0.7) {
          const idx = Math.floor(Math.random() * drop.chars.length);
          drop.chars[idx] = randomChar();
        }

        // Draw character trail
        for (let j = 0; j < drop.length; j++) {
          const y = drop.y - j * fontSize;
          if (y < -fontSize || y > canvas.height + fontSize) continue;

          const charIdx = j % drop.chars.length;
          const fade = 1 - j / drop.length;

          if (j === 0) {
            // Head character — bright white-green
            ctx.fillStyle = `rgba(180, 255, 220, ${drop.brightness})`;
            ctx.shadowColor = "rgba(52, 211, 153, 0.8)";
            ctx.shadowBlur = 12;
          } else {
            // Trail characters — fade from green to dark
            const g = Math.floor(130 + 80 * fade);
            ctx.fillStyle = `rgba(30, ${g}, 80, ${fade * drop.brightness * 0.7})`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(drop.chars[charIdx], drop.x, y);
          ctx.shadowBlur = 0;
        }

        drop.y += drop.speed;

        // Reset when fully off screen
        if (drop.y - drop.length * fontSize > canvas.height) {
          drop.y = -Math.random() * 200;
          drop.speed = 1.5 + Math.random() * 3;
          drop.brightness = 0.4 + Math.random() * 0.6;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, randomChar]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: fading ? 0 : 1,
        transition: "opacity 1.5s ease-out",
      }}
    />
  );
}
