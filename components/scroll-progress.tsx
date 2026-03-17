"use client";

import { useEffect, useState, useRef } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function handleScroll() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (docHeight <= 50) {
          // Page doesn't scroll meaningfully
          setVisible(false);
          return;
        }

        setVisible(true);
        setProgress(Math.min(scrollTop / docHeight, 1));
      });
    }

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!visible) return null;

  const pct = progress * 100;
  const isComplete = progress >= 0.99;

  return (
    <div className="scroll-progress-track">
      <div
        className={`scroll-progress-fill ${isComplete ? "scroll-progress-complete" : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
