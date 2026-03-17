"use client";

import { useEffect, useRef } from "react";

// Elements that respond to the magnetic field
const MAGNETIC_SELECTOR = "button, a, .app-card, .glass-card, .btn-press";
const MAX_DISTANCE = 60; // px — cursor must be within this range
const STRENGTH = 0.3; // 0-1 — how far the element moves toward cursor (fraction of distance)

interface TrackedEl {
  el: HTMLElement;
  rect: DOMRect;
  originalTransform: string;
}

export default function MagneticField() {
  const activeRef = useRef<TrackedEl | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function getCenter(rect: DOMRect) {
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Find the closest magnetic element under/near the cursor
      const target = (e.target as HTMLElement)?.closest?.(MAGNETIC_SELECTOR) as HTMLElement | null;

      if (target && !target.closest(".crt-overlay, .shortcut-overlay, .boot-splash")) {
        const rect = target.getBoundingClientRect();
        const center = getCenter(rect);
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if cursor is within the magnetic radius (expanded beyond the element bounds)
        const magneticRadius = Math.max(rect.width, rect.height) / 2 + MAX_DISTANCE;

        if (dist < magneticRadius) {
          // Release previous if different element
          if (activeRef.current && activeRef.current.el !== target) {
            releaseElement(activeRef.current);
          }

          const moveX = dx * STRENGTH;
          const moveY = dy * STRENGTH;

          // Don't override existing transforms — compose on top
          if (!target.dataset.magneticOriginal) {
            target.dataset.magneticOriginal = target.style.transform || "";
          }

          target.style.transform = `${target.dataset.magneticOriginal} translate(${moveX}px, ${moveY}px)`.trim();
          target.classList.add("magnetic-active");

          activeRef.current = {
            el: target,
            rect,
            originalTransform: target.dataset.magneticOriginal || "",
          };
          return;
        }
      }

      // If we're not near any element, release the active one
      if (activeRef.current) {
        releaseElement(activeRef.current);
        activeRef.current = null;
      }
    }

    function releaseElement(tracked: TrackedEl) {
      tracked.el.style.transform = tracked.originalTransform;
      tracked.el.classList.remove("magnetic-active");
      delete tracked.el.dataset.magneticOriginal;
    }

    function handleMouseLeave() {
      if (activeRef.current) {
        releaseElement(activeRef.current);
        activeRef.current = null;
      }
    }

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
      if (activeRef.current) {
        releaseElement(activeRef.current);
      }
    };
  }, []);

  // This component renders nothing — it's purely behavioral
  return null;
}
