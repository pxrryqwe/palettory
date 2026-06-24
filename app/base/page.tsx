"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { HueSlider } from "@/components/HueSlider";
import {
  BASE_DEFAULT_B,
  BASE_DEFAULT_S,
  BASE_QUALITIES,
  hsbToCss,
  type BaseQuality,
} from "@/lib/colour";
import { loadSession, updateSession, type Session } from "@/lib/session";

export default function BasePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [active, setActive] = useState<BaseQuality | null>(null);
  const [draftHue, setDraftHue] = useState(180);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  if (!session) return null;

  const allDone = BASE_QUALITIES.every((q) => session.bases[q]);

  const openPicker = (q: BaseQuality) => {
    const existing = session.bases[q];
    setActive(q);
    setDraftHue(existing?.h ?? 180);
    setStarted(Boolean(existing));
  };

  const confirm = () => {
    if (!active) return;
    const next = updateSession((s) => ({
      ...s,
      bases: {
        ...s.bases,
        [active]: {
          quality: active,
          h: draftHue,
          s: started ? BASE_DEFAULT_S : 0,
          b: started ? BASE_DEFAULT_B : 50,
        },
      },
    }));
    setSession(next);
    setActive(null);
  };

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full">
      <BrandLogo size="sm" />
      <div className="my-auto w-full flex flex-col items-center">
      <p className="text-center font-brand text-lg whitespace-nowrap">
        Choose a colour that <i>feels</i> like :
      </p>

      <div className="grid grid-cols-2 gap-4 w-full mt-6">
        {BASE_QUALITIES.map((q) => {
          const filled = session.bases[q];
          const bg = filled
            ? hsbToCss(filled)
            : "transparent";
          return (
            <button
              key={q}
              type="button"
              onClick={() => openPicker(q)}
              className="aspect-square rounded-2xl border border-muted/40 relative overflow-hidden text-left p-4"
              style={{ background: bg }}
            >
              <span
                className="font-brand text-lg capitalize absolute top-5 left-4 leading-none"
                style={{ color: filled ? "rgba(0,0,0,0.75)" : "var(--color-ink)" }}
              >
                {q}
              </span>
            </button>
          );
        })}
      </div>
      </div>

      <button
        type="button"
        disabled={!allDone}
        onClick={() => router.push("/like")}
        className="mb-2 w-full bg-[color:var(--color-ink)] text-white font-brand text-xl py-4 rounded-full disabled:opacity-40"
      >
        Next
      </button>

      {active && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-md bg-[color:var(--color-bg)] rounded-t-3xl p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-10 h-1 bg-[color:var(--color-muted)]/50 rounded-full" />
            <p className="text-center font-brand text-xl mt-4 capitalize">
              {active}
            </p>
            <div
              className="mt-5 mx-auto rounded-2xl"
              style={{
                width: 160,
                height: 160,
                background: started
                  ? hsbToCss({ h: draftHue, s: BASE_DEFAULT_S, b: BASE_DEFAULT_B })
                  : "#cfcfcd",
              }}
            />
            <div className="mt-6">
              <HueSlider
                value={draftHue}
                onChange={setDraftHue}
                started={started}
                onStart={() => setStarted(true)}
              />
            </div>
            <button
              type="button"
              disabled={!started}
              onClick={confirm}
              className="mt-6 w-full bg-[color:var(--color-ink)] text-white font-brand text-lg py-3 rounded-full disabled:opacity-40"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
