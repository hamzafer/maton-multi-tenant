"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const IDLE_TIMEOUT = 45000; // 45 seconds
const DIM_DURATION = 3000; // 3 second dim before screensaver

export default function Screensaver() {
  const [phase, setPhase] = useState<"active" | "dimming" | "screensaver">("active");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dimTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    clearTimeout(dimTimerRef.current);

    if (phase !== "active") {
      setPhase("active");
    }

    timerRef.current = setTimeout(() => {
      setPhase("dimming");
      dimTimerRef.current = setTimeout(() => {
        setPhase("screensaver");
      }, DIM_DURATION);
    }, IDLE_TIMEOUT);
  }, [phase]);

  // Idle detection
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

    function handleActivity() {
      resetTimer();
    }

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimeout(timerRef.current);
      clearTimeout(dimTimerRef.current);
    };
  }, [resetTimer]);

  // Lissajous canvas animation
  useEffect(() => {
    if (phase !== "screensaver") {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    // Slowly evolving parameters for infinite variety
    const params = {
      a: 3 + Math.random() * 2,
      b: 2 + Math.random() * 2,
      delta: Math.random() * Math.PI,
      // How fast params drift
      driftA: 0.0001 + Math.random() * 0.0002,
      driftB: 0.0001 + Math.random() * 0.0002,
      driftDelta: 0.0003 + Math.random() * 0.0003,
    };

    function draw() {
      // Fade the canvas slowly — creates trailing effect
      ctx.fillStyle = "rgba(3, 3, 4, 0.03)";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Evolve parameters
      params.a += Math.sin(t * params.driftA) * 0.002;
      params.b += Math.cos(t * params.driftB) * 0.002;
      params.delta += params.driftDelta;

      const cx = canvas!.width / 2;
      const cy = canvas!.height / 2;
      const scaleX = canvas!.width * 0.35;
      const scaleY = canvas!.height * 0.35;

      // Draw a segment of the curve each frame
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const tt = t + i * 0.01;
        const x = cx + Math.sin(params.a * tt + params.delta) * scaleX;
        const y = cy + Math.sin(params.b * tt) * scaleY;

        const nextT = tt + 0.01;
        const nx = cx + Math.sin(params.a * nextT + params.delta) * scaleX;
        const ny = cy + Math.sin(params.b * nextT) * scaleY;

        // Color shifts slowly through emerald spectrum
        const hue = 150 + Math.sin(t * 0.01) * 20; // 130-170 (teal → emerald → green)
        const lightness = 55 + Math.sin(t * 0.02 + i) * 15;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, 0.5)`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = `hsla(${hue}, 80%, ${lightness}%, 0.4)`;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Bright head dot
      const headX = cx + Math.sin(params.a * t + params.delta) * scaleX;
      const headY = cy + Math.sin(params.b * t) * scaleY;
      ctx.beginPath();
      ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200, 255, 230, 0.8)";
      ctx.shadowColor = "rgba(52, 211, 153, 0.6)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      t += 0.015;
      animRef.current = requestAnimationFrame(draw);
    }

    // Clear to black first
    ctx.fillStyle = "#030304";
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  // Wake on any interaction when in screensaver/dimming
  useEffect(() => {
    if (phase === "active") return;

    function wake() {
      setPhase("active");
      resetTimer();
    }

    // Use capture to catch events before anything else
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, wake, { capture: true, once: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, wake, { capture: true }));
    };
  }, [phase, resetTimer]);

  if (phase === "active") return null;

  return (
    <>
      {/* Dim overlay */}
      {phase === "dimming" && (
        <div className="screensaver-dim" />
      )}

      {/* Screensaver canvas */}
      {phase === "screensaver" && (
        <div className="screensaver-overlay">
          <canvas ref={canvasRef} className="screensaver-canvas" />
          <div className="screensaver-hint">
            Move mouse or press any key to wake
          </div>
        </div>
      )}
    </>
  );
}
