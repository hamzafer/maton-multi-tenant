"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { playConnect } from "@/lib/sounds";

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "terminal", icon: "🖥️", title: "Hacker", description: "Opened the CRT terminal" },
  { id: "matrix", icon: "💊", title: "Red Pill", description: "Triggered Matrix rain" },
  { id: "konami", icon: "⬆️", title: "Konami Master", description: "Entered the Konami code" },
  { id: "snake", icon: "🐍", title: "Snake Charmer", description: "Played Snake" },
  { id: "ambient", icon: "🎵", title: "Audiophile", description: "Toggled ambient music" },
  { id: "shortcuts", icon: "❓", title: "Explorer", description: "Opened the shortcut sheet" },
  { id: "palette", icon: "🔍", title: "Searcher", description: "Opened the command palette" },
  { id: "context", icon: "🖱️", title: "Right Clicker", description: "Used the custom context menu" },
  { id: "scramble", icon: "⌨️", title: "Cipher", description: "Hovered a scramble heading" },
  { id: "heartbeat", icon: "💓", title: "Alive", description: "Expanded the heartbeat bar" },
];

const STORAGE_KEY = "maton-achievements";

function getUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveUnlocked(unlocked: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch {}
}

// Global unlock function — can be called from anywhere
export function unlockAchievement(id: string) {
  window.dispatchEvent(new CustomEvent("achievement-unlock", { detail: { id } }));
}

interface Notification {
  achievement: Achievement;
  id: number;
  exiting: boolean;
}

let notifCounter = 0;

export default function AchievementSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const initRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    setUnlocked(getUnlocked());
    initRef.current = true;
  }, []);

  const handleUnlock = useCallback(
    (e: Event) => {
      if (!initRef.current) return;
      const { id } = (e as CustomEvent).detail as { id: string };

      // Already unlocked?
      if (unlocked.has(id)) return;

      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement) return;

      // Unlock it
      const next = new Set(unlocked);
      next.add(id);
      setUnlocked(next);
      saveUnlocked(next);

      // Play sound
      playConnect();

      // Show notification
      const notifId = ++notifCounter;
      setNotifications((prev) => [...prev, { achievement, id: notifId, exiting: false }]);

      // Start exit after 3s
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, exiting: true } : n))
        );
      }, 3000);

      // Remove after exit animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      }, 3500);
    },
    [unlocked]
  );

  useEffect(() => {
    window.addEventListener("achievement-unlock", handleUnlock);
    return () => window.removeEventListener("achievement-unlock", handleUnlock);
  }, [handleUnlock]);

  // Expose count for other components
  useEffect(() => {
    document.documentElement.dataset.achievementCount = String(unlocked.size);
    document.documentElement.dataset.achievementTotal = String(ACHIEVEMENTS.length);
  }, [unlocked]);

  return (
    <>
      {/* Notification stack */}
      <div className="achievement-stack">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`achievement-notif ${notif.exiting ? "achievement-notif-exit" : ""}`}
          >
            <span className="achievement-notif-icon">{notif.achievement.icon}</span>
            <div className="achievement-notif-content">
              <div className="achievement-notif-header">
                <span className="achievement-notif-badge">Achievement Unlocked</span>
                <span className="achievement-notif-count">
                  {unlocked.size}/{ACHIEVEMENTS.length}
                </span>
              </div>
              <p className="achievement-notif-title">{notif.achievement.title}</p>
              <p className="achievement-notif-desc">{notif.achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
