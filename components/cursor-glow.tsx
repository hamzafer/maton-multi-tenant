"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const visibleRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    function handleMove(e: MouseEvent) {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        glow!.style.opacity = "1";
      }
    }

    function handleLeave() {
      visibleRef.current = false;
      glow!.style.opacity = "0";
    }

    // Smooth follow with lerp
    let currentX = -200;
    let currentY = -200;

    function animate() {
      currentX += (posRef.current.x - currentX) * 0.15;
      currentY += (posRef.current.y - currentY) * 0.15;
      if (glow) {
        glow.style.transform = `translate(${currentX - 160}px, ${currentY - 160}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none z-[2] transition-opacity duration-500"
      style={{
        opacity: 0,
        background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, rgba(52,211,153,0.02) 40%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
