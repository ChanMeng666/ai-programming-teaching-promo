// Pure motion maths. No clocks, no Math.random, no React — every value is a
// function of the seconds passed in, so frame 900 can paint before frame 12.

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Local progress of a window that starts at `at` and lasts `dur` seconds. */
export const prog = (t: number, at: number, dur: number) => clamp((t - at) / dur);

export const easeOut = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
export const easeInOut = (p: number) => {
  const x = clamp(p);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const expoOut = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(p)));

/**
 * Closed-form step response of a damped spring, 0 -> 1. zeta < 1 overshoots.
 * `t` is seconds since release; negative time is rest at 0.
 */
export const spring = (t: number, omega = 14, zeta = 0.62) => {
  if (t <= 0) return 0;
  if (zeta >= 1) return 1 - Math.exp(-omega * t) * (1 + omega * t);
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
};

/** A decaying ring for a pressed control: 0 at rest, peaks just after `at`. */
export const ring = (t: number, at: number) => {
  const x = t - at;
  return x < 0 ? 0 : Math.exp(-9 * x) * Math.sin(28 * x);
};
/** Press dip: 1 -> 0.9 -> 1 over ~0.22 s around `at`. */
export const press = (t: number, at: number) => {
  const x = (t - at) / 0.22;
  return x < 0 || x > 1 ? 1 : 1 - 0.1 * Math.sin(Math.PI * x);
};

/** Seeded integer hash -> [0, 1). The one permitted entropy source. */
export const hash = (n: number) => {
  let x = (n | 0) + 0x7ed55d16;
  x = Math.imul(x ^ (x >>> 15), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};

/** Entrance: rises `dy` px on a spring; opacity leads so it never reads as a fade. */
export const rise = (t: number, at: number, dy = 28, omega = 13, zeta = 0.78) => {
  const k = spring(t - at, omega, zeta);
  return { opacity: clamp((t - at) * 7), transform: `translateY(${(1 - k) * dy}px)` };
};
/** Entrance: pops from 0.6 scale with a little overshoot. */
export const pop = (t: number, at: number, omega = 16, zeta = 0.5) => {
  const k = spring(t - at, omega, zeta);
  return { opacity: clamp((t - at) * 9), transform: `scale(${lerp(0.6, 1, k)})` };
};

/** How many characters of a typed string are out at `t`. */
export const typed = (t: number, at: number, cps: number, len: number) => Math.round(clamp((t - at) * cps, 0, len));
/** Caret: solid while typing, blinking afterwards. */
export const caretOn = (t: number, typing: boolean) => typing || Math.floor(t * 2.4) % 2 === 0;

/** Hermite-smoothed path through {t,x,y} knots — the cursor's hand. */
export type Knot = { t: number; x: number; y: number };
export const along = (knots: Knot[], t: number) => {
  if (t <= knots[0].t) return knots[0];
  for (let i = 1; i < knots.length; i++) {
    if (t <= knots[i].t) {
      const a = knots[i - 1], b = knots[i];
      const p = easeInOut((t - a.t) / (b.t - a.t));
      return { t, x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) - Math.sin(p * Math.PI) * 14 };
    }
  }
  return knots[knots.length - 1];
};

/** Multi-key scalar interpolation with eased segments. */
export const kf = (keys: [number, number][], t: number, ease = easeInOut) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], ease((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
  }
  return keys[keys.length - 1][1];
};
