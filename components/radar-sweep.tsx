"use client";

import { useEffect, useRef, useState } from "react";

interface RadarBlip {
  angle: number; // radians
  distance: number; // 0-1 from center
  color: string;
  label: string;
  intensity: number; // 0-1, fades after sweep passes
}

interface RadarSweepProps {
  /** Number of active connections to show as blips */
  connectionCount: number;
  /** Size in pixels */
  size?: number;
}

const APP_BLIPS = [
  { label: "Sheets", color: "#34A853", baseAngle: 0.8 },
  { label: "Slack", color: "#E01E5A", baseAngle: 2.1 },
  { label: "Gmail", color: "#EA4335", baseAngle: 3.5 },
  { label: "Notion", color: "#FFFFFF", baseAngle: 4.6 },
  { label: "GitHub", color: "#FFFFFF", baseAngle: 5.8 },
];

export default function RadarSweep({ connectionCount, size = 200 }: RadarSweepProps) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [blips, setBlips] = useState<RadarBlip[]>([]);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef(0);

  // Generate blips based on connection count
  useEffect(() => {
    const newBlips: RadarBlip[] = APP_BLIPS.slice(0, Math.min(connectionCount, 5)).map((app, i) => ({
      angle: app.baseAngle + (Math.random() - 0.5) * 0.3,
      distance: 0.35 + Math.random() * 0.5,
      color: app.color,
      label: app.label,
      intensity: 0,
    }));
    setBlips(newBlips);
  }, [connectionCount]);

  // Sweep animation
  useEffect(() => {
    function animate(time: number) {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setSweepAngle((prev) => {
        const next = prev + delta * 0.001; // ~1 revolution per 6.28 seconds
        return next % (Math.PI * 2);
      });

      // Update blip intensities — glow when sweep passes over them
      setBlips((prev) =>
        prev.map((blip) => {
          const sweepNow = (sweepAngle + delta * 0.001) % (Math.PI * 2);
          const angleDiff = Math.abs(sweepNow - blip.angle) % (Math.PI * 2);
          const minDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
          // If sweep just passed this blip, boost intensity
          if (minDiff < 0.15) {
            return { ...blip, intensity: 1 };
          }
          // Decay
          return { ...blip, intensity: Math.max(0, blip.intensity - 0.008) };
        })
      );

      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [sweepAngle]);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 8;

  // Sweep line end point
  const sweepX = cx + Math.cos(sweepAngle) * maxR;
  const sweepY = cy + Math.sin(sweepAngle) * maxR;

  // Sweep trail arc (60° behind the sweep line)
  const trailAngle = 1.05; // radians of trail
  const trailStartAngle = sweepAngle - trailAngle;

  function describeArc(startAngle: number, endAngle: number, radius: number) {
    const x1 = cx + Math.cos(startAngle) * radius;
    const y1 = cy + Math.sin(startAngle) * radius;
    const x2 = cx + Math.cos(endAngle) * radius;
    const y2 = cy + Math.sin(endAngle) * radius;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="radar-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Sweep gradient — fades from transparent to accent */}
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(52,211,153,0)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.15)" />
          </linearGradient>
          {/* Radial fade for the sweep cone */}
          <radialGradient id="sweepRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(52,211,153,0)" />
            <stop offset="40%" stopColor="rgba(52,211,153,0.04)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.12)" />
          </radialGradient>
          {/* Blip glow filter */}
          <filter id="blipGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx={cx} cy={cy} r={maxR} fill="rgba(52,211,153,0.015)" stroke="rgba(52,211,153,0.06)" strokeWidth="1" />

        {/* Range rings */}
        {[0.25, 0.5, 0.75].map((r) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={maxR * r}
            fill="none"
            stroke="rgba(52,211,153,0.04)"
            strokeWidth="0.5"
            strokeDasharray="3 4"
          />
        ))}

        {/* Cross hairs */}
        <line x1={cx} y1={cy - maxR} x2={cx} y2={cy + maxR} stroke="rgba(52,211,153,0.04)" strokeWidth="0.5" />
        <line x1={cx - maxR} y1={cy} x2={cx + maxR} y2={cy} stroke="rgba(52,211,153,0.04)" strokeWidth="0.5" />

        {/* Sweep cone (filled arc) */}
        <path
          d={describeArc(trailStartAngle, sweepAngle, maxR)}
          fill="url(#sweepRadial)"
        />

        {/* Sweep line */}
        <line
          x1={cx}
          y1={cy}
          x2={sweepX}
          y2={sweepY}
          stroke="rgba(52,211,153,0.5)"
          strokeWidth="1"
        />

        {/* Connection blips */}
        {blips.map((blip, i) => {
          const bx = cx + Math.cos(blip.angle) * maxR * blip.distance;
          const by = cy + Math.sin(blip.angle) * maxR * blip.distance;
          const alpha = 0.15 + blip.intensity * 0.85;

          return (
            <g key={i}>
              {/* Glow ring */}
              {blip.intensity > 0.3 && (
                <circle
                  cx={bx}
                  cy={by}
                  r={6 + blip.intensity * 6}
                  fill="none"
                  stroke={blip.color}
                  strokeWidth="0.5"
                  opacity={blip.intensity * 0.3}
                  filter="url(#blipGlow)"
                />
              )}
              {/* Blip dot */}
              <circle
                cx={bx}
                cy={by}
                r={2 + blip.intensity * 1.5}
                fill={blip.color}
                opacity={alpha}
              />
              {/* Label (only when bright) */}
              {blip.intensity > 0.5 && (
                <text
                  x={bx + 8}
                  y={by + 3}
                  fill={blip.color}
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                  opacity={blip.intensity * 0.7}
                >
                  {blip.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill="#34d399" opacity="0.6" />
        <circle cx={cx} cy={cy} r="6" fill="none" stroke="#34d399" strokeWidth="0.5" opacity="0.3" />
      </svg>
    </div>
  );
}
