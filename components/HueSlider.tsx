"use client";

type Props = {
  value: number; // 0–360
  onChange: (h: number) => void;
  started: boolean;
  onStart: () => void;
};

const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0 80% 60%), hsl(60 80% 60%), hsl(120 80% 60%), hsl(180 80% 60%), hsl(240 80% 60%), hsl(300 80% 60%), hsl(360 80% 60%))";

export function HueSlider({ value, onChange, started, onStart }: Props) {
  return (
    <div className="w-full px-2">
      <input
        type="range"
        min={0}
        max={360}
        step={1}
        value={value}
        onChange={(e) => {
          if (!started) onStart();
          onChange(Number(e.target.value));
        }}
        onMouseDown={() => !started && onStart()}
        onTouchStart={() => !started && onStart()}
        className="range-track"
        style={{ background: started ? HUE_GRADIENT : "#d1d1cf" }}
        aria-label="Hue"
      />
      <div className="mt-2 text-center text-xs text-[color:var(--color-muted)]">
        {started ? `Hue ${Math.round(value)}°` : "Drag to start"}
      </div>
    </div>
  );
}
