"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { HSBSliders } from "@/components/HSBSliders";
import {
  MODIFIERS,
  clampHsb,
  hsbToCss,
  type HSB,
  type Modifier,
} from "@/lib/colour";
import { loadSession, updateSession, type Session } from "@/lib/session";

export default function ShiftPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<HSB | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    if (!s.chosenBase || !s.bases[s.chosenBase]) {
      router.replace("/base");
      return;
    }
    // resume position
    const done = MODIFIERS.findIndex((m) => !s.modifiers[m]);
    const startAt = done === -1 ? MODIFIERS.length - 1 : done;
    setIndex(startAt);
    const baseAns = s.bases[s.chosenBase]!;
    const existing = s.modifiers[MODIFIERS[startAt]];
    setDraft(existing ? { h: existing.h, s: existing.s, b: existing.b } : baseAns);
    const fadeOut = setTimeout(() => setIntroFading(true), 2800);
    const hide = setTimeout(() => setShowIntro(false), 4000);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [router]);

  if (!session || !draft) return null;

  if (showIntro) {
    return (
      <main
        className={`flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full transition-opacity duration-1000 ease-in-out ${
          introFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <BrandLogo size="sm" />
        <p className="my-auto text-center font-brand text-2xl leading-relaxed intro-text">
          Great choice!
          <br />
          Now let&apos;s see how it shifts.
        </p>
      </main>
    );
  }

  const modifier: Modifier = MODIFIERS[index];
  const baseAns = session.bases[session.chosenBase!]!;

  const next = () => {
    const safe = clampHsb(draft.h, draft.s, draft.b);
    const updated = updateSession((s) => ({
      ...s,
      modifiers: {
        ...s.modifiers,
        [modifier]: { modifier, ...safe },
      },
    }));
    setSession(updated);
    if (index === MODIFIERS.length - 1) {
      router.push("/result");
      return;
    }
    const nextIdx = index + 1;
    setIndex(nextIdx);
    // reset draft to current base for next modifier
    setDraft({ h: baseAns.h, s: baseAns.s, b: baseAns.b });
  };

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full">
      <BrandLogo size="sm" />
      <p className="mt-4 text-center text-sm text-[color:var(--color-muted)]">
        {index + 1}/{MODIFIERS.length}
      </p>
      <p className="mt-2 text-center text-sm">Shift the colour to feel:</p>
      <p className="mt-1 text-center font-brand text-3xl capitalize">
        {session.chosenBase} + {modifier}
      </p>

      <div
        className="mt-6 w-full h-40 rounded-3xl border border-[color:var(--color-muted)]/30"
        style={{ background: hsbToCss(draft) }}
      />

      <div className="mt-8 w-full">
        <HSBSliders value={draft} onChange={(v) => setDraft(clampHsb(v.h, v.s, v.b))} />
      </div>

      <button
        type="button"
        onClick={next}
        className="mt-auto w-full bg-[color:var(--color-ink)] text-white font-brand text-xl py-4 rounded-full"
      >
        {index === MODIFIERS.length - 1 ? "See my palette" : "Next"}
      </button>
    </main>
  );
}
