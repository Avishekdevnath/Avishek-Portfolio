'use client';

import { useEffect, useRef, useState } from 'react';

type Obstacle = {
  x: number;
  width: number;
  height: number;
};

const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 280;
const GROUND_Y = 232;
const DINO_X = 56;
const DINO_SIZE = 20;
const GRAVITY = 0.52;
const JUMP_VELOCITY = -8.8;
const MAX_JUMPS = 5;
const FLY_LIFT = 0.7;
const MAX_FLY_UP_VELOCITY = -9.6;
const TOP_MARGIN = 12;
const MAX_DINO_Y = GROUND_Y - DINO_SIZE - TOP_MARGIN;

export default function NotFoundDinoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastUiSyncRef = useRef(0);
  const lastTickRef = useRef(0);
  const wasRunningBeforeHiddenRef = useRef(false);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [jumpsLeft, setJumpsLeft] = useState(MAX_JUMPS);

  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const runningRef = useRef(false);
  const gameOverRef = useRef(false);

  const dinoYRef = useRef(0);
  const velocityYRef = useRef(0);
  const speedRef = useRef(3.9);
  const frameRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const jumpsUsedRef = useRef(0);
  const isHoldingFlyRef = useRef(false);

  const syncScore = (value: number) => {
    scoreRef.current = value;
    if (value > bestRef.current) {
      bestRef.current = value;
      // Reduce re-renders and storage writes while keeping UI current enough.
      if (value % 20 === 0) {
        setBest(bestRef.current);
        try {
          localStorage.setItem('nf-dino-best', String(bestRef.current));
        } catch {
          // ignore storage failures
        }
      }
    }
  };

  const syncUi = (now: number, force = false) => {
    if (force || now - lastUiSyncRef.current > 160) {
      setScore(scoreRef.current);
      setBest(bestRef.current);
      setJumpsLeft(Math.max(0, MAX_JUMPS - jumpsUsedRef.current));
      lastUiSyncRef.current = now;
    }
  };

  const resetGameState = () => {
    dinoYRef.current = 0;
    velocityYRef.current = 0;
    speedRef.current = 3.9;
    frameRef.current = 0;
    obstaclesRef.current = [];
    jumpsUsedRef.current = 0;
    isHoldingFlyRef.current = false;
    syncScore(0);
    setScore(0);
    setJumpsLeft(MAX_JUMPS);
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

    const isGrounded = dinoYRef.current <= 0.01 && Math.abs(velocityYRef.current) < 0.01;
    if (isGrounded) {
      jumpsUsedRef.current = 0;
      setJumpsLeft(MAX_JUMPS);
    }

    if (jumpsUsedRef.current < MAX_JUMPS) {
      velocityYRef.current = JUMP_VELOCITY;
      jumpsUsedRef.current += 1;
      setJumpsLeft(Math.max(0, MAX_JUMPS - jumpsUsedRef.current));
    }
  };

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem('nf-dino-best') || '0');
      if (Number.isFinite(saved) && saved > 0) {
        bestRef.current = saved;
        setBest(saved);
      }
    } catch {
      // ignore localStorage read failures
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        isHoldingFlyRef.current = true;
        if (!e.repeat) jump();
      }
      if (e.code === 'KeyR' && gameOverRef.current) {
        resetGameState();
        runningRef.current = true;
        setRunning(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        isHoldingFlyRef.current = false;
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        wasRunningBeforeHiddenRef.current = runningRef.current;
        isHoldingFlyRef.current = false;
        if (runningRef.current) {
          runningRef.current = false;
          setRunning(false);
        }
      } else if (wasRunningBeforeHiddenRef.current && !gameOverRef.current) {
        runningRef.current = true;
        setRunning(true);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
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

      // ground
      ctx.strokeStyle = '#2a2118';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 1);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 1);
      ctx.stroke();

      // dino
      const dinoBaseY = GROUND_Y - dinoYRef.current;
      const legLift = runningRef.current && !gameOverRef.current && frameRef.current % 14 < 7 ? 1 : 0;
      ctx.fillStyle = '#2a2118';
      // body
      ctx.fillRect(DINO_X + 4, dinoBaseY - 14, 14, 12);
      // head
      ctx.fillRect(DINO_X + 12, dinoBaseY - 20, 8, 8);
      // tail
      ctx.fillRect(DINO_X + 1, dinoBaseY - 9, 3, 3);
      // legs
      ctx.fillRect(DINO_X + 6, dinoBaseY - 2 + legLift, 3, 4 - legLift);
      ctx.fillRect(DINO_X + 12, dinoBaseY - 2 + (1 - legLift), 3, 4 - (1 - legLift));
      // eye
      ctx.fillStyle = '#f7f3ea';
      ctx.fillRect(DINO_X + 16, dinoBaseY - 17, 2, 2);

      // obstacles
      ctx.fillStyle = '#3d3025';
      for (const obs of obstaclesRef.current) {
        const trunkWidth = Math.max(4, obs.width * 0.46);
        const trunkX = obs.x + (obs.width - trunkWidth) / 2;
        const topY = GROUND_Y - obs.height;

        // cactus trunk
        ctx.fillRect(trunkX, topY, trunkWidth, obs.height);
        // left arm
        ctx.fillRect(trunkX - 3, topY + obs.height * 0.45, 3, 8);
        // right arm
        ctx.fillRect(trunkX + trunkWidth, topY + obs.height * 3 / 8, 3, 9);
        // top cap
        ctx.fillRect(trunkX - 1, topY - 2, trunkWidth + 2, 2);
      }

      // score
      ctx.fillStyle = '#6b5c4e';
      ctx.font = '12px var(--font-mono), monospace';
      ctx.fillText(`SCORE ${scoreRef.current.toString().padStart(4, '0')}`, CANVAS_WIDTH - 145, 20);
      ctx.fillText(`BEST ${best.toString().padStart(4, '0')}`, CANVAS_WIDTH - 145, 38);

      if (!runningRef.current && !gameOverRef.current) {
        ctx.fillStyle = '#2a2118';
        ctx.font = '13px var(--font-mono), monospace';
        ctx.fillText('PRESS SPACE / TAP TO PLAY', 160, 72);
      }

      if (gameOverRef.current) {
        ctx.fillStyle = '#2a2118';
        ctx.font = '14px var(--font-mono), monospace';
        ctx.fillText('GAME OVER · SPACE TO RETRY', 172, 72);
      }
    };

    const tick = (timestamp: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = timestamp;
      const delta = timestamp - lastTickRef.current;
      if (delta < 16) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTickRef.current = timestamp;
      const frameScale = Math.min(2, delta / 16);

      if (runningRef.current && !gameOverRef.current) {
        frameRef.current += 1;

        // jump physics
        if (isHoldingFlyRef.current && dinoYRef.current > 0 && dinoYRef.current < MAX_DINO_Y) {
          velocityYRef.current = Math.max(MAX_FLY_UP_VELOCITY, velocityYRef.current - (FLY_LIFT * frameScale));
        }
        velocityYRef.current += GRAVITY * frameScale;
        dinoYRef.current = Math.min(MAX_DINO_Y, Math.max(0, dinoYRef.current - velocityYRef.current));
        if (dinoYRef.current >= MAX_DINO_Y && velocityYRef.current < 0) {
          velocityYRef.current = 0;
        }
        if (dinoYRef.current === 0 && velocityYRef.current > 0) {
          velocityYRef.current = 0;
          jumpsUsedRef.current = 0;
          setJumpsLeft(MAX_JUMPS);
        }

        // spawn obstacles
        const last = obstaclesRef.current[obstaclesRef.current.length - 1];
        const minGap = 112 + Math.random() * 88;
        if (!last || last.x < CANVAS_WIDTH - minGap) {
          if (Math.random() < 0.026) {
            obstaclesRef.current.push({
              x: CANVAS_WIDTH + 8,
              width: 11 + Math.random() * 6,
              height: 18 + Math.random() * 16,
            });
          }
        }

        // move obstacles (mutate in place to avoid per-frame array allocations)
        for (let i = 0; i < obstaclesRef.current.length; i += 1) {
          obstaclesRef.current[i].x -= speedRef.current * frameScale;
        }
        while (obstaclesRef.current.length > 0 && obstaclesRef.current[0].x + obstaclesRef.current[0].width <= -5) {
          obstaclesRef.current.shift();
        }

        // collision
        const dinoBaseY = GROUND_Y - dinoYRef.current;
        for (const obs of obstaclesRef.current) {
          if (isColliding(obs, dinoBaseY)) {
            gameOverRef.current = true;
            setGameOver(true);
            runningRef.current = false;
            setRunning(false);
            syncUi(timestamp, true);
            break;
          }
        }

        // score + gentle speed-up
        if (!gameOverRef.current) {
          if (frameRef.current % 4 === 0) {
            syncScore(scoreRef.current + 1);
          }
          if (frameRef.current % 180 === 0) {
            speedRef.current = Math.min(8.8, speedRef.current + 0.2);
          }
          syncUi(timestamp);
        }
      }

      draw();
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-[0.72rem] font-mono tracking-wide text-[#7b6c5e]">
        <span className="transition-all duration-300 ease-out">{running ? 'RUNNING' : gameOver ? 'CRASHED' : 'IDLE'}</span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md border border-[#d8cdbd] bg-[#f8f4ec] px-2 py-0.5 text-[0.68rem] text-[#5d4c3d] transition-all duration-200 ease-out">
            JUMP x{jumpsLeft}
          </span>
          <span>Score: {score} · Best: {best}</span>
        </span>
      </div>

      <button
        type="button"
        onPointerDown={() => {
          isHoldingFlyRef.current = true;
          jump();
        }}
        onPointerUp={() => {
          isHoldingFlyRef.current = false;
        }}
        onPointerLeave={() => {
          isHoldingFlyRef.current = false;
        }}
        onPointerCancel={() => {
          isHoldingFlyRef.current = false;
        }}
        className="w-full text-left rounded-xl border border-[#e4dbcd] bg-[#fffdfa] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] touch-manipulation transition-transform duration-150 ease-out active:scale-[0.995]"
        aria-label="Jump in dino game"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-auto min-h-[320px] sm:min-h-[420px] rounded-lg border border-[#e9e2d6] bg-[#f7f3ea] [image-rendering:pixelated]"
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
          className="px-3 py-1.5 rounded-md bg-[#2a2118] text-[#f6f2ea] text-xs font-medium hover:bg-[#d4622a] transition-all duration-200 ease-out"
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
          className="px-3 py-1.5 rounded-md border border-[#d8cdbd] text-[#4b3a2d] text-xs font-medium hover:bg-[#f3ede3] transition-all duration-200 ease-out"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
