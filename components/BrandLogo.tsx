type Props = { size?: "sm" | "lg"; className?: string };

const LETTER_COLORS = [
  "#E63946", // P
  "#F4A300", // a
  "#7CB342", // l
  "#2BB673", // e
  "#1E88E5", // t
  "#5E35B1", // t
  "#9C27B0", // o
  "#E91E63", // r
  "#FF7043", // y
];

export function BrandLogo({ size = "sm", className = "" }: Props) {
  const letters = "Palettory".split("");
  const fontClass = size === "lg" ? "text-6xl" : "text-2xl";
  return (
    <h1
      className={`font-brand ${fontClass} tracking-tight ${className}`}
      aria-label="Palettory"
    >
      {letters.map((ch, i) => (
        <span key={i} style={{ color: LETTER_COLORS[i % LETTER_COLORS.length] }}>
          {ch}
        </span>
      ))}
    </h1>
  );
}
