"use client";

import { useEffect, useRef } from "react";

interface Ring {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  speed: number;
}

export default function ClickShockwave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringsRef = useRef<Ring[]>([]);
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

    function handleClick(e: MouseEvent) {
      // Don't fire inside overlays
      const target = e.target as HTMLElement;
      if (target.closest(".crt-overlay, .shortcut-overlay, .boot-splash, .screensaver-overlay, .ctx-menu")) return;

      // Spawn 3 concentric rings with staggered timing
      const baseSpeed = 3 + Math.random() * 1.5;
      for (let i = 0; i < 3; i++) {
        ringsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 0,
          maxRadius: 80 + i * 40 + Math.random() * 30,
          life: 1.0,
          speed: baseSpeed - i * 0.5,
        });
      }

      // Start animation loop if not running
      if (!activeRef.current) {
        activeRef.current = true;
        animate();
      }
    }

    function animate() {
      const rings = ringsRef.current;
      if (rings.length === 0) {
        activeRef.current = false;
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        return;
      }

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];

        ring.radius += ring.speed;
        ring.life = Math.max(0, 1 - ring.radius / ring.maxRadius);

        if (ring.life <= 0) {
          rings.splice(i, 1);
          continue;
        }

        const alpha = ring.life * 0.35;
        const lineWidth = Math.max(0.5, ring.life * 2);

        // Outer glow
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.5})`;
        ctx.lineWidth = lineWidth + 2;
        ctx.stroke();

        // Core ring
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 3 }}
    />
  );
}
