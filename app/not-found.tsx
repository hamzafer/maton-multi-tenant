"use client";

import { useEffect, useRef, useState } from "react";

function GlitchText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?01";

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const arr = text.split("");
        const idx = Math.floor(Math.random() * arr.length);
        arr[idx] = chars[Math.floor(Math.random() * chars.length)];
        setDisplay(arr.join(""));
        setTimeout(() => setDisplay(text), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{display}</span>;
}

function FloatingNodes() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      cx: 50 + Math.cos((i / 12) * Math.PI * 2) * (30 + Math.random() * 15),
      cy: 50 + Math.sin((i / 12) * Math.PI * 2) * (30 + Math.random() * 15),
      r: 1.5 + Math.random() * 2,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
    }))
  );

  const connections = nodes.flatMap((a, i) =>
    nodes.slice(i + 1).filter((b) => {
      const d = Math.sqrt((a.cx - b.cx) ** 2 + (a.cy - b.cy) ** 2);
      return d < 35;
    }).map((b) => ({ x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, key: `${a.id}-${b.id}` }))
  );

  return (
    <svg ref={svgRef} viewBox="0 0 100 100" className="w-64 h-64 mb-8">
      {/* Broken connection lines */}
      {connections.map((c) => (
        <line
          key={c.key}
          x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke="#34d399"
          strokeWidth="0.3"
          opacity="0.15"
          strokeDasharray="2 3"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0" to="10"
            dur="3s"
            repeatCount="indefinite"
          />
        </line>
      ))}

      {/* Center broken node */}
      <circle cx="50" cy="50" r="6" fill="none" stroke="#34d399" strokeWidth="0.5" opacity="0.3" strokeDasharray="3 2">
        <animate attributeName="r" values="6;7;6" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="50" y="52" textAnchor="middle" fill="#34d399" fontSize="5" opacity="0.5" fontFamily="monospace">?</text>

      {/* Floating disconnected nodes */}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="#34d399" opacity="0.2">
            <animate
              attributeName="opacity"
              values="0.1;0.4;0.1"
              dur={`${n.duration}s`}
              begin={`${n.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={n.cx} cy={n.cy} r={n.r * 2.5} fill="none" stroke="#34d399" strokeWidth="0.2" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0.15;0"
              dur={`${n.duration}s`}
              begin={`${n.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={`${n.r * 2};${n.r * 4};${n.r * 2}`}
              dur={`${n.duration}s`}
              begin={`${n.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center relative overflow-hidden">
      <div className="bg-mesh" />
      <div className="relative z-10 flex flex-col items-center">
        <FloatingNodes />

        <h1 className="text-[72px] font-bold tracking-tighter text-text-primary mb-1 leading-none" style={{ textShadow: "0 0 60px rgba(52,211,153,0.15)" }}>
          <GlitchText text="404" />
        </h1>

        <p className="text-[15px] text-text-secondary mb-2 font-medium">Connection not found</p>
        <p className="text-[12px] text-text-muted mb-8 font-mono max-w-xs text-center">
          The API endpoint you requested doesn&apos;t exist in our gateway.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent/15 border border-accent/20 hover:border-accent/30 text-accent text-[13px] font-medium px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Return to gateway
        </a>
      </div>
    </div>
  );
}
