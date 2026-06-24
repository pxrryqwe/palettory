"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { BASE_QUALITIES, hsbToCss, type BaseQuality } from "@/lib/colour";
import { loadSession, updateSession, type Session } from "@/lib/session";

export default function LikePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [pick, setPick] = useState<BaseQuality | null>(null);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    if (s.chosenBase) setPick(s.chosenBase);
  }, []);

  if (!session) return null;

  // Guard: redirect home if bases not complete
  const ready = BASE_QUALITIES.every((q) => session.bases[q]);
  if (!ready) {
    if (typeof window !== "undefined") router.replace("/base");
    return null;
  }

  const onConfirm = () => {
    if (!pick) return;
    updateSession((s) => ({ ...s, chosenBase: pick, modifiers: {} }));
    router.push("/shift");
  };

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full">
      <BrandLogo size="sm" />
      <div className="my-auto w-full flex flex-col items-center">
      <p className="text-center font-brand text-lg whitespace-nowrap">
        Which colour do you <i>like</i> the most?
      </p>

      <div className="grid grid-cols-2 gap-4 w-full mt-8">
        {BASE_QUALITIES.map((q) => {
          const filled = session.bases[q]!;
          const selected = pick === q;
          return (
            <button
              key={q}
              type="button"
              onClick={() => setPick(q)}
              className={`aspect-square rounded-2xl relative overflow-hidden text-left p-4 transition ${
                selected
                  ? "ring-4 ring-[color:var(--color-ink)]"
                  : "border border-[color:var(--color-muted)]/30"
              }`}
              style={{ background: hsbToCss(filled) }}
            >
              <span
                className="font-brand text-lg capitalize absolute top-5 left-4 leading-none"
                style={{ color: "rgba(0,0,0,0.75)" }}
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
        disabled={!pick}
        onClick={onConfirm}
        className="mb-2 w-full bg-[color:var(--color-ink)] text-white font-brand text-xl py-4 rounded-full disabled:opacity-40 capitalize"
      >
        {pick ? `Select ${pick} colour` : "Pick one"}
      </button>
    </main>
  );
}
