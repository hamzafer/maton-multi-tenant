"use client";

import { useRef, useCallback, type ReactNode, type MouseEvent } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function SpotlightTable({ children, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouse = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    container.style.setProperty("--spotlight-x", `${x}px`);
    container.style.setProperty("--spotlight-y", `${y}px`);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouse}
      className={`spotlight-table ${className}`}
    >
      {children}
    </div>
  );
}
