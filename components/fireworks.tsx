"use client";

import { useEffect, useRef } from "react";
import { playSuccess } from "@/lib/sounds";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

const COLORS = [
  "#34d399", "#6ee7b7", "#fbbf24", "#f472b6",
  "#22d3ee", "#818cf8", "#fb7185", "#a78bfa",
];

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const animRef = useRef<number>(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function handleDblClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest(".crt-overlay, .shortcut-overlay, .snake-overlay, .credits-overlay, .screensaver-overlay")) return;

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      // Launch a rocket from click point upward
      rocketsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vy: -(8 + Math.random() * 4), // upward velocity
        targetY: e.clientY - 120 - Math.random() * 100, // explode 120-220px above click
        color,
        trail: [],
      });

      playSuccess();

      if (!activeRef.current) {
        activeRef.current = true;
        animate();
      }
    }

    function explode(x: number, y: number, color: string) {
      const count = 30 + Math.floor(Math.random() * 20);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          color: Math.random() > 0.3 ? color : COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 1 + Math.random() * 2,
        });
      }
    }

    function animate() {
      const rockets = rocketsRef.current;
      const sparks = sparksRef.current;

      if (rockets.length === 0 && sparks.length === 0) {
        activeRef.current = false;
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        return;
      }

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        // Trail
        r.trail.push({ x: r.x + (Math.random() - 0.5) * 2, y: r.y, alpha: 1 });
        if (r.trail.length > 12) r.trail.shift();

        // Draw trail
        r.trail.forEach((t, ti) => {
          t.alpha *= 0.85;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 255, 230, ${t.alpha * 0.6})`;
          ctx.fill();
        });

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Explode when reaching target
        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08; // gravity
        s.vx *= 0.98; // drag
        s.vy *= 0.98;

        const lifeRatio = s.life / s.maxLife;
        const alpha = 1 - lifeRatio;

        if (alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        // Glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size + 1, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.floor(alpha * 40).toString(16).padStart(2, "0");
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.floor(alpha * 200).toString(16).padStart(2, "0");
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener("dblclick", handleDblClick);

    return () => {
      window.removeEventListener("dblclick", handleDblClick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 4 }}
    />
  );
}
