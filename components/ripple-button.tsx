"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { playClick } from "@/lib/sounds";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  sound?: boolean;
}

export default function RippleButton({ children, onClick, disabled, className = "", type = "button", sound = true }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (disabled) return;

    // Create ripple
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      btn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }

    if (sound) playClick();
    onClick?.();
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`ripple-container ${className}`}
    >
      {children}
    </button>
  );
}
