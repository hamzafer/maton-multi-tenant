"use client";

import { useEffect, useRef, useState } from "react";
import { playHeartbeat } from "@/lib/sounds";
import { unlockAchievement } from "@/components/achievements";

// ECG waveform shape — one heartbeat cycle
// Returns y offset (0 = baseline) for a given t in [0, 1]
function ecgWave(t: number): number {
  // P wave (small bump)
  if (t < 0.12) return Math.sin(t / 0.12 * Math.PI) * 0.15;
  // Flat
  if (t < 0.18) return 0;
  // Q dip
  if (t < 0.22) return -((t - 0.18) / 0.04) * 0.12;
  // R spike (tall sharp peak)
  if (t < 0.28) {
    const p = (t - 0.22) / 0.06;
    return -0.12 + p * 1.12; // rises from -0.12 to 1.0
  }
  if (t < 0.34) {
    const p = (t - 0.28) / 0.06;
    return 1.0 - p * 1.3; // drops from 1.0 to -0.3
  }
  // S recovery
  if (t < 0.40) {
    const p = (t - 0.34) / 0.06;
    return -0.3 + p * 0.3; // back to 0
  }
  // T wave (medium bump)
  if (t < 0.58) {
    const p = (t - 0.40) / 0.18;
    return Math.sin(p * Math.PI) * 0.25;
  }
  // Flat until next beat
  return 0;
}

function HeartbeatCanvas({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cycleWidth = 120; // pixels per heartbeat cycle
    const speed = 0.6; // pixels per frame

    function draw() {
      ctx.clearRect(0, 0, width, height);
      offsetRef.current += speed;
      if (offsetRef.current >= cycleWidth) offsetRef.current -= cycleWidth;

      const midY = height / 2;
      const amplitude = height * 0.35;

      // Glow layer
      ctx.shadowColor = "rgba(52, 211, 153, 0.6)";
      ctx.shadowBlur = 6;
      ctx.strokeStyle = "rgba(52, 211, 153, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const worldX = x + offsetRef.current;
        const t = ((worldX % cycleWidth) + cycleWidth) % cycleWidth / cycleWidth;
        const y = midY - ecgWave(t) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Bright core layer (no shadow)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(52, 211, 153, 0.9)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const worldX = x + offsetRef.current;
        const t = ((worldX % cycleWidth) + cycleWidth) % cycleWidth / cycleWidth;
        const y = midY - ecgWave(t) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Leading dot (rightmost point)
      const leadT = ((width + offsetRef.current) % cycleWidth) / cycleWidth;
      const leadY = midY - ecgWave(leadT) * amplitude;
      ctx.beginPath();
      ctx.arc(width - 1, leadY, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#34d399";
      ctx.shadowColor = "rgba(52, 211, 153, 0.8)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="block"
    />
  );
}

export default function HeartbeatBar() {
  const [expanded, setExpanded] = useState(false);
  const [barWidth, setBarWidth] = useState(280);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure available width
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setBarWidth(Math.min(containerRef.current.offsetWidth - 32, 400));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Random status values for the demo
  const [stats] = useState(() => ({
    uptime: "99.97%",
    latency: `${Math.floor(Math.random() * 40 + 25)}ms`,
    connections: Math.floor(Math.random() * 8 + 2),
    requests: Math.floor(Math.random() * 500 + 100),
  }));

  return (
    <div className="heartbeat-bar" ref={containerRef}>
      <div
        className={`heartbeat-bar-inner ${expanded ? "heartbeat-expanded" : ""}`}
        onClick={() => { playHeartbeat(); setExpanded((p) => { if (!p) unlockAchievement("heartbeat"); return !p; }); }}
      >
        {/* Minimized: just the heartbeat line + pulse dot */}
        <div className="heartbeat-row">
          <div className="heartbeat-pulse-dot" />
          <HeartbeatCanvas width={barWidth} height={28} />
          <span className="heartbeat-label">SYS</span>
        </div>

        {/* Expanded: status details */}
        {expanded && (
          <div className="heartbeat-details">
            <div className="heartbeat-stat">
              <span className="heartbeat-stat-label">Uptime</span>
              <span className="heartbeat-stat-value heartbeat-stat-good">{stats.uptime}</span>
            </div>
            <div className="heartbeat-stat-divider" />
            <div className="heartbeat-stat">
              <span className="heartbeat-stat-label">Latency</span>
              <span className="heartbeat-stat-value">{stats.latency}</span>
            </div>
            <div className="heartbeat-stat-divider" />
            <div className="heartbeat-stat">
              <span className="heartbeat-stat-label">Active</span>
              <span className="heartbeat-stat-value">{stats.connections}</span>
            </div>
            <div className="heartbeat-stat-divider" />
            <div className="heartbeat-stat">
              <span className="heartbeat-stat-label">Requests</span>
              <span className="heartbeat-stat-value">{stats.requests}</span>
            </div>
            <div className="heartbeat-stat-divider" />
            <div className="heartbeat-stat">
              <span className="heartbeat-stat-label">Secrets</span>
              <span className="heartbeat-stat-value" style={{ fontSize: 10, opacity: 0.4 }}>Press ?</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
