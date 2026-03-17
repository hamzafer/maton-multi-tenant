"use client";

import { useEffect, useRef } from "react";

export default function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 400;
    const H = 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const CELL = 20;
    const COLS = Math.ceil(W / CELL);
    const ROWS = Math.ceil(H / CELL);
    let time = 0;

    interface FlowParticle {
      x: number;
      y: number;
      age: number;
      maxAge: number;
      speed: number;
    }

    // Particles
    const particles: FlowParticle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      age: 0,
      maxAge: 60 + Math.random() * 120,
      speed: 0.5 + Math.random() * 1.5,
    }));

    function noise(x: number, y: number, t: number): number {
      return (
        Math.sin(x * 0.02 + t * 0.3) * Math.cos(y * 0.03 + t * 0.2) +
        Math.sin((x + y) * 0.01 + t * 0.15) * 0.5 +
        Math.cos(x * 0.04 - y * 0.02 + t * 0.1) * 0.3
      );
    }

    function getAngle(x: number, y: number, t: number): number {
      return noise(x, y, t) * Math.PI * 2;
    }

    function animate() {
      if (!ctx) return;
      // Fade trail
      ctx.fillStyle = "rgba(6, 6, 8, 0.05)";
      ctx.fillRect(0, 0, W, H);

      time += 0.01;

      for (const p of particles) {
        const angle = getAngle(p.x, p.y, time);
        const prevX = p.x;
        const prevY = p.y;

        p.x += Math.cos(angle) * p.speed;
        p.y += Math.sin(angle) * p.speed;
        p.age++;

        // Lifecycle fade
        const lifePct = p.age / p.maxAge;
        const alpha = lifePct < 0.1
          ? lifePct / 0.1
          : lifePct > 0.8
          ? (1 - lifePct) / 0.2
          : 1;

        // Color based on angle
        const hue = ((angle / (Math.PI * 2)) * 60 + 150) % 360; // Green-cyan range
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Reset if out of bounds or too old
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.age > p.maxAge) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.age = 0;
          p.maxAge = 60 + Math.random() * 120;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    // Initial clear
    ctx.fillStyle = "rgba(6, 6, 8, 1)";
    ctx.fillRect(0, 0, W, H);
    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-2xl border border-border-subtle"
      style={{ width: 400, height: 300 }}
    />
  );
}
