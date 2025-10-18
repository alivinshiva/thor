"use client";

import { useMemo, useState } from "react";
import Fireworks from "@/components/Fireworks";
import NightSky from "@/components/NightSky";
import BombCursor from "@/components/BombCursor";


export default function Home() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string>(
    `🎉 Happy Diwali ${year}! 🎆\n\nMay your life be filled with light, joy, and prosperity. Wishing you and your family a sparkling and safe Diwali! ✨\n\nWith warm wishes,\n— Sent via Thor`
  );

  // Only digits for phone
  const numericPhone = useMemo(() => phone.replace(/\D+/g, ""), [phone]);
  const hasBasicPhone = numericPhone.length >= 8;
  // Remove + from code for wa.me
  const waCode = countryCode.replace(/[^\d]/g, "");
  const fullNumber = waCode + numericPhone;

  const waHref = hasBasicPhone
    ? `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`
    : undefined;
  const smsHref = hasBasicPhone
    ? `sms:${countryCode}${numericPhone}?body=${encodeURIComponent(message)}`
    : undefined;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (_) {}
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <NightSky />
      <Fireworks />
      {/* Bomb cursor and explosion logic */}
      <BombCursor
        triggerExplosion={(setTrigger: (x: number, y: number) => void) => {
          (window as any).triggerBombExplosion = setTrigger;
        }}
      />
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-3 mb-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-extrabold text-lg shadow-xl mb-2 transition-all duration-200 border-2 border-yellow-300 bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 focus:ring-4 focus:ring-yellow-300 animate-bounce"
            style={{
              fontSize: 22,
              boxShadow: "0 0 16px 4px #ffe066, 0 2px 8px #0004",
              textShadow: "0 2px 8px #fff8, 0 0 2px #ff0",
            }}
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).triggerBombExplosion) {
                // Use last mouse position
                const e = window.event as MouseEvent | undefined;
                let x = window.innerWidth / 2, y = window.innerHeight / 2;
                if (e && typeof e.clientX === "number") {
                  x = e.clientX;
                  y = e.clientY;
                } else if (document.body) {
                  // fallback: try to get from BombCursor
                  const bomb = document.querySelector('[aria-hidden][style*="🧨"]');
                  if (bomb) {
                    const rect = (bomb as HTMLElement).getBoundingClientRect();
                    x = rect.left + rect.width / 2;
                    y = rect.top + rect.height / 2;
                  }
                }
                (window as any).triggerBombExplosion(x, y);
              }
            }}
          >
            <span className="animate-pulse">🧨</span>
            <span className="drop-shadow-lg">Light the Bomb</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            🪔 Happy Diwali {year} ✨
          </h1>
          <p className="text-foreground/80">
            Send a warm Diwali wish to your friends in one click.
          </p>
        </div>

        <div className="space-y-6 rounded-lg border border-foreground/15 p-5 md:p-6">
          <div className="grid gap-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Friend's phone number
            </label>
            <div className="flex gap-2">
              <select
                id="countryCode"
                className="rounded-md border border-foreground/20 bg-transparent px-2 py-2 outline-none focus:border-foreground/40 text-sm"
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                style={{ minWidth: 80 }}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+880">🇧🇩 +880</option>
                
              </select>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="Phone number"
                className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 outline-none focus:border-foreground/40"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ minWidth: 0 }}
              />
            </div>
            {!hasBasicPhone && phone && (
              <p className="text-sm text-red-500">Please enter a valid phone number.</p>
            )}
            <p className="text-xs text-foreground/60">
              Country code is required for WhatsApp/SMS. Default is India (+91).
            </p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              Your Diwali wish (editable)
            </label>
            <textarea
              id="message"
              rows={6}
              className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 leading-relaxed outline-none focus:border-foreground/40"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setMessage(
                    `🎊 Happy Diwali ${year}! 🎇\n\nWishing you endless light, love, and prosperity. May this festival bring new beginnings and sweet moments to cherish. ✨\n\nWarm wishes,\n— Sent via Thor`
                  )
                }
                className="inline-flex items-center rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
              >
                Use another template
              </button>
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
              >
                Copy message
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1 justify-center">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!hasBasicPhone}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-extrabold text-lg shadow-xl transition-all duration-200 border-2 border-green-400 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white hover:from-green-300 hover:to-green-500 hover:scale-105 focus:ring-4 focus:ring-green-300 ${
                hasBasicPhone ? "" : "bg-foreground/20 text-foreground/60 cursor-not-allowed border-foreground/20"
              }`}
              style={{
                boxShadow: hasBasicPhone ? "0 0 16px 4px #4ade80, 0 2px 8px #0004" : undefined,
                textShadow: hasBasicPhone ? "0 2px 8px #fff8, 0 0 2px #0f0" : undefined,
                opacity: hasBasicPhone ? 1 : 0.7,
              }}
            >
              <span className="text-2xl">🟢</span>
              <span>Send via WhatsApp</span>
            </a>
            <a
              href={smsHref}
              aria-disabled={!hasBasicPhone}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-extrabold text-lg shadow-xl transition-all duration-200 border-2 border-blue-400 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:from-blue-300 hover:to-blue-500 hover:scale-105 focus:ring-4 focus:ring-blue-300 ${
                hasBasicPhone ? "" : "bg-foreground/20 text-foreground/60 cursor-not-allowed border-foreground/20"
              }`}
              style={{
                boxShadow: hasBasicPhone ? "0 0 16px 4px #60a5fa, 0 2px 8px #0004" : undefined,
                textShadow: hasBasicPhone ? "0 2px 8px #fff8, 0 0 2px #00f" : undefined,
                opacity: hasBasicPhone ? 1 : 0.7,
              }}
            >
              <span className="text-2xl">💬</span>
              <span>Send via SMS</span>
            </a>
          </div>

          <p className="text-xs text-foreground/60">
            Sending opens your messaging app with the message pre-filled. You can edit before sending.
          </p>
        </div>
      </div>
    </main>
  );
}
