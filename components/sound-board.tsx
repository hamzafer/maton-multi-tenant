"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  playClick, playHover, playSuccess, playError,
  playConnect, playNav, playScramble, playHeartbeat,
  playCrtOpen, playCrtKey, playMatrixEnter,
  playStarWhoosh, playRadarPing,
} from "@/lib/sounds";

interface SoundDef {
  name: string;
  fn: () => void;
  color: string;
  icon: string;
}

const SOUNDS: SoundDef[] = [
  { name: "Click", fn: playClick, color: "#34d399", icon: "◉" },
  { name: "Hover", fn: playHover, color: "#6ee7b7", icon: "◎" },
  { name: "Success", fn: playSuccess, color: "#34d399", icon: "✓" },
  { name: "Error", fn: playError, color: "#f87171", icon: "✗" },
  { name: "Connect", fn: playConnect, color: "#22d3ee", icon: "⚡" },
  { name: "Navigate", fn: playNav, color: "#818cf8", icon: "→" },
  { name: "Scramble", fn: playScramble, color: "#fbbf24", icon: "⌘" },
  { name: "Heartbeat", fn: playHeartbeat, color: "#fb7185", icon: "♥" },
  { name: "CRT Open", fn: playCrtOpen, color: "#a78bfa", icon: "▣" },
  { name: "CRT Key", fn: playCrtKey, color: "#a78bfa", icon: "⌨" },
  { name: "Matrix", fn: playMatrixEnter, color: "#34d399", icon: "▼" },
  { name: "Star", fn: playStarWhoosh, color: "#fbbf24", icon: "★" },
  { name: "Radar", fn: playRadarPing, color: "#22d3ee", icon: "◉" },
];

export default function SoundBoard() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const bufferRef = useRef("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (open) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      bufferRef.current += e.key.toLowerCase();
      if (bufferRef.current.length > 2) bufferRef.current = bufferRef.current.slice(-2);
      if (bufferRef.current === "dj") {
        bufferRef.current = "";
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handlePlay = useCallback((sound: SoundDef, idx: number) => {
    sound.fn();
    setActiveId(idx);
    setTimeout(() => setActiveId(null), 300);
  }, []);

  if (!open) return null;

  return (
    <div className="soundboard-overlay" onClick={() => setOpen(false)}>
      <div className="soundboard-panel" onClick={(e) => e.stopPropagation()}>
        <div className="soundboard-header">
          <div>
            <h2 className="soundboard-title">Sound Board</h2>
            <p className="soundboard-subtitle">Every procedural sound in the app</p>
          </div>
          <button className="soundboard-close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <div className="soundboard-grid">
          {SOUNDS.map((sound, idx) => (
            <button
              key={idx}
              className={`soundboard-btn ${activeId === idx ? "soundboard-btn-active" : ""}`}
              onClick={() => handlePlay(sound, idx)}
              style={{
                "--sb-color": sound.color,
                animationDelay: `${idx * 30}ms`,
              } as React.CSSProperties}
            >
              <span className="soundboard-btn-icon">{sound.icon}</span>
              <span className="soundboard-btn-name">{sound.name}</span>
              {activeId === idx && (
                <span className="soundboard-btn-ring" style={{ borderColor: sound.color }} />
              )}
            </button>
          ))}
        </div>

        <div className="soundboard-footer">
          <span>13 procedural Web Audio sounds · no files loaded</span>
        </div>
      </div>
    </div>
  );
}
