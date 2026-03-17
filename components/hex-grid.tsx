"use client";

import { useEffect, useRef, useState } from "react";

const HEX_SIZE = 28;
const HEX_GAP = 3;

// Pointy-top hexagon
function hexPoints(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return points.join(" ");
}

export default function HexGrid() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    function resize() {
      setDims({ w: window.innerWidth, h: window.innerHeight });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Periodic pulse wave (synced with activity refresh interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => p + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (dims.w === 0) return null;

  const hexW = HEX_SIZE * Math.sqrt(3) + HEX_GAP;
  const hexH = HEX_SIZE * 1.5 + HEX_GAP;
  const cols = Math.ceil(dims.w / hexW) + 2;
  const rows = Math.ceil(dims.h / hexH) + 2;

  const centerX = dims.w / 2;
  const centerY = dims.h / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  const hexagons: { cx: number; cy: number; dist: number }[] = [];

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * hexW + (row % 2 ? hexW / 2 : 0);
      const cy = row * hexH;
      const dist = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
      hexagons.push({ cx, cy, dist });
    }
  }

  return (
    <svg
      ref={svgRef}
      className="hex-grid-svg"
      width={dims.w}
      height={dims.h}
      viewBox={`0 0 ${dims.w} ${dims.h}`}
    >
      {hexagons.map((hex, i) => {
        // Normalize distance for wave timing
        const normDist = hex.dist / maxDist;
        // Pulse wave: opacity rises then falls based on distance from center
        // Uses pulse counter to create a ripple
        const wavePhase = (pulse * 0.7 - normDist * 2) % 1;
        const waveBright = wavePhase > 0 && wavePhase < 0.3
          ? Math.sin(wavePhase / 0.3 * Math.PI) * 0.06
          : 0;
        const baseOpacity = 0.02 + (1 - normDist) * 0.015;
        const opacity = baseOpacity + waveBright;

        return (
          <polygon
            key={i}
            points={hexPoints(hex.cx, hex.cy, HEX_SIZE * 0.45)}
            fill="none"
            stroke="#34d399"
            strokeWidth="0.5"
            opacity={opacity}
            className="hex-cell"
          />
        );
      })}
    </svg>
  );
}
