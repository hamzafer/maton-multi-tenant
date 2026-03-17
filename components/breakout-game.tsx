"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { playClick, playSuccess, playError } from "@/lib/sounds";

const COLS = 8;
const ROWS = 4;
const BRICK_H = 14;
const BRICK_GAP = 3;
const PADDLE_W = 60;
const PADDLE_H = 10;
const BALL_R = 5;

const BRICK_COLORS = [
  "#34d399", "#2dd4bf", "#22d3ee", "#818cf8",
  "#34d399", "#2dd4bf", "#22d3ee", "#818cf8",
];

interface Brick {
  x: number;
  y: number;
  w: number;
  alive: boolean;
  color: string;
}

export default function BreakoutGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const stateRef = useRef({
    paddleX: 0,
    ballX: 0,
    ballY: 0,
    ballDX: 3,
    ballDY: -3,
    bricks: [] as Brick[],
    score: 0,
    lives: 3,
    started: false,
  });

  const initGame = useCallback((w: number, h: number) => {
    const s = stateRef.current;
    const brickW = (w - BRICK_GAP * (COLS + 1)) / COLS;
    s.bricks = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        s.bricks.push({
          x: BRICK_GAP + col * (brickW + BRICK_GAP),
          y: 30 + row * (BRICK_H + BRICK_GAP),
          w: brickW,
          alive: true,
          color: BRICK_COLORS[row],
        });
      }
    }
    s.paddleX = w / 2 - PADDLE_W / 2;
    s.ballX = w / 2;
    s.ballY = h - 40;
    s.ballDX = 3 * (Math.random() > 0.5 ? 1 : -1);
    s.ballDY = -3;
    s.started = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    initGame(W, H);

    function handleMouse(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      stateRef.current.paddleX = Math.min(
        Math.max(e.clientX - rect.left - PADDLE_W / 2, 0),
        W - PADDLE_W
      );
      if (!stateRef.current.started) {
        stateRef.current.started = true;
      }
    }
    canvas.addEventListener("mousemove", handleMouse);

    function draw() {
      if (!ctx) return;
      const s = stateRef.current;

      ctx.clearRect(0, 0, W, H);

      // Draw bricks
      s.bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, BRICK_H, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw paddle
      ctx.fillStyle = "#34d399";
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.roundRect(s.paddleX, H - 20, PADDLE_W, PADDLE_H, 5);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Paddle glow
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "rgba(52,211,153,0.3)";
      ctx.fillRect(s.paddleX + 10, H - 18, PADDLE_W - 20, 2);
      ctx.shadowBlur = 0;

      // Draw ball
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = "#f0f0f4";
      ctx.fill();
      ctx.shadowColor = "#f0f0f4";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!s.started) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("move mouse to start", W / 2, H / 2 + 40);
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Move ball
      s.ballX += s.ballDX;
      s.ballY += s.ballDY;

      // Wall collisions
      if (s.ballX - BALL_R <= 0 || s.ballX + BALL_R >= W) {
        s.ballDX *= -1;
        playClick();
      }
      if (s.ballY - BALL_R <= 0) {
        s.ballDY *= -1;
        playClick();
      }

      // Paddle collision
      if (
        s.ballY + BALL_R >= H - 20 &&
        s.ballY + BALL_R <= H - 10 &&
        s.ballX >= s.paddleX &&
        s.ballX <= s.paddleX + PADDLE_W
      ) {
        s.ballDY = -Math.abs(s.ballDY);
        // Angle based on hit position
        const hitPos = (s.ballX - s.paddleX) / PADDLE_W;
        s.ballDX = (hitPos - 0.5) * 6;
        playClick();
      }

      // Brick collision
      for (const b of s.bricks) {
        if (!b.alive) continue;
        if (
          s.ballX + BALL_R > b.x &&
          s.ballX - BALL_R < b.x + b.w &&
          s.ballY + BALL_R > b.y &&
          s.ballY - BALL_R < b.y + BRICK_H
        ) {
          b.alive = false;
          s.ballDY *= -1;
          s.score++;
          setScore(s.score);
          playClick();

          // Check win
          if (s.bricks.every((br) => !br.alive)) {
            setWon(true);
            setGameOver(true);
            playSuccess();
            return;
          }
          break;
        }
      }

      // Ball lost
      if (s.ballY > H + BALL_R) {
        s.lives--;
        setLives(s.lives);
        if (s.lives <= 0) {
          setGameOver(true);
          playError();
          return;
        }
        playError();
        s.ballX = W / 2;
        s.ballY = H - 40;
        s.ballDX = 3 * (Math.random() > 0.5 ? 1 : -1);
        s.ballDY = -3;
        s.started = false;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouse);
    };
  }, [initGame]);

  return (
    <div className="flex flex-col items-center py-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[380px] mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-text-muted uppercase tracking-widest">Score</span>
          <span className="text-[14px] font-bold font-mono text-accent">{score}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < lives ? "bg-accent shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-text-muted/20"
              }`}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
        >
          Close
        </button>
      </div>

      {/* Canvas */}
      <div className="relative glass-card rounded-2xl overflow-hidden p-1">
        <canvas
          ref={canvasRef}
          width={380}
          height={280}
          className="rounded-xl cursor-none"
          style={{ background: "rgba(6,6,8,0.8)" }}
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm rounded-2xl">
            <p className="text-[20px] font-bold text-text-primary mb-1">
              {won ? "You Win!" : "Game Over"}
            </p>
            <p className="text-[13px] text-text-secondary mb-4 font-mono">Score: {score}</p>
            <button
              onClick={() => {
                setScore(0);
                setLives(3);
                setGameOver(false);
                setWon(false);
                stateRef.current.score = 0;
                stateRef.current.lives = 3;
                const canvas = canvasRef.current;
                if (canvas) initGame(canvas.width, canvas.height);
              }}
              className="px-4 py-2 bg-accent text-surface text-[12px] font-semibold rounded-lg btn-press hover:brightness-110 transition-all"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-text-muted mt-3">Break the bricks while you wait</p>
    </div>
  );
}
