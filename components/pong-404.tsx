"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { playClick, playError, playSuccess } from "@/lib/sounds";

const PADDLE_H = 60;
const PADDLE_W = 8;
const BALL_R = 5;
const AI_SPEED = 3.5;

export default function Pong404({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [message, setMessage] = useState("Move mouse to play");
  const mouseYRef = useRef(0);
  const scoresRef = useRef({ player: 0, ai: 0 });

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    // Game state
    let ballX = W / 2, ballY = H / 2;
    let ballVX = 3.5 * (Math.random() > 0.5 ? 1 : -1);
    let ballVY = (Math.random() - 0.5) * 4;
    let playerY = H / 2;
    let aiY = H / 2;
    let paused = false;

    function resetBall(direction: number) {
      ballX = W / 2;
      ballY = H / 2;
      ballVX = 3.5 * direction;
      ballVY = (Math.random() - 0.5) * 4;
      paused = true;
      setTimeout(() => { paused = false; }, 600);
    }

    function draw() {
      if (!canvas) return;

      // Update player paddle (follows mouse)
      const targetY = mouseYRef.current - canvas.getBoundingClientRect().top;
      playerY += (targetY - playerY) * 0.15;
      playerY = Math.max(PADDLE_H / 2, Math.min(H - PADDLE_H / 2, playerY));

      // Update AI paddle
      const aiTarget = ballY + ballVY * 8;
      const aiDiff = aiTarget - aiY;
      aiY += Math.sign(aiDiff) * Math.min(Math.abs(aiDiff), AI_SPEED);
      aiY = Math.max(PADDLE_H / 2, Math.min(H - PADDLE_H / 2, aiY));

      if (!paused) {
        // Move ball
        ballX += ballVX;
        ballY += ballVY;

        // Top/bottom bounce
        if (ballY - BALL_R <= 0 || ballY + BALL_R >= H) {
          ballVY = -ballVY;
          ballY = Math.max(BALL_R, Math.min(H - BALL_R, ballY));
        }

        // Player paddle collision (left side)
        if (
          ballX - BALL_R <= PADDLE_W + 16 &&
          ballY >= playerY - PADDLE_H / 2 &&
          ballY <= playerY + PADDLE_H / 2 &&
          ballVX < 0
        ) {
          ballVX = -ballVX * 1.05;
          ballVY += (ballY - playerY) * 0.1;
          ballX = PADDLE_W + 16 + BALL_R;
          playClick();
        }

        // AI paddle collision (right side)
        if (
          ballX + BALL_R >= W - PADDLE_W - 16 &&
          ballY >= aiY - PADDLE_H / 2 &&
          ballY <= aiY + PADDLE_H / 2 &&
          ballVX > 0
        ) {
          ballVX = -ballVX * 1.05;
          ballVY += (ballY - aiY) * 0.1;
          ballX = W - PADDLE_W - 16 - BALL_R;
          playClick();
        }

        // Speed cap
        ballVX = Math.sign(ballVX) * Math.min(Math.abs(ballVX), 8);

        // Scoring
        if (ballX < 0) {
          // AI scores
          scoresRef.current.ai++;
          setScores({ ...scoresRef.current });
          setMessage("Request rejected!");
          playError();
          resetBall(1);
        }
        if (ballX > W) {
          // Player scores — broke through the firewall!
          scoresRef.current.player++;
          setScores({ ...scoresRef.current });
          setMessage("Firewall breached!");
          playSuccess();
          resetBall(-1);
        }
      }

      // --- Render ---
      ctx.clearRect(0, 0, W, H);

      // Center dashed line
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Player paddle (left)
      const pGrad = ctx.createLinearGradient(8, playerY - PADDLE_H / 2, 8 + PADDLE_W, playerY + PADDLE_H / 2);
      pGrad.addColorStop(0, "rgba(52, 211, 153, 0.6)");
      pGrad.addColorStop(1, "rgba(52, 211, 153, 0.3)");
      ctx.fillStyle = pGrad;
      ctx.shadowColor = "rgba(52, 211, 153, 0.4)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(16, playerY - PADDLE_H / 2, PADDLE_W, PADDLE_H, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // AI paddle (right) — red-tinted
      const aGrad = ctx.createLinearGradient(W - 16 - PADDLE_W, aiY - PADDLE_H / 2, W - 16, aiY + PADDLE_H / 2);
      aGrad.addColorStop(0, "rgba(248, 113, 113, 0.3)");
      aGrad.addColorStop(1, "rgba(248, 113, 113, 0.6)");
      ctx.fillStyle = aGrad;
      ctx.shadowColor = "rgba(248, 113, 113, 0.3)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(W - 16 - PADDLE_W, aiY - PADDLE_H / 2, PADDLE_W, PADDLE_H, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200, 255, 230, 0.9)";
      ctx.shadowColor = "rgba(52, 211, 153, 0.6)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ball trail (short)
      ctx.beginPath();
      ctx.arc(ballX - ballVX * 2, ballY - ballVY * 2, BALL_R * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52, 211, 153, 0.15)";
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = Math.min(500, window.innerWidth - 40);
    canvas.height = 280;

    function handleMouse(e: MouseEvent) {
      mouseYRef.current = e.clientY;
    }
    window.addEventListener("mousemove", handleMouse, { passive: true });

    gameLoop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [gameLoop]);

  return (
    <div className="pong-container">
      {/* Labels */}
      <div className="pong-header">
        <div className="pong-team pong-team-player">
          <span className="pong-team-label">CLIENT</span>
          <span className="pong-team-score pong-score-player">{scores.player}</span>
        </div>
        <span className="pong-message">{message}</span>
        <div className="pong-team pong-team-ai">
          <span className="pong-team-score pong-score-ai">{scores.ai}</span>
          <span className="pong-team-label">FIREWALL</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="pong-canvas" />

      <div className="pong-footer">
        <span className="pong-hint">Move mouse to control paddle</span>
        <button onClick={onClose} className="pong-exit">Exit</button>
      </div>
    </div>
  );
}
