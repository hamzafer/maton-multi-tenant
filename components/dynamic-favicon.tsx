"use client";

import { useEffect, useRef, useCallback } from "react";

const SIZE = 32;
const HALF = SIZE / 2;

/** Draw the Maton grid logo onto a canvas context */
function drawLogo(ctx: CanvasRenderingContext2D, glow: number) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  const pad = 4;
  const gap = 2;
  const cellSize = (SIZE - pad * 2 - gap) / 2;

  // Glow background circle
  if (glow > 0) {
    const gradient = ctx.createRadialGradient(HALF, HALF, 2, HALF, HALF, HALF);
    gradient.addColorStop(0, `rgba(52, 211, 153, ${0.15 * glow})`);
    gradient.addColorStop(1, "rgba(52, 211, 153, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(HALF, HALF, HALF, 0, Math.PI * 2);
    ctx.fill();
  }

  // Four grid squares
  const positions = [
    [pad, pad],
    [pad + cellSize + gap, pad],
    [pad, pad + cellSize + gap],
    [pad + cellSize + gap, pad + cellSize + gap],
  ];

  const opacities = [0.9, 0.65, 0.5, 0.3];

  positions.forEach(([x, y], i) => {
    const alpha = opacities[i] + glow * 0.1;
    const r = 3;

    ctx.beginPath();
    ctx.roundRect(x, y, cellSize, cellSize, r);
    ctx.strokeStyle = `rgba(52, 211, 153, ${Math.min(alpha, 1)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle fill
    ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.12})`;
    ctx.fill();
  });

  // Connection lines between squares
  ctx.strokeStyle = `rgba(52, 211, 153, ${0.25 + glow * 0.15})`;
  ctx.lineWidth = 1;

  // Horizontal
  ctx.beginPath();
  ctx.moveTo(pad + cellSize, pad + cellSize / 2);
  ctx.lineTo(pad + cellSize + gap, pad + cellSize / 2);
  ctx.stroke();

  // Vertical
  ctx.beginPath();
  ctx.moveTo(pad + cellSize / 2, pad + cellSize);
  ctx.lineTo(pad + cellSize / 2, pad + cellSize + gap);
  ctx.stroke();
}

/** Draw a notification dot in top-right corner */
function drawNotificationDot(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(SIZE - 6, 6, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#34d399";
  ctx.fill();
  ctx.strokeStyle = "#060608";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function setFavicon(canvas: HTMLCanvasElement) {
  const url = canvas.toDataURL("image/png");
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }
  link.href = url;
}

export default function DynamicFavicon() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const hiddenRef = useRef(false);
  const titleTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const originalTitleRef = useRef("");
  const titleFlipRef = useRef(false);

  const createCanvas = useCallback(() => {
    if (canvasRef.current) return canvasRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvasRef.current = canvas;
    return canvas;
  }, []);

  useEffect(() => {
    const canvas = createCanvas();
    const ctx = canvas.getContext("2d")!;
    originalTitleRef.current = document.title;

    let frame = 0;

    function animate() {
      frame++;
      // Breathing glow: slow sine wave
      const glow = (Math.sin(frame * 0.03) + 1) / 2; // 0-1

      drawLogo(ctx, glow);

      if (hiddenRef.current) {
        drawNotificationDot(ctx);
      }

      setFavicon(canvas);
      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Tab visibility
    function handleVisibility() {
      if (document.hidden) {
        hiddenRef.current = true;

        // Start title alternation
        const baseTitle = document.title;
        titleFlipRef.current = false;

        titleTimerRef.current = setInterval(() => {
          titleFlipRef.current = !titleFlipRef.current;
          document.title = titleFlipRef.current
            ? "● Gateway Active"
            : baseTitle;
        }, 2000);
      } else {
        hiddenRef.current = false;

        // Restore title
        clearInterval(titleTimerRef.current);
        // Brief welcome flash
        const prevTitle = originalTitleRef.current || "Maton";
        document.title = "◈ Welcome back";
        setTimeout(() => {
          document.title = prevTitle;
        }, 1500);
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(titleTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [createCanvas]);

  return null; // Renders nothing — purely behavioral
}
