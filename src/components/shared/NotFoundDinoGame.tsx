'use client';

import { useEffect, useRef, useState } from 'react';

type Obstacle = {
  x: number;
  width: number;
  height: number;
};

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 190;
const GROUND_Y = 148;
const DINO_X = 70;
const DINO_SIZE = 24;
const GRAVITY = 0.55;
const JUMP_VELOCITY = -9.2;

export default function NotFoundDinoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const scoreRef = useRef(0);
  const runningRef = useRef(false);
  const gameOverRef = useRef(false);

  const dinoYRef = useRef(0);
  const velocityYRef = useRef(0);
  const speedRef = useRef(4.2);
  const frameRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);

  const syncScore = (value: number) => {
    scoreRef.current = value;
    setScore(value);
    if (value > best) {
      setBest(value);
      try {
        localStorage.setItem('nf-dino-best', String(value));
      } catch {
        // ignore storage failures
      }
    }
  };

  const resetGameState = () => {
    dinoYRef.current = 0;
    velocityYRef.current = 0;
    speedRef.current = 4.2;
    frameRef.current = 0;
    obstaclesRef.current = [];
    syncScore(0);
    setGameOver(false);
    gameOverRef.current = false;
  };

  const jump = () => {
    if (gameOverRef.current) {
      resetGameState();
      runningRef.current = true;
      setRunning(true);
      return;
    }

    if (!runningRef.current) {
      runningRef.current = true;
      setRunning(true);
    }

    if (dinoYRef.current === 0) {
      velocityYRef.current = JUMP_VELOCITY;
    }
  };

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem('nf-dino-best') || '0');
      if (Number.isFinite(saved) && saved > 0) setBest(saved);
    } catch {
      // ignore localStorage read failures
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'KeyR' && gameOverRef.current) {
        resetGameState();
        runningRef.current = true;
        setRunning(true);
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isColliding = (obs: Obstacle, dinoBaseY: number) => {
      const dinoLeft = DINO_X;
      const dinoRight = DINO_X + DINO_SIZE;
      const dinoTop = dinoBaseY - DINO_SIZE;
      const dinoBottom = dinoBaseY;

      const obsLeft = obs.x;
      const obsRight = obs.x + obs.width;
      const obsTop = GROUND_Y - obs.height;
      const obsBottom = GROUND_Y;

      return dinoLeft < obsRight && dinoRight > obsLeft && dinoTop < obsBottom && dinoBottom > obsTop;
    };

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // sky
      ctx.fillStyle = '#f7f3ea';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // subtle grid lines for style
      ctx.strokeStyle = 'rgba(42,33,24,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 10);
        ctx.stroke();
      }

      // ground
      ctx.strokeStyle = '#2a2118';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 1);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 1);
      ctx.stroke();

      // dino
      const dinoBaseY = GROUND_Y - dinoYRef.current;
      ctx.fillStyle = '#2a2118';
      ctx.fillRect(DINO_X, dinoBaseY - DINO_SIZE, DINO_SIZE, DINO_SIZE);
      // eye
      ctx.fillStyle = '#f7f3ea';
      ctx.fillRect(DINO_X + 16, dinoBaseY - 18, 3, 3);

      // obstacles
      ctx.fillStyle = '#3d3025';
      for (const obs of obstaclesRef.current) {
        ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
      }

      // score
      ctx.fillStyle = '#6b5c4e';
      ctx.font = '12px var(--font-mono), monospace';
      ctx.fillText(`SCORE ${scoreRef.current.toString().padStart(4, '0')}`, CANVAS_WIDTH - 145, 20);
      ctx.fillText(`BEST ${best.toString().padStart(4, '0')}`, CANVAS_WIDTH - 145, 38);

      if (!runningRef.current && !gameOverRef.current) {
        ctx.fillStyle = '#2a2118';
        ctx.font = '13px var(--font-mono), monospace';
        ctx.fillText('PRESS SPACE / TAP TO PLAY', 220, 82);
      }

      if (gameOverRef.current) {
        ctx.fillStyle = '#2a2118';
        ctx.font = '14px var(--font-mono), monospace';
        ctx.fillText('GAME OVER · SPACE TO RETRY', 238, 82);
      }
    };

    const tick = () => {
      if (runningRef.current && !gameOverRef.current) {
        frameRef.current += 1;

        // jump physics
        velocityYRef.current += GRAVITY;
        dinoYRef.current = Math.max(0, dinoYRef.current - velocityYRef.current);
        if (dinoYRef.current === 0 && velocityYRef.current > 0) {
          velocityYRef.current = 0;
        }

        // spawn obstacles
        const last = obstaclesRef.current[obstaclesRef.current.length - 1];
        const minGap = 120 + Math.random() * 95;
        if (!last || last.x < CANVAS_WIDTH - minGap) {
          if (Math.random() < 0.032) {
            obstaclesRef.current.push({
              x: CANVAS_WIDTH + 8,
              width: 13 + Math.random() * 7,
              height: 22 + Math.random() * 18,
            });
          }
        }

        // move obstacles
        obstaclesRef.current = obstaclesRef.current
          .map((obs) => ({ ...obs, x: obs.x - speedRef.current }))
          .filter((obs) => obs.x + obs.width > -5);

        // collision
        const dinoBaseY = GROUND_Y - dinoYRef.current;
        for (const obs of obstaclesRef.current) {
          if (isColliding(obs, dinoBaseY)) {
            gameOverRef.current = true;
            setGameOver(true);
            runningRef.current = false;
            setRunning(false);
            break;
          }
        }

        // score + gentle speed-up
        if (!gameOverRef.current) {
          if (frameRef.current % 4 === 0) {
            syncScore(scoreRef.current + 1);
          }
          if (frameRef.current % 160 === 0) {
            speedRef.current = Math.min(9.8, speedRef.current + 0.25);
          }
        }
      }

      draw();
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [best]);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-[0.72rem] font-mono tracking-wide text-[#7b6c5e]">
        <span>{running ? 'RUNNING' : gameOver ? 'CRASHED' : 'IDLE'}</span>
        <span>Score: {score} · Best: {best}</span>
      </div>

      <button
        type="button"
        onClick={jump}
        className="w-full text-left rounded-xl border border-[#e4dbcd] bg-[#fffdfa] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
        aria-label="Jump in dino game"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-auto rounded-lg border border-[#e9e2d6] bg-[#f7f3ea]"
        />
      </button>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            resetGameState();
            runningRef.current = true;
            setRunning(true);
          }}
          className="px-3 py-1.5 rounded-md bg-[#2a2118] text-[#f6f2ea] text-xs font-medium hover:bg-[#d4622a] transition-colors"
        >
          Restart
        </button>
        <button
          type="button"
          onClick={() => {
            resetGameState();
            runningRef.current = false;
            setRunning(false);
          }}
          className="px-3 py-1.5 rounded-md border border-[#d8cdbd] text-[#4b3a2d] text-xs font-medium hover:bg-[#f3ede3] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
