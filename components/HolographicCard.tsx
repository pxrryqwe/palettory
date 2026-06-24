import { hsbToCss, type HSB } from "@/lib/colour";

type Props = {
  base: HSB;
  swatches: HSB[]; // 10 modifier colours
  seed: number; // varies the pattern across rounds/sessions
};

// Small deterministic RNG so the same (seed) reproduces the same layout —
// keeps the card stable on re-render but different across rounds.
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pseudo-soap-film look: many large translucent radial blobs heavily blurred,
// then a wide diagonal specular sweep on top.
export function HolographicCard({ base, swatches, seed }: Props) {
  const palette = [base, ...swatches];
  const rng = mulberry32(seed || 1);

  const blobs = palette
    .map((c) => {
      const x = Math.round(rng() * 110 - 5); // -5..105
      const y = Math.round(rng() * 110 - 5);
      const radius = 35 + Math.round(rng() * 35); // 35..70 vw of card
      // boost brightness slightly so washed-out hues still glow
      const css = hsbToCss({
        h: c.h,
        s: Math.min(100, c.s + 5),
        b: Math.min(100, c.b + 8),
      });
      return `radial-gradient(circle at ${x}% ${y}%, ${css} 0%, transparent ${radius}%)`;
    })
    .join(", ");

  const sweepAngle = Math.round(rng() * 360);
  const sweep = `linear-gradient(${sweepAngle}deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 80%)`;
  const counterSweep = `linear-gradient(${(sweepAngle + 70) % 360}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)`;

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white">
      <div className="relative w-full aspect-[5/3]">
        {/* Blob layer — extended past edges so blur doesn't clip */}
        <div
          className="absolute -inset-[20%]"
          style={{
            background: blobs,
            filter: "blur(60px) saturate(1.35)",
          }}
        />
        {/* White haze base so colours stay pastel */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0) 70%)",
          }}
        />
        {/* Specular sweep */}
        <div
          className="absolute inset-0"
          style={{ background: sweep, mixBlendMode: "screen" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: counterSweep, mixBlendMode: "overlay" }}
        />
      </div>
      <div className="grid grid-cols-5 gap-px bg-[color:var(--color-muted)]/30">
        {swatches.map((c, i) => (
          <div
            key={i}
            className="aspect-square"
            style={{ background: hsbToCss(c) }}
            title={`H${c.h} S${c.s} B${c.b}`}
          />
        ))}
      </div>
    </div>
  );
}
