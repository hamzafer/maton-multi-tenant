"use client";

import { useEffect } from "react";

export default function ScreenShake() {
  useEffect(() => {
    function handleEffect(e: Event) {
      const { type } = (e as CustomEvent).detail as { type: string };

      const main = document.querySelector("main");
      if (!main) return;

      // Remove any existing animation class first
      main.classList.remove("screen-shake", "screen-bounce");

      // Force reflow to restart animation
      void main.offsetWidth;

      if (type === "error") {
        main.classList.add("screen-shake");
      } else if (type === "success") {
        main.classList.add("screen-bounce");
      }

      // Clean up after animation
      const cleanup = () => {
        main.classList.remove("screen-shake", "screen-bounce");
        main.removeEventListener("animationend", cleanup);
      };
      main.addEventListener("animationend", cleanup);
    }

    window.addEventListener("screen-effect", handleEffect);
    return () => window.removeEventListener("screen-effect", handleEffect);
  }, []);

  return null;
}
