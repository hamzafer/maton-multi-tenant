"use client";

import { useEffect, useRef } from "react";
import { playStarWhoosh } from "@/lib/sounds";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  brightness: number;
  trail: { x: number; y: number }[];
}

export default function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

    function spawnStar() {
      const w = canvas!.width;
      const h = canvas!.height;

      // Random entry edge — favor top and right
      const edge = Math.random();
      let x: number, y: number;
      if (edge < 0.5) {
        // Top edge
        x = Math.random() * w;
        y = -10;
      } else if (edge < 0.8) {
        // Right edge
        x = w + 10;
        y = Math.random() * h * 0.6;
      } else {
        // Left edge (rare, moving right)
        x = -10;
        y = Math.random() * h * 0.3;
      }

      // Angle: roughly diagonal downward
      const angle = Math.PI * (0.15 + Math.random() * 0.35); // 27° to 99° from horizontal
      const speed = 4 + Math.random() * 8;
      const dirX = edge >= 0.8 ? -1 : 1; // leftward if spawning from right, else rightward isn't needed — let's just use angle

      const vx = Math.cos(angle) * speed * (edge >= 0.5 && edge < 0.8 ? -1 : 1);
      const vy = Math.sin(angle) * speed;

      const brightness = 0.5 + Math.random() * 0.5;
      const size = 1 + Math.random() * 1.5;

      // Play whoosh for bright, large meteors
      if (brightness > 0.75 && size > 1.5) {
        playStarWhoosh();
      }

      starsRef.current.push({
        x,
        y,
        vx,
        vy,
        life: 0,
        maxLife: 40 + Math.random() * 60,
        size,
        brightness,
        trail: [],
      });
    }

    function scheduleNext() {
      // Random interval between 2-6 seconds
      const delay = 2000 + Math.random() * 4000;
      timerRef.current = setTimeout(() => {
        spawnStar();
        // Occasionally spawn a burst of 2-3
        if (Math.random() < 0.15) {
          setTimeout(() => spawnStar(), 100 + Math.random() * 300);
          if (Math.random() < 0.5) {
            setTimeout(() => spawnStar(), 200 + Math.random() * 400);
          }
        }
        scheduleNext();
      }, delay);
    }
    scheduleNext();

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      const stars = starsRef.current;

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.life++;

        // Store trail position
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 25) s.trail.shift();

        // Move
        s.x += s.vx;
        s.y += s.vy;

        // Fade curve: bright in middle, fade at start and end
        const lifeRatio = s.life / s.maxLife;
        const fade = lifeRatio < 0.1
          ? lifeRatio / 0.1
          : lifeRatio > 0.7
          ? 1 - (lifeRatio - 0.7) / 0.3
          : 1;
        const alpha = fade * s.brightness;

        // Draw trail
        if (s.trail.length > 1) {
          for (let j = 1; j < s.trail.length; j++) {
            const t = j / s.trail.length;
            const trailAlpha = t * t * alpha * 0.6;
            const trailWidth = s.size * t;

            ctx.beginPath();
            ctx.moveTo(s.trail[j - 1].x, s.trail[j - 1].y);
            ctx.lineTo(s.trail[j].x, s.trail[j].y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${trailAlpha})`;
            ctx.lineWidth = trailWidth;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        }

        // Draw head with glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 255, 230, ${alpha})`;
        ctx.shadowColor = `rgba(52, 211, 153, ${alpha * 0.8})`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Remove dead stars
        if (s.life >= s.maxLife || s.x < -50 || s.x > canvas!.width + 50 || s.y > canvas!.height + 50) {
          stars.splice(i, 1);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(timerRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2, opacity: 0.8 }}
    />
  );
}
