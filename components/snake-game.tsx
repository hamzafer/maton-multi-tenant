"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CELL = 16;
const COLS = 22;
const ROWS = 18;
const W = COLS * CELL;
const H = ROWS * CELL;
const TICK_MS = 110;

const API_ICONS = [
  { name: "Sheets", color: "#34A853", emoji: "📊" },
  { name: "Slack", color: "#E01E5A", emoji: "💬" },
  { name: "Gmail", color: "#EA4335", emoji: "📧" },
  { name: "Notion", color: "#FFFFFF", emoji: "📝" },
  { name: "GitHub", color: "#FFFFFF", emoji: "🐙" },
  { name: "Stripe", color: "#635BFF", emoji: "💳" },
  { name: "HubSpot", color: "#FF7A59", emoji: "🔶" },
  { name: "Jira", color: "#0052CC", emoji: "🎯" },
];

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

interface Food {
  pos: Pos;
  icon: (typeof API_ICONS)[number];
}

export default function SnakeGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"ready" | "playing" | "over">("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [collected, setCollected] = useState<string[]>([]);

  const snakeRef = useRef<Pos[]>([{ x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 }]);
  const dirRef = useRef<Dir>("RIGHT");
  const nextDirRef = useRef<Dir>("RIGHT");
  const foodRef = useRef<Food | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const collectedRef = useRef<string[]>([]);

  // Load high score
  useEffect(() => {
    const hs = localStorage.getItem("maton-snake-hs");
    if (hs) setHighScore(parseInt(hs));
  }, []);

  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    let pos: Pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    const icon = API_ICONS[Math.floor(Math.random() * API_ICONS.length)];
    foodRef.current = { pos, icon };
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#060608";
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.beginPath();
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Food
    const food = foodRef.current;
    if (food) {
      // Glow
      const grd = ctx.createRadialGradient(
        food.pos.x * CELL + CELL / 2, food.pos.y * CELL + CELL / 2, 0,
        food.pos.x * CELL + CELL / 2, food.pos.y * CELL + CELL / 2, CELL * 1.5
      );
      grd.addColorStop(0, food.icon.color + "30");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(
        food.pos.x * CELL - CELL, food.pos.y * CELL - CELL,
        CELL * 3, CELL * 3
      );

      ctx.font = `${CELL - 2}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        food.icon.emoji,
        food.pos.x * CELL + CELL / 2,
        food.pos.y * CELL + CELL / 2 + 1
      );
    }

    // Snake
    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      const t = 1 - i / snake.length;
      const alpha = 0.3 + t * 0.7;
      if (i === 0) {
        // Head
        ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, 3);
        ctx.fill();
      }
    });
  }, []);

  const gameOver = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    setGameState("over");
    const s = scoreRef.current;
    const hs = parseInt(localStorage.getItem("maton-snake-hs") || "0");
    if (s > hs) {
      localStorage.setItem("maton-snake-hs", String(s));
      setHighScore(s);
    }
  }, []);

  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = snake[0];
    const dir = dirRef.current;

    const next: Pos = {
      x: head.x + (dir === "RIGHT" ? 1 : dir === "LEFT" ? -1 : 0),
      y: head.y + (dir === "DOWN" ? 1 : dir === "UP" ? -1 : 0),
    };

    // Wall collision
    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      gameOver();
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === next.x && s.y === next.y)) {
      gameOver();
      return;
    }

    const newSnake = [next, ...snake];

    // Eat food
    const food = foodRef.current;
    if (food && next.x === food.pos.x && next.y === food.pos.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      if (!collectedRef.current.includes(food.icon.name)) {
        collectedRef.current = [...collectedRef.current, food.icon.name];
        setCollected([...collectedRef.current]);
      }
      spawnFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    draw();
  }, [draw, gameOver, spawnFood]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 }];
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    scoreRef.current = 0;
    collectedRef.current = [];
    setScore(0);
    setCollected([]);
    setGameState("playing");
    spawnFood();
    draw();
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(tick, TICK_MS);
  }, [tick, draw, spawnFood]);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (gameState === "ready" || gameState === "over") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          startGame();
        }
        return;
      }

      const dir = dirRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (dir !== "DOWN") nextDirRef.current = "UP";
          break;
        case "ArrowDown":
        case "s":
          if (dir !== "UP") nextDirRef.current = "DOWN";
          break;
        case "ArrowLeft":
        case "a":
          if (dir !== "RIGHT") nextDirRef.current = "LEFT";
          break;
        case "ArrowRight":
        case "d":
          if (dir !== "LEFT") nextDirRef.current = "RIGHT";
          break;
      }
      e.preventDefault();
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [gameState, startGame]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(52,211,153,0.06)] animate-fade-up" style={{ width: W + 48 }}>
        {/* Header */}
        <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-text-primary">Connection Snake</span>
            <span className="text-[10px] text-text-muted font-mono">collect APIs</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[11px] font-mono">
              <span className="text-text-muted">Score </span>
              <span className="text-accent font-semibold">{score}</span>
            </div>
            <div className="text-[11px] font-mono">
              <span className="text-text-muted">Best </span>
              <span className="text-text-secondary">{highScore}</span>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.06)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative px-6 py-4">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="rounded-xl border border-[rgba(255,255,255,0.04)]"
          />

          {/* Overlays */}
          {gameState === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-fade-up">
                <p className="text-[18px] font-bold text-text-primary mb-1">Connection Snake</p>
                <p className="text-[12px] text-text-muted mb-4">Eat API icons to connect services</p>
                <button
                  onClick={startGame}
                  className="bg-accent text-surface font-semibold text-[13px] py-2 px-6 rounded-xl btn-press hover:brightness-110 transition-all"
                >
                  Press Space to Start
                </button>
                <p className="text-[10px] text-text-muted mt-3">Arrow keys or WASD to move</p>
              </div>
            </div>
          )}

          {gameState === "over" && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(6,6,8,0.8)] rounded-xl mx-6 my-4">
              <div className="text-center animate-fade-up">
                <p className="text-[18px] font-bold text-danger mb-1">Game Over</p>
                <p className="text-[24px] font-bold text-text-primary mb-1">{score}</p>
                <p className="text-[11px] text-text-muted mb-4">
                  {collected.length} / {API_ICONS.length} APIs connected
                </p>
                <button
                  onClick={startGame}
                  className="bg-accent text-surface font-semibold text-[13px] py-2 px-6 rounded-xl btn-press hover:brightness-110 transition-all"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Connected APIs bar */}
        <div className="px-5 py-2.5 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wider shrink-0">Connected:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {API_ICONS.map((api) => {
              const isCollected = collected.includes(api.name);
              return (
                <span
                  key={api.name}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-300 ${
                    isCollected
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-[rgba(255,255,255,0.03)] text-text-muted border border-transparent"
                  }`}
                >
                  {api.emoji} {api.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
