"use client";

import { useEffect, useState, useRef } from "react";
import { playCrtOpen } from "@/lib/sounds";

type Phase = "idle" | "scanline" | "logo" | "text" | "progress" | "fadeout" | "done";

const BOOT_KEY = "maton-booted";

export default function BootSplash() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const progressRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Check if we should show the splash
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(BOOT_KEY)) {
        setShouldShow(true);
        sessionStorage.setItem(BOOT_KEY, "1");
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  // Run boot sequence
  useEffect(() => {
    if (!shouldShow) return;

    // Phase 1: scanline
    setPhase("scanline");
    playCrtOpen();

    timerRef.current = setTimeout(() => {
      // Phase 2: logo
      setPhase("logo");

      timerRef.current = setTimeout(() => {
        // Phase 3: text
        setPhase("text");

        timerRef.current = setTimeout(() => {
          // Phase 4: progress
          setPhase("progress");

          // Animate progress bar
          let p = 0;
          progressRef.current = setInterval(() => {
            p += Math.random() * 15 + 5;
            if (p >= 100) {
              p = 100;
              clearInterval(progressRef.current);

              // Phase 5: fadeout
              setTimeout(() => {
                setPhase("fadeout");
                setTimeout(() => setPhase("done"), 600);
              }, 300);
            }
            setProgress(Math.min(p, 100));
          }, 120);
        }, 600);
      }, 800);
    }, 500);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [shouldShow]);

  if (!shouldShow || phase === "done") return null;

  return (
    <div className={`boot-splash ${phase === "fadeout" ? "boot-fadeout" : ""}`}>
      {/* Scan line */}
      {phase === "scanline" && (
        <div className="boot-scanline" />
      )}

      {/* Logo + text content */}
      {(phase === "logo" || phase === "text" || phase === "progress" || phase === "fadeout") && (
        <div className="boot-content">
          {/* Logo */}
          <div className={`boot-logo ${phase !== "logo" || true ? "boot-logo-visible" : ""}`}>
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="4" width="14" height="14" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.9">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
              </rect>
              <rect x="22" y="4" width="14" height="14" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.7">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
              </rect>
              <rect x="4" y="22" width="14" height="14" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.5">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" begin="1s" repeatCount="indefinite" />
              </rect>
              <rect x="22" y="22" width="14" height="14" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" begin="1.5s" repeatCount="indefinite" />
              </rect>
              {/* Connection lines */}
              <line x1="18" y1="11" x2="22" y2="11" stroke="#34d399" strokeWidth="1" opacity="0.3" />
              <line x1="11" y1="18" x2="11" y2="22" stroke="#34d399" strokeWidth="1" opacity="0.3" />
              <line x1="29" y1="18" x2="29" y2="22" stroke="#34d399" strokeWidth="1" opacity="0.2" />
              <line x1="18" y1="29" x2="22" y2="29" stroke="#34d399" strokeWidth="1" opacity="0.2" />
            </svg>

            <span className="boot-logo-text">MATON</span>
          </div>

          {/* Init text */}
          {(phase === "text" || phase === "progress" || phase === "fadeout") && (
            <div className="boot-init-text">
              <span className="boot-init-line">Initializing API gateway</span>
              {(phase === "progress" || phase === "fadeout") && (
                <span className="boot-init-line boot-init-detail">
                  Loading OAuth subsystem... {Math.round(progress)}%
                </span>
              )}
            </div>
          )}

          {/* Progress bar */}
          {(phase === "progress" || phase === "fadeout") && (
            <div className="boot-progress-track">
              <div
                className="boot-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Scan lines overlay (always) */}
      <div className="boot-lines" />
    </div>
  );
}
