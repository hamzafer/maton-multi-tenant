"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_ACHIEVEMENTS = 10;
const CELEBRATION_KEY = "maton-completionist-celebrated";

// Golden confetti burst
function fireGoldenConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ["#fbbf24", "#f59e0b", "#fcd34d", "#d97706", "#fffbeb", "#34d399", "#fef3c7"];

  interface Particle {
    x: number; y: number; vx: number; vy: number;
    r: number; color: string; rotation: number; rotSpeed: number;
    life: number; maxLife: number; shape: "rect" | "circle" | "star";
  }

  const particles: Particle[] = [];

  // Multiple burst points
  const origins = [
    { x: canvas.width * 0.3, y: canvas.height * 0.5 },
    { x: canvas.width * 0.5, y: canvas.height * 0.4 },
    { x: canvas.width * 0.7, y: canvas.height * 0.5 },
  ];

  origins.forEach((origin) => {
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      particles.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        r: 3 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 0,
        maxLife: 80 + Math.random() * 60,
        shape: ["rect", "circle", "star"][Math.floor(Math.random() * 3)] as Particle["shape"],
      });
    }
  });

  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of particles) {
      p.life++;
      if (p.life >= p.maxLife) continue;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;

      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Star shape
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const a = (j * Math.PI * 2) / 5 - Math.PI / 2;
          const r = j % 2 === 0 ? p.r : p.r * 0.4;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    if (alive) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(animate);
}

// Grand ascending arpeggio
function playVictorySound() {
  try {
    const ctx = new AudioContext();
    // C major arpeggio ascending two octaves + final chord
    const notes = [261, 329, 392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 5 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
    // Final sustain chord (C major)
    [523, 659, 784].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const t = ctx.currentTime + 0.8;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    });
  } catch {}
}

export default function Completionist() {
  const [celebrating, setCelebrating] = useState(false);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Watch for achievement-count data attribute changes
    observerRef.current = new MutationObserver(() => {
      const count = parseInt(document.documentElement.dataset.achievementCount || "0", 10);
      const total = parseInt(document.documentElement.dataset.achievementTotal || "0", 10);

      if (count >= total && total > 0) {
        // Check if already celebrated this session
        try {
          if (sessionStorage.getItem(CELEBRATION_KEY)) return;
          sessionStorage.setItem(CELEBRATION_KEY, "1");
        } catch {}

        setCelebrating(true);
        playVictorySound();

        // Fire confetti after a brief moment
        setTimeout(() => {
          if (canvasRef.current) {
            fireGoldenConfetti(canvasRef.current);
          }
        }, 200);

        // Start fade after 4s
        setTimeout(() => setFading(true), 4000);
        // Remove after fade
        setTimeout(() => setCelebrating(false), 5000);
      }
    });

    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-achievement-count"],
    });

    return () => observerRef.current?.disconnect();
  }, []);

  if (!celebrating) return null;

  return (
    <div className={`completionist-overlay ${fading ? "completionist-fade" : ""}`}>
      <canvas ref={canvasRef} className="completionist-canvas" />
      <div className="completionist-message">
        <div className="completionist-crown">👑</div>
        <h2 className="completionist-title">100% Complete</h2>
        <p className="completionist-subtitle">All {TOTAL_ACHIEVEMENTS} achievements unlocked</p>
        <p className="completionist-tagline">You found everything.</p>
      </div>
    </div>
  );
}
