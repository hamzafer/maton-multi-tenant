"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { playSuccess, playError, playClick } from "@/lib/sounds";

const CELL = 16;
const SPEED_MS = 100;

interface Point { x: number; y: number; }

const API_FOODS = [
  { name: "Sheets", color: "#34A853" },
  { name: "Slack", color: "#E01E5A" },
  { name: "Gmail", color: "#EA4335" },
  { name: "Notion", color: "#EEEEEE" },
  { name: "GitHub", color: "#CCCCCC" },
];

export default function SnakeGameOverlay() {
  const [open, setOpen] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef("");

  // Game state refs (not React state — too fast for re-renders)
  const snakeRef = useRef<Point[]>([]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<{ pos: Point; api: typeof API_FOODS[0] }>({ pos: { x: 10, y: 10 }, api: API_FOODS[0] });
  const gridRef = useRef({ cols: 0, rows: 0 });
  const loopRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const scoreRef = useRef(0);

  // Listen for "snake" typed
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (open) return;
      bufferRef.current += e.key.toLowerCase();
      if (bufferRef.current.length > 5) bufferRef.current = bufferRef.current.slice(-5);
      if (bufferRef.current === "snake") {
        bufferRef.current = "";
        playClick();
        setOpen(true);
        setGameOver(false);
        setScore(0);
        scoreRef.current = 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const spawnFood = useCallback(() => {
    const { cols, rows } = gridRef.current;
    const snake = snakeRef.current;
    let pos: Point;
    do {
      pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    foodRef.current = { pos, api: API_FOODS[Math.floor(Math.random() * API_FOODS.length)] };
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / CELL);
    const rows = Math.floor(canvas.height / CELL);
    gridRef.current = { cols, rows };

    // Init snake in center
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    snakeRef.current = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    spawnFood();

    clearInterval(loopRef.current);
    loopRef.current = setInterval(() => {
      const snake = snakeRef.current;
      const dir = nextDirRef.current;
      dirRef.current = dir;

      // Move head
      const head = snake[0];
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
        clearInterval(loopRef.current);
        setGameOver(true);
        playError();
        // Save high score
        setHighScore((prev) => Math.max(prev, scoreRef.current));
        return;
      }

      // Self collision
      if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        clearInterval(loopRef.current);
        setGameOver(true);
        playError();
        setHighScore((prev) => Math.max(prev, scoreRef.current));
        return;
      }

      snake.unshift(newHead);

      // Check food
      const food = foodRef.current;
      if (newHead.x === food.pos.x && newHead.y === food.pos.y) {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        playSuccess();
        spawnFood();
      } else {
        snake.pop();
      }

      // Render
      ctx.fillStyle = "rgba(3, 3, 4, 0.92)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid dots (very subtle)
      ctx.fillStyle = "rgba(52, 211, 153, 0.02)";
      for (let gx = 0; gx < cols; gx++) {
        for (let gy = 0; gy < rows; gy++) {
          ctx.fillRect(gx * CELL + CELL / 2, gy * CELL + CELL / 2, 1, 1);
        }
      }

      // Snake body
      snake.forEach((seg, i) => {
        const isHead = i === 0;
        const fade = 1 - (i / snake.length) * 0.6;

        if (isHead) {
          ctx.fillStyle = "rgba(200, 255, 230, 0.95)";
          ctx.shadowColor = "rgba(52, 211, 153, 0.6)";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(52, 211, 153, ${fade * 0.7})`;
          ctx.shadowBlur = 0;
        }

        const pad = isHead ? 1 : 2;
        ctx.beginPath();
        ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 4 : 3);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Food
      const fx = food.pos.x * CELL + CELL / 2;
      const fy = food.pos.y * CELL + CELL / 2;

      // Glow
      ctx.beginPath();
      ctx.arc(fx, fy, CELL * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = food.api.color + "15";
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(fx, fy, CELL * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = food.api.color;
      ctx.shadowColor = food.api.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Food label
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = food.api.color + "80";
      ctx.textAlign = "center";
      ctx.fillText(food.api.name, fx, fy + CELL + 2);
    }, SPEED_MS);
  }, [spawnFood]);

  // Start game when opened
  useEffect(() => {
    if (open && !gameOver) {
      const t = setTimeout(startGame, 100);
      return () => clearTimeout(t);
    }
  }, [open, gameOver, startGame]);

  // Arrow key controls
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      const dir = dirRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (dir.y !== 1) nextDirRef.current = { x: 0, y: -1 };
          e.preventDefault();
          break;
        case "ArrowDown":
          if (dir.y !== -1) nextDirRef.current = { x: 0, y: 1 };
          e.preventDefault();
          break;
        case "ArrowLeft":
          if (dir.x !== 1) nextDirRef.current = { x: -1, y: 0 };
          e.preventDefault();
          break;
        case "ArrowRight":
          if (dir.x !== -1) nextDirRef.current = { x: 1, y: 0 };
          e.preventDefault();
          break;
        case "Escape":
          setOpen(false);
          clearInterval(loopRef.current);
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Cleanup
  useEffect(() => {
    return () => clearInterval(loopRef.current);
  }, []);

  if (!open) return null;

  return (
    <div className="snake-overlay">
      <canvas ref={canvasRef} className="snake-canvas" />

      {/* HUD */}
      <div className="snake-hud">
        <div className="snake-hud-item">
          <span className="snake-hud-label">Score</span>
          <span className="snake-hud-value">{score}</span>
        </div>
        <div className="snake-hud-item">
          <span className="snake-hud-label">Hi</span>
          <span className="snake-hud-value">{highScore}</span>
        </div>
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="snake-gameover">
          <p className="snake-gameover-title">Game Over</p>
          <p className="snake-gameover-score">Score: {score}</p>
          <div className="snake-gameover-actions">
            <button onClick={() => { setGameOver(false); startGame(); }} className="snake-btn snake-btn-play">
              Play Again
            </button>
            <button onClick={() => setOpen(false)} className="snake-btn snake-btn-exit">
              Exit
            </button>
          </div>
          <p className="snake-gameover-hint">Arrow keys to move · Esc to exit</p>
        </div>
      )}

      {/* Initial hint (briefly) */}
      {!gameOver && score === 0 && (
        <div className="snake-start-hint">Arrow keys to move · Eat the API dots</div>
      )}
    </div>
  );
}
