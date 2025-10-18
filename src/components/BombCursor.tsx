"use client";
import { useEffect, useRef, useState } from "react";

type Explosion = { x: number; y: number; t: number };

export default function BombCursor({ triggerExplosion }: { triggerExplosion: (fn: (x: number, y: number) => void) => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Track mouse position
  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Expose explosion trigger
  useEffect(() => {
    triggerExplosion((x, y) => {
      setExplosions((prev) => [...prev, { x, y, t: Date.now() }]);
    });
  }, [triggerExplosion]);

  // Animate and remove explosions
  useEffect(() => {
    if (!explosions.length) return;
    let running = true;
    function tick() {
      setExplosions((prev) => prev.filter((e) => Date.now() - e.t < 700));
      if (running) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [explosions.length]);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* Bomb cursor */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          pointerEvents: "none",
          zIndex: 10000,
          transform: "translate(-50%, -50%) scale(1.2)",
          fontSize: 32,
          userSelect: "none",
          transition: "filter 0.1s",
          filter: explosions.length ? "brightness(1.5) blur(1px)" : "none",
        }}
        aria-hidden
      >
        🧨
      </div>
      {/* Explosions */}
      {explosions.map((e, i) => (
        <ExplosionAnim key={e.t + ":" + i} x={e.x} y={e.y} />
      ))}
    </>
  );
}

function ExplosionAnim({ x, y }: { x: number; y: number }) {
  // Simple radial burst with emoji and colored circles
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 700);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 10001,
        transform: "translate(-50%, -50%)",
        animation: "bomb-explode 0.7s cubic-bezier(.7,0,.3,1)",
      }}
      aria-hidden
    >
      <span style={{ fontSize: 36, filter: "drop-shadow(0 0 8px #ff0)" }}>💥</span>
      <span style={{
        position: "absolute",
        left: -24,
        top: -24,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "radial-gradient(circle, #fffa 0%, #f00a 60%, transparent 100%)",
        opacity: 0.7,
        pointerEvents: "none",
      }} />
    </div>
  );
}

// Add keyframes for explosion
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `@keyframes bomb-explode {
    0% { opacity: 0; transform: scale(0.5) translate(-50%, -50%); }
    30% { opacity: 1; transform: scale(1.2) translate(-50%, -50%); }
    100% { opacity: 0; transform: scale(2.2) translate(-50%, -50%); }
  }`;
  document.head.appendChild(style);
}