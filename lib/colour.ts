export type HSB = { h: number; s: number; b: number };

export const BASE_DEFAULT_S = 50;
export const BASE_DEFAULT_B = 80;

export const BASE_QUALITIES = ["sweet", "sour", "warm", "cool"] as const;
export type BaseQuality = (typeof BASE_QUALITIES)[number];

export const MODIFIERS = [
  "heavy",
  "light",
  "rich",
  "soft",
  "sharp",
  "smooth",
  "bright",
  "dark",
  "dry",
  "wet",
] as const;
export type Modifier = (typeof MODIFIERS)[number];

export function hsbToCss({ h, s, b }: HSB): string {
  // HSB (a.k.a. HSV) → HSL conversion, then emit hsl() CSS
  const sFrac = s / 100;
  const bFrac = b / 100;
  const l = (bFrac * (2 - sFrac)) / 2;
  const sl = l === 0 || l === 1 ? 0 : (bFrac - l) / Math.min(l, 1 - l);
  return `hsl(${h} ${Math.round(sl * 100)}% ${Math.round(l * 100)}%)`;
}

export function clampHsb(h: number, s: number, b: number): HSB {
  return {
    h: ((Math.round(h) % 360) + 360) % 360,
    s: Math.max(0, Math.min(100, Math.round(s))),
    b: Math.max(0, Math.min(100, Math.round(b))),
  };
}
