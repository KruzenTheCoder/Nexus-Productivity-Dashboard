// src/components/BubbleArt.tsx
import React from 'react';
import Box from '@mui/material/Box';

type BubbleArtProps = {
  bubbleCount?: number;
  speed?: number; // 1 = default
  className?: string;
};

type Bubble = {
  x: number; y: number; r: number;
  vx: number; vy: number;
  pr: number; // pulse phase
  pc: number; // pulse speed
  c1: string; c2: string;
};

export default function BubbleArt({ bubbleCount = 16, speed = 1, className }: BubbleArtProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const bubblesRef = React.useRef<Bubble[]>([]);
  const runningRef = React.useRef(true);
  const lastTRef = React.useRef<number>(0);
  const dprRef = React.useRef<number>(1);

  const colors: [string, string][] = [
    ['rgba(10,132,255,0.75)', 'rgba(10,132,255,0.08)'],   // blue
    ['rgba(124,58,237,0.75)', 'rgba(124,58,237,0.08)'],   // purple
    ['rgba(100,210,255,0.75)', 'rgba(100,210,255,0.08)'], // cyan
  ];

  const resize = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap DPR to 2 for perf
    dprRef.current = dpr;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  const initBubbles = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    const arr: Bubble[] = Array.from({ length: bubbleCount }).map((_, i) => {
      const r = (Math.random() * 60 + 40) * dprRef.current; // 40–100 px (scaled)
      const x = Math.random() * (w - 2 * r) + r;
      const y = Math.random() * (h - 2 * r) + r;
      const s = 0.15 + Math.random() * 0.45; // speed scalar
      const vx = (Math.random() * 0.6 + 0.25) * (Math.random() < 0.5 ? -1 : 1) * s * speed;
      const vy = (Math.random() * 0.6 + 0.25) * (Math.random() < 0.5 ? -1 : 1) * s * speed;
      const [c1, c2] = colors[i % colors.length];
      return { x, y, r, vx, vy, pr: Math.random() * Math.PI * 2, pc: 0.004 + Math.random() * 0.006, c1, c2 };
    });
    bubblesRef.current = arr;
  }, [bubbleCount, speed]);

  const draw = React.useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const dt = Math.min(32, t - (lastTRef.current || t));
    lastTRef.current = t;

    // Background gradient (subtle)
    const lg = ctx.createLinearGradient(0, 0, w, h);
    lg.addColorStop(0, 'rgba(10,132,255,0.18)');
    lg.addColorStop(0.5, 'rgba(124,58,237,0.18)');
    lg.addColorStop(1, 'rgba(100,210,255,0.18)');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);

    // Draw bubbles with additive composition
    ctx.globalCompositeOperation = 'lighter';

    for (const b of bubblesRef.current) {
      // Move
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Bounce walls
      if (b.x - b.r < 0 && b.vx < 0) b.vx *= -1;
      if (b.x + b.r > w && b.vx > 0) b.vx *= -1;
      if (b.y - b.r < 0 && b.vy < 0) b.vy *= -1;
      if (b.y + b.r > h && b.vy > 0) b.vy *= -1;

      // Pulse radius
      b.pr += b.pc * dt;
      const pulse = 0.06 * Math.sin(b.pr); // ±6%
      const R = b.r * (1 + pulse);

      const rg = ctx.createRadialGradient(b.x, b.y, R * 0.1, b.x, b.y, R);
      rg.addColorStop(0, b.c1);
      rg.addColorStop(1, b.c2);
      ctx.fillStyle = rg;

      ctx.beginPath();
      ctx.arc(b.x, b.y, R, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const loop = React.useCallback((t: number) => {
    if (!runningRef.current) return;
    draw(t);
    frameRef.current = requestAnimationFrame(loop);
  }, [draw]);

  React.useEffect(() => {
    resize();
    initBubbles();
    runningRef.current = true;
    frameRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      initBubbles();
    };
    const onVis = () => {
      runningRef.current = !document.hidden;
      if (runningRef.current) {
        lastTRef.current = 0;
        frameRef.current = requestAnimationFrame(loop);
      } else if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      runningRef.current = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [initBubbles, loop, resize]);

  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block' }} />
      {/* Soft vignette for depth */}
      <Box
        className="auth-vignette"
        sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
    </Box>
  );
}