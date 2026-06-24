"use client";

import { hsbToCss, type HSB } from "@/lib/colour";

type Props = {
  value: HSB;
  onChange: (next: HSB) => void;
};

const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0 80% 60%), hsl(60 80% 60%), hsl(120 80% 60%), hsl(180 80% 60%), hsl(240 80% 60%), hsl(300 80% 60%), hsl(360 80% 60%))";

export function HSBSliders({ value, onChange }: Props) {
  const satGradient = `linear-gradient(to right, ${hsbToCss({ h: value.h, s: 0, b: value.b })}, ${hsbToCss({ h: value.h, s: 100, b: value.b })})`;
  const brightGradient = `linear-gradient(to right, ${hsbToCss({ h: value.h, s: value.s, b: 0 })}, ${hsbToCss({ h: value.h, s: value.s, b: 100 })})`;

  return (
    <div className="w-full space-y-5">
      <SliderRow
        label="Hue"
        min={0}
        max={360}
        value={value.h}
        background={HUE_GRADIENT}
        onChange={(h) => onChange({ ...value, h })}
        display={`${Math.round(value.h)}°`}
      />
      <SliderRow
        label="Saturation"
        min={0}
        max={100}
        value={value.s}
        background={satGradient}
        onChange={(s) => onChange({ ...value, s })}
        display={`${Math.round(value.s)}%`}
      />
      <SliderRow
        label="Brightness"
        min={0}
        max={100}
        value={value.b}
        background={brightGradient}
        onChange={(b) => onChange({ ...value, b })}
        display={`${Math.round(value.b)}%`}
      />
    </div>
  );
}

function SliderRow({
  label,
  min,
  max,
  value,
  background,
  onChange,
  display,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  background: string;
  onChange: (n: number) => void;
  display: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-[color:var(--color-muted)] mb-1 px-1">
        <span>{label}</span>
        <span>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-track"
        style={{ background }}
        aria-label={label}
      />
    </div>
  );
}
