"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { updateSession, resetSession, loadSession } from "@/lib/session";

const FEATURES = [
  {
    icon: "palette",
    title: "Pick colours that match your feelings",
    desc: "No right or wrong — just go with your instinct.",
  },
  {
    icon: "tune",
    title: "Adjust and explore",
    desc: "See how your colours shift when feelings change.",
  },
  {
    icon: "auto_awesome",
    title: "Get your unique palette card",
    desc: "A personalised colour card you can save and share.",
  },
  {
    icon: "schedule",
    title: "Takes only 5 minutes",
    desc: "Quick, fun, and totally anonymous.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [over18, setOver18] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (s.over18) setOver18(true);
  }, []);

  const onStart = () => {
    if (!over18) return;
    resetSession();
    updateSession((s) => ({ ...s, over18: true }));
    router.push("/base");
  };

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10 max-w-md mx-auto w-full">
      <div className="mt-6 text-center">
        <BrandLogo size="lg" />
        <p className="mt-2 text-sm font-sans text-[color:var(--color-muted)]">
          Turn your feelings into your palette
        </p>
      </div>

      <ul className="w-full mt-10 space-y-3">
        {FEATURES.map((f) => (
          <li
            key={f.title}
            className="flex items-start gap-3 bg-[color:var(--color-card)] rounded-2xl p-4"
          >
            <span
              className="material-symbols-rounded text-[28px] mt-0.5 text-[color:var(--color-ink)]"
              aria-hidden
            >
              {f.icon}
            </span>
            <div>
              <div className="font-semibold text-sm">{f.title}</div>
              <div className="text-xs text-[color:var(--color-muted)] mt-0.5">
                {f.desc}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <label className="w-full mt-8 flex items-center gap-3 cursor-pointer select-none px-1">
        <input
          type="checkbox"
          checked={over18}
          onChange={(e) => setOver18(e.target.checked)}
          className="w-5 h-5 accent-[color:var(--color-ink)]"
        />
        <span className="text-sm">I confirm I am 18 years old or older.</span>
      </label>

      <button
        type="button"
        onClick={onStart}
        disabled={!over18}
        className="mt-6 w-full text-center bg-[color:var(--color-ink)] text-white font-brand text-xl py-4 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start exploring
      </button>

      <small className="text-center mt-4 text-[color:var(--color-muted)]">This is part of an MSc User Experience Design pilot study. Your responses will help us explore how people perceive sensory qualities.</small>

    </main>
  );
}
