"use client";

import { useEffect, useRef } from "react";

interface Props {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function AnimatedLogo({ size = 28, className = "", animate = true }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animate || !svgRef.current) return;
    const paths = svgRef.current.querySelectorAll("path, rect");
    paths.forEach((path, i) => {
      const el = path as SVGElement;
      el.style.opacity = "0";
      el.style.transition = `opacity 0.4s ease ${i * 0.15}s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.15}s`;
      el.style.transform = "scale(0.8)";
      el.style.transformOrigin = "center";
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      });
    });
  }, [animate]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      {/* Top-left square */}
      <rect x="2" y="2" width="12" height="12" rx="3" stroke="#34d399" strokeWidth="1.5" fill="rgba(52,211,153,0.08)">
        {animate && (
          <animate attributeName="rx" values="3;4;3" dur="4s" repeatCount="indefinite" />
        )}
      </rect>

      {/* Top-right square */}
      <rect x="18" y="2" width="12" height="12" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.6" fill="rgba(52,211,153,0.04)">
        {animate && (
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" begin="0.5s" repeatCount="indefinite" />
        )}
      </rect>

      {/* Bottom-left square */}
      <rect x="2" y="18" width="12" height="12" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.6" fill="rgba(52,211,153,0.04)">
        {animate && (
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3.5s" begin="1s" repeatCount="indefinite" />
        )}
      </rect>

      {/* Bottom-right square — missing/forming */}
      <rect x="18" y="18" width="12" height="12" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 2" fill="none">
        {animate && (
          <>
            <animate attributeName="stroke-dashoffset" values="0;12" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.35;0.15" dur="4s" repeatCount="indefinite" />
          </>
        )}
      </rect>

      {/* Center connection dot */}
      <circle cx="16" cy="16" r="2" fill="#34d399" opacity="0.5">
        {animate && (
          <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Connection lines */}
      <path d="M14 8h4M14 24h4M8 14v4M24 14v4" stroke="#34d399" strokeWidth="1" strokeLinecap="round" opacity="0.25">
        {animate && (
          <animate attributeName="opacity" values="0.15;0.4;0.15" dur="3s" repeatCount="indefinite" />
        )}
      </path>
    </svg>
  );
}
