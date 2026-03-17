"use client";

interface Props {
  size?: number;
  className?: string;
}

export default function OrbitalSpinner({ size = 40, className = "" }: Props) {
  const r1 = size * 0.38;
  const r2 = size * 0.28;
  const r3 = size * 0.18;
  const center = size / 2;
  const dotR = size * 0.045;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      {/* Outer ring */}
      <circle cx={center} cy={center} r={r1} fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth="0.5" />
      {/* Middle ring */}
      <circle cx={center} cy={center} r={r2} fill="none" stroke="rgba(52,211,153,0.06)" strokeWidth="0.5" strokeDasharray="2 3" />
      {/* Inner ring */}
      <circle cx={center} cy={center} r={r3} fill="none" stroke="rgba(52,211,153,0.04)" strokeWidth="0.5" />

      {/* Center dot */}
      <circle cx={center} cy={center} r={dotR * 1.5} fill="#34d399" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Orbiting dot 1 — outer, fast */}
      <circle r={dotR * 1.2} fill="#34d399" opacity="0.8">
        <animateMotion
          dur="1.8s"
          repeatCount="indefinite"
          path={`M${center},${center - r1} A${r1},${r1} 0 1 1 ${center - 0.01},${center - r1}`}
        />
      </circle>

      {/* Orbiting dot 2 — middle, medium, reverse */}
      <circle r={dotR} fill="#34d399" opacity="0.5">
        <animateMotion
          dur="2.5s"
          repeatCount="indefinite"
          path={`M${center},${center + r2} A${r2},${r2} 0 1 1 ${center + 0.01},${center + r2}`}
        />
      </circle>

      {/* Orbiting dot 3 — inner, slow */}
      <circle r={dotR * 0.8} fill="#34d399" opacity="0.3">
        <animateMotion
          dur="3.2s"
          repeatCount="indefinite"
          path={`M${center + r3},${center} A${r3},${r3} 0 1 1 ${center + r3 + 0.01},${center}`}
        />
      </circle>

      {/* Trail arc on outer ring */}
      <circle
        cx={center} cy={center} r={r1}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={`${r1 * 0.8} ${r1 * 6}`}
        opacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${center} ${center}`}
          to={`360 ${center} ${center}`}
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
