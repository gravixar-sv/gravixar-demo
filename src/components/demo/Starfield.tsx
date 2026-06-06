import type { CSSProperties } from "react";

// Decorative starfield for the constellation backdrop. Seeded with fixed
// values so the server and client render byte-identical output (no
// Math.random in render = no hydration mismatch). A subset of stars twinkle
// asynchronously, and a few rare shooting stars streak across on a long,
// delayed loop. All motion is CSS and disabled under prefers-reduced-motion.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = {
  x: string;
  y: string;
  size: string;
  o: string;
  twinkle: boolean;
  dur: string;
  delay: string;
};

const STARS: Star[] = (() => {
  const rnd = mulberry32(20260607);
  const out: Star[] = [];
  for (let i = 0; i < 76; i++) {
    out.push({
      x: (rnd() * 100).toFixed(2),
      y: (rnd() * 100).toFixed(2),
      size: (0.6 + rnd() * 1.7).toFixed(2),
      o: (0.2 + rnd() * 0.62).toFixed(2),
      twinkle: rnd() < 0.5, // half the field shimmers
      dur: (2.6 + rnd() * 4).toFixed(2),
      delay: (rnd() * 6).toFixed(2),
    });
  }
  return out;
})();

type Shooter = {
  top: string;
  left: string;
  ang: string;
  len: string;
  dist: string;
  dur: string;
  delay: string;
};

const SHOOTERS: Shooter[] = (() => {
  const rnd = mulberry32(424242);
  const out: Shooter[] = [];
  for (let i = 0; i < 3; i++) {
    out.push({
      top: (rnd() * 42).toFixed(1),
      left: (8 + rnd() * 55).toFixed(1),
      ang: (16 + rnd() * 24).toFixed(1),
      len: (110 + rnd() * 80).toFixed(0),
      dist: (280 + rnd() * 240).toFixed(0),
      dur: (13 + rnd() * 9).toFixed(1),
      delay: (i * 6 + rnd() * 5).toFixed(1),
    });
  }
  return out;
})();

export function Starfield({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-white ${s.twinkle ? "twinkle" : ""}`}
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.o,
              ...(s.twinkle
                ? { "--o": s.o, "--dur": `${s.dur}s`, "--delay": `${s.delay}s` }
                : {}),
            } as CSSProperties
          }
        />
      ))}
      {SHOOTERS.map((s, i) => (
        <span
          key={`shoot-${i}`}
          className="shooting-star"
          style={
            {
              top: `${s.top}%`,
              left: `${s.left}%`,
              "--ang": `${s.ang}deg`,
              "--len": `${s.len}px`,
              "--dist": `${s.dist}px`,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
