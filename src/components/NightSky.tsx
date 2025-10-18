"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; baseAlpha: number; phase: number; size: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };
type Floater = { x: number; y: number; vy: number; vx: number; char: string; size: number; rot: number; vr: number; alpha: number };

const GIFT_CHARS = ["🎁", "✨", "🎇", "�"];
const DIYA_CHARS = ["🪔", "�", "🕯️"];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
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

    const stars: Star[] = [];
    const meteors: Meteor[] = [];
    const floaters: Floater[] = [];

    function seed() {
      const w = canvas.width;
      const h = canvas.height;
      const starCount = Math.min(220, Math.floor((w * h) / 3500));
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * (w / (window.devicePixelRatio || 1)),
          y: Math.random() * (h / (window.devicePixelRatio || 1)),
          baseAlpha: rand(0.2, 0.8),
          phase: rand(0, Math.PI * 2),
          size: rand(0.5, 1.4),
        });
      }

      floaters.length = 0;
      const floaterCount = Math.max(6, Math.floor((w * h) / 180000));
      // Add regular floaters (gifts, sparkles)
      for (let i = 0; i < floaterCount; i++) {
        floaters.push({
          x: rand(-40, w / (window.devicePixelRatio || 1) + 40),
          y: rand(h / (window.devicePixelRatio || 1) * 0.6, h / (window.devicePixelRatio || 1) + 60),
          vy: rand(-0.15, -0.05),
          vx: rand(-0.03, 0.03),
          char: GIFT_CHARS[Math.floor(Math.random() * GIFT_CHARS.length)],
          size: rand(14, 24),
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.002, 0.002),
          alpha: rand(0.6, 1),
        });
      }
      // Add animated diyas/lanterns
      const diyaCount = Math.max(4, Math.floor((w * h) / 350000));
      for (let i = 0; i < diyaCount; i++) {
        floaters.push({
          x: rand(0, w / (window.devicePixelRatio || 1)),
          y: rand(h / (window.devicePixelRatio || 1) * 0.7, h / (window.devicePixelRatio || 1) + 40),
          vy: rand(-0.09, -0.03),
          vx: rand(-0.04, 0.04),
          char: DIYA_CHARS[Math.floor(Math.random() * DIYA_CHARS.length)],
          size: rand(22, 36),
          rot: rand(-0.1, 0.1),
          vr: rand(-0.001, 0.001),
          alpha: rand(0.8, 1),
        });
      }
    }
    seed();

    let lastMeteorTime = 0;

    const tick = (t: number) => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      // backdrop gradient for subtle depth
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#03040a");
      grad.addColorStop(1, "#0b0f1a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // twinkling stars
      for (const s of stars) {
        const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.phase + t * 0.002));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#dbeafe"; // soft blue-white
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // spawn meteors
      if (t - lastMeteorTime > rand(1200, 2600)) {
        lastMeteorTime = t;
        const startX = rand(-50, w * 0.2);
        const startY = rand(0, h * 0.4);
        const speed = rand(2.2, 3.4);
        meteors.push({ x: startX, y: startY, vx: speed, vy: speed * 0.5, life: 1 });
      }

      // draw meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.01;
        if (m.life <= 0 || m.x > w + 80 || m.y > h + 80) {
          meteors.splice(i, 1);
          continue;
        }
        const trail = 50;
        const grad2 = ctx.createLinearGradient(m.x - trail, m.y - trail * 0.5, m.x, m.y);
        grad2.addColorStop(0, "rgba(255,255,255,0)");
        grad2.addColorStop(1, "rgba(255,255,255,0.9)");
        ctx.strokeStyle = grad2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x - trail, m.y - trail * 0.5);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }

      // drifting gifts/diya/particles
      for (const f of floaters) {
        // Diyas/lanterns float more gently and sway
        const isDiya = DIYA_CHARS.includes(f.char);
        if (isDiya) {
          f.y += f.vy * 0.7 + Math.sin(t / 900 + f.x) * 0.04;
          f.x += f.vx * 0.5 + Math.cos(t / 1200 + f.y) * 0.03;
          f.rot += f.vr * 0.5 + Math.sin(t / 1000 + f.x) * 0.001;
        } else {
          f.y += f.vy;
          f.x += f.vx;
          f.rot += f.vr;
        }
        if (f.y < -40) {
          f.y = h + rand(10, 60);
          f.x = rand(-40, w + 40);
          f.alpha = rand(0.6, 1);
          // Randomly pick diya/lantern or regular floater
          if (Math.random() < 0.25) {
            f.char = DIYA_CHARS[Math.floor(Math.random() * DIYA_CHARS.length)];
            f.size = rand(22, 36);
          } else {
            f.char = GIFT_CHARS[Math.floor(Math.random() * GIFT_CHARS.length)];
            f.size = rand(14, 24);
          }
        }
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.globalAlpha = f.alpha;
        ctx.font = `${f.size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(f.char, 0, 0);
        ctx.restore();
      }

      if (runningRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onVisibility = () => {
      const hidden = document.hidden;
      runningRef.current = !hidden;
      if (!hidden && rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
      if (hidden && rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      rafRef.current = null;
      runningRef.current = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-screen h-screen -z-20"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden
    />
  );
}
