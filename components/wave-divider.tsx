"use client";

interface Props {
  className?: string;
  color?: string;
  flip?: boolean;
  speed?: number;
}

export default function WaveDivider({
  className = "",
  color = "rgba(52,211,153,0.08)",
  flip = false,
  speed = 20,
}: Props) {
  return (
    <div
      className={`w-full overflow-hidden pointer-events-none ${className}`}
      style={{
        transform: flip ? "scaleY(-1)" : undefined,
        height: 48,
      }}
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="w-[200%] h-full"
        style={{
          animation: `waveSlide ${speed}s linear infinite`,
        }}
      >
        <defs>
          <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="25%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.6" />
            <stop offset="75%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,32 C120,16 240,48 360,32 C480,16 600,48 720,32 C840,16 960,48 1080,32 C1200,16 1320,48 1440,32 L1440,48 L0,48 Z"
          fill="url(#waveGrad)"
        />
        <path
          d="M0,36 C90,24 180,44 270,36 C360,28 450,44 540,36 C630,28 720,44 810,36 C900,28 990,44 1080,36 C1170,28 1260,44 1350,36 C1440,28 1440,48 1440,48 L0,48 Z"
          fill={color}
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
