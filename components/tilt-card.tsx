"use client";

import { useRef, useState, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  glareOpacity = 0.12,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const rafRef = useRef<number>(0);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = cardRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0-1
        const y = (e.clientY - rect.top) / rect.height; // 0-1
        const rotateX = (0.5 - y) * maxTilt;
        const rotateY = (x - 0.5) * maxTilt;

        setStyle({
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
          transition: "transform 0.1s ease-out",
        });

        // Holographic glare — a light streak that follows the cursor
        const glareX = x * 100;
        const glareY = y * 100;
        setGlareStyle({
          opacity: glareOpacity,
          background: `radial-gradient(
            ellipse 120px 120px at ${glareX}% ${glareY}%,
            rgba(52, 211, 153, 0.5),
            rgba(129, 140, 248, 0.3) 40%,
            transparent 70%
          )`,
          transition: "opacity 0.2s ease",
        });
      });
    },
    [maxTilt, glareOpacity]
  );

  const handleLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
    });
    setGlareStyle({ opacity: 0, transition: "opacity 0.5s ease" });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card-wrapper ${className}`}
      style={{ ...style, willChange: "transform", transformStyle: "preserve-3d" }}
    >
      {children}
      {/* Holographic glare overlay */}
      <div
        className="tilt-card-glare"
        style={glareStyle}
      />
    </div>
  );
}
