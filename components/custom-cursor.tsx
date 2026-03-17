"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "interactive" | "text";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Hide default cursor
    document.documentElement.classList.add("custom-cursor-active");

    function handleMove(e: MouseEvent) {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Detect what we're hovering
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        setMode("text");
      } else if (
        target.closest("button, a, [role='button'], .app-card, .btn-press, .sidebar-item")
      ) {
        setMode("interactive");
      } else {
        setMode("default");
      }
    }

    function handleDown() { setClicking(true); }
    function handleUp() { setClicking(false); }
    function handleLeave() { setVisible(false); }
    function handleEnter() { setVisible(true); }

    // Smooth ring follow
    function animate() {
      const lerp = 0.15;
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * lerp;
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px)`;
      }

      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [visible]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Dot — exact position, no lag */}
      <div
        ref={dotRef}
        className={`cursor-dot ${visible ? "cursor-visible" : ""} ${clicking ? "cursor-clicking" : ""} cursor-${mode}`}
      />
      {/* Ring — follows with lag */}
      <div
        ref={ringRef}
        className={`cursor-ring ${visible ? "cursor-visible" : ""} ${clicking ? "cursor-clicking" : ""} cursor-${mode}`}
      />
    </>
  );
}
