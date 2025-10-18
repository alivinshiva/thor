"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0..1
  decay: number; // amount to decrease per frame
  color: string;
  size: number;
};

const COLORS = [
  "#ffd166", // gold
  "#ff6b6b", // coral
  "#a78bfa", // purple
  "#22d3ee", // cyan
  "#f97316", // orange
  "#34d399", // green
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function spawnBurst(width: number, height: number, particles: Particle[]) {
  const cx = rand(width * 0.1, width * 0.9);
  const cy = rand(height * 0.15, height * 0.6);
  const count = Math.floor(rand(16, 34));
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand(-0.1, 0.1);
    const speed = rand(1.2, 3.2);
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.008, 0.02),
      color,
      size: rand(1.2, 2.2),
    });
  }
}

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const spawnerRef = useRef<number | null>(null);
  const runningRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      // Use visualViewport for mobile browsers if available
      const w = window.visualViewport?.width || window.innerWidth;
      const h = window.visualViewport?.height || window.innerHeight;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    ctx.globalCompositeOperation = "lighter"; // nice glow

    const gravity = 0.02;
    const friction = 0.995;

    const tick = () => {
      // clear frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const p = particlesRef.current;
      for (let i = p.length - 1; i >= 0; i--) {
        const part = p[i];
        part.vx *= friction;
        part.vy = part.vy * friction + gravity;
        part.x += part.vx;
        part.y += part.vy;
        part.life -= part.decay;

        if (part.life <= 0) {
          p.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, part.life);
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (runningRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    // initial bursts
    for (let i = 0; i < 3; i++) {
      spawnBurst(canvas.width, canvas.height, particlesRef.current);
    }

    // continuous spawner
    const scheduleSpawn = () => {
      const delay = rand(500, 1100);
      spawnerRef.current = window.setTimeout(() => {
        spawnBurst(canvas.width, canvas.height, particlesRef.current);
        if (runningRef.current) scheduleSpawn();
      }, delay);
    };
    scheduleSpawn();

    runningRef.current = true;
    rafRef.current = requestAnimationFrame(tick);

    const onVisibility = () => {
      const hidden = document.hidden;
      runningRef.current = !hidden;
      if (!hidden) {
        // resume
        if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
        if (spawnerRef.current == null) scheduleSpawn();
      } else {
        // pause
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (spawnerRef.current != null) clearTimeout(spawnerRef.current);
        spawnerRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (spawnerRef.current != null) clearTimeout(spawnerRef.current);
      rafRef.current = null;
      spawnerRef.current = null;
      runningRef.current = false;
      particlesRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-screen h-screen -z-10"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden
    />
  );
}
