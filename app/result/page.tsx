"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { BrandLogo } from "@/components/BrandLogo";
import { HolographicCard } from "@/components/HolographicCard";
import { MODIFIERS, type HSB } from "@/lib/colour";
import { loadSession, resetSession, saveSession, type Session } from "@/lib/session";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type SubmitState = "submitting" | "done" | "error" | "skipped";

export default function ResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [progress, setProgress] = useState(0);
  const [submit, setSubmit] = useState<SubmitState>("submitting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    if (!s.chosenBase || MODIFIERS.some((m) => !s.modifiers[m])) {
      router.replace("/base");
      return;
    }
    void submitAll(s);
    // animate progress 0→100 over ~1.2s for the evaluate transition
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 5));
    }, 60);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitAll(s: Session) {
    if (s.submitted) {
      setSubmit("done");
      return;
    }
    const participantRow = {
      id: s.participantId,
      over_18: s.over18,
      chosen_base: s.chosenBase,
      completed_at: new Date().toISOString(),
    };
    const responseRows = [
      ...Object.values(s.bases).map((b) => ({
        participant_id: s.participantId,
        step: "base" as const,
        base_quality: b!.quality,
        modifier: null,
        round: s.round,
        h: b!.h,
        s: b!.s,
        b: b!.b,
      })),
      ...Object.values(s.modifiers).map((m) => ({
        participant_id: s.participantId,
        step: "modifier" as const,
        base_quality: s.chosenBase,
        modifier: m!.modifier,
        round: s.round,
        h: m!.h,
        s: m!.s,
        b: m!.b,
      })),
    ];

    if (!supabaseConfigured || !supabase) {
      console.info("[Palettory] local mode — payload not sent:", {
        participant: participantRow,
        responses: responseRows,
      });
      saveSession({ ...s, submitted: true });
      setSubmit("skipped");
      return;
    }
    try {
      const { error: pErr } = await supabase
        .from("participants")
        .insert(participantRow);
      if (pErr) throw pErr;
      const { error: rErr } = await supabase
        .from("responses")
        .insert(responseRows);
      if (rErr) throw rErr;

      saveSession({ ...s, submitted: true });
      setSubmit("done");
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "unknown error");
      setSubmit("error");
    }
  }

  if (!session) return null;

  const swatches: HSB[] = MODIFIERS.map((m) => {
    const v = session.modifiers[m]!;
    return { h: v.h, s: v.s, b: v.b };
  });
  const baseAns = session.bases[session.chosenBase!]!;
  const baseColor: HSB = { h: baseAns.h, s: baseAns.s, b: baseAns.b };
  // Deterministic seed from participantId + round so pattern is stable on
  // re-render but flips when the user starts a fresh palette.
  const seed =
    [...session.participantId].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) +
    session.round * 1009;

  // Show evaluate transition until progress reaches 100 + submission resolves
  const showing = progress < 100 || submit === "submitting";

  if (showing) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <BrandLogo size="sm" />
        <p className="mt-24 text-center font-brand text-2xl">
          Now let&apos;s see your palette!
        </p>
        <div className="w-full mt-8 px-2">
          <div className="h-3 bg-[color:var(--color-card)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[color:var(--color-ink)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-xs mt-2">{progress}%</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full">
      <BrandLogo size="sm" />
      <p className="mt-6 self-start font-brand text-2xl">Your palette :</p>

      <div ref={cardRef} className="w-full mt-4">
        <HolographicCard base={baseColor} swatches={swatches} seed={seed} />
      </div>

      {submit === "error" && (
        <p className="text-xs text-red-600 mt-3 text-center">
          Couldn&apos;t save: {errorMsg}. Your palette still shows below.
        </p>
      )}
      {submit === "skipped" && (
        <p className="text-[10px] text-[color:var(--color-muted)] mt-2 text-center">
          local mode · payload logged to console
        </p>
      )}

      <button
        type="button"
        onClick={async () => {
          if (!cardRef.current) return;
          try {
            const dataUrl = await toPng(cardRef.current, {
              pixelRatio: 3,
              cacheBust: true,
              backgroundColor: "#ffffff",
            });
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `palette-${session.participantId}.png`;
            a.click();
          } catch (e) {
            console.error("Save failed", e);
          }
        }}
        className="mt-6 w-full border border-[color:var(--color-ink)] text-[color:var(--color-ink)] font-brand text-lg py-3 rounded-full"
      >
        Save
      </button>

      <button
        type="button"
        onClick={() => {
          resetSession();
          router.push("/");
        }}
        className="mt-auto w-full bg-[color:var(--color-ink)] text-white font-brand text-xl py-4 rounded-full"
      >
        Create another palette
      </button>
    </main>
  );
}
