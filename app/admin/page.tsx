"use client";

import { useState } from "react";
import {
  BASE_QUALITIES,
  MODIFIERS,
  hsbToCss,
  type HSB,
} from "@/lib/colour";

type CategoryKind = "base" | "modifier";
type CategoryOption = { kind: CategoryKind; value: string };
const CATEGORIES: CategoryOption[] = [
  ...BASE_QUALITIES.map((v) => ({ kind: "base" as const, value: v })),
  ...MODIFIERS.map((v) => ({ kind: "modifier" as const, value: v })),
];

type Participant = {
  id: string;
  over_18: boolean;
  chosen_base: string | null;
  created_at: string;
  completed_at: string | null;
};

type ResponseRow = {
  id: number;
  participant_id: string;
  step: "base" | "modifier";
  base_quality: string | null;
  modifier: string | null;
  round: number;
  h: number;
  s: number;
  b: number;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [responses, setResponses] = useState<ResponseRow[] | null>(null);
  const [catIdx, setCatIdx] = useState(0);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = (await res.json()) as {
        participants: Participant[];
        responses: ResponseRow[];
      };
      setParticipants(j.participants);
      setResponses(j.responses);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadCsv() {
    if (!participants || !responses) return;
    const rows: string[] = [];
    rows.push(
      [
        "participant_id",
        "over_18",
        "chosen_base",
        "participant_created_at",
        "completed_at",
        "step",
        "base_quality",
        "modifier",
        "round",
        "h",
        "s",
        "b",
        "h_delta",
        "s_delta",
        "b_delta",
        "response_created_at",
      ].join(","),
    );
    const byPid = new Map<string, Participant>();
    for (const p of participants) byPid.set(p.id, p);
    for (const r of responses) {
      const p = byPid.get(r.participant_id);
      const d = deltas(r);
      rows.push(
        [
          r.participant_id,
          p?.over_18 ?? "",
          p?.chosen_base ?? "",
          p?.created_at ?? "",
          p?.completed_at ?? "",
          r.step,
          r.base_quality ?? "",
          r.modifier ?? "",
          r.round,
          r.h,
          r.s,
          r.b,
          d?.dh ?? "",
          d?.ds ?? "",
          d?.db ?? "",
          r.created_at,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palettory-export-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const loaded = participants && responses;

  // For a modifier response, the "original" is the chosen base response from
  // the same participant + round. Hue wraps on a 360-degree wheel, so the
  // delta is the shortest signed angular distance.
  function findOriginal(r: ResponseRow): ResponseRow | null {
    if (!responses || r.step !== "modifier") return null;
    const p = participants?.find((pp) => pp.id === r.participant_id);
    const base = p?.chosen_base ?? r.base_quality;
    return (
      responses.find(
        (x) =>
          x.participant_id === r.participant_id &&
          x.step === "base" &&
          x.base_quality === base &&
          x.round === r.round,
      ) ?? null
    );
  }

  function hueDelta(h: number, h0: number): number {
    let d = ((h - h0) % 360 + 540) % 360 - 180;
    return Math.round(d);
  }

  function deltas(
    r: ResponseRow,
  ): { dh: number; ds: number; db: number } | null {
    const o = findOriginal(r);
    if (!o) return null;
    return {
      dh: hueDelta(r.h, o.h),
      ds: r.s - o.s,
      db: r.b - o.b,
    };
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
      <h1 className="font-brand text-3xl">Admin</h1>

      {!loaded && (
        <div className="mt-6 flex gap-2 max-w-sm">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="admin password"
            className="flex-1 border border-[color:var(--color-muted)]/40 rounded-lg px-3 py-2 bg-white"
          />
          <button
            type="button"
            onClick={load}
            disabled={loading || !password}
            className="bg-[color:var(--color-ink)] text-white font-brand px-4 py-2 rounded-lg disabled:opacity-40"
          >
            {loading ? "…" : "Load"}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loaded && (
        <>
          <div className="mt-6 flex items-center gap-4">
            <p className="text-sm text-[color:var(--color-muted)]">
              {participants.length} participants · {responses.length} responses
            </p>
            <button
              type="button"
              onClick={downloadCsv}
              className="text-sm border border-[color:var(--color-ink)] px-3 py-1 rounded-full"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={load}
              className="text-sm border border-[color:var(--color-ink)] px-3 py-1 rounded-full"
            >
              Refresh
            </button>
          </div>

          <h2 className="mt-8 font-brand text-xl">By category</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c, i) => (
              <button
                key={`${c.kind}-${c.value}`}
                type="button"
                onClick={() => setCatIdx(i)}
                className={`text-xs px-3 py-1 rounded-full capitalize border ${
                  i === catIdx
                    ? "bg-[color:var(--color-ink)] text-white border-[color:var(--color-ink)]"
                    : "border-[color:var(--color-muted)]/40"
                }`}
              >
                {c.kind === "base" ? "base · " : ""}
                {c.value}
              </button>
            ))}
          </div>
          {(() => {
            const cat = CATEGORIES[catIdx];
            const rows = responses.filter((r) =>
              cat.kind === "base"
                ? r.step === "base" && r.base_quality === cat.value
                : r.step === "modifier" && r.modifier === cat.value,
            );
            return (
              <>
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">
                  {rows.length} swatches for{" "}
                  <span className="capitalize">{cat.value}</span>
                </p>
                <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                  {rows.map((r) => {
                    const hsb: HSB = { h: r.h, s: r.s, b: r.b };
                    const d = deltas(r);
                    return (
                      <div
                        key={r.id}
                        className="rounded-lg overflow-hidden border border-[color:var(--color-muted)]/30"
                        title={`${r.participant_id.slice(0, 8)} · H${r.h} S${r.s} B${r.b}`}
                      >
                        <div
                          className="aspect-square w-full"
                          style={{ background: hsbToCss(hsb) }}
                        />
                        <div className="px-1.5 py-1 text-[10px] font-mono leading-tight bg-[color:var(--color-card)]">
                          <div>
                            {r.h}/{r.s}/{r.b}
                          </div>
                          {d && (
                            <div className="text-[color:var(--color-muted)]">
                              Δ{d.dh > 0 ? "+" : ""}
                              {d.dh}/{d.ds > 0 ? "+" : ""}
                              {d.ds}/{d.db > 0 ? "+" : ""}
                              {d.db}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}

          <h2 className="mt-8 font-brand text-xl">Participants</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-[color:var(--color-card)]">
                  <th className="p-2">id</th>
                  <th className="p-2">18+</th>
                  <th className="p-2">chosen_base</th>
                  <th className="p-2">created_at</th>
                  <th className="p-2">completed_at</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-b border-[color:var(--color-muted)]/20">
                    <td className="p-2 font-mono text-xs">{p.id.slice(0, 8)}…</td>
                    <td className="p-2">{p.over_18 ? "yes" : "no"}</td>
                    <td className="p-2">{p.chosen_base ?? "—"}</td>
                    <td className="p-2">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      {p.completed_at ? new Date(p.completed_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-8 font-brand text-xl">Responses</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-[color:var(--color-card)]">
                  <th className="p-2">participant</th>
                  <th className="p-2">step</th>
                  <th className="p-2">base_quality</th>
                  <th className="p-2">modifier</th>
                  <th className="p-2">round</th>
                  <th className="p-2">HSB</th>
                  <th className="p-2">ΔH/ΔS/ΔB</th>
                  <th className="p-2">swatch</th>
                  <th className="p-2">created_at</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => {
                  const hsb: HSB = { h: r.h, s: r.s, b: r.b };
                  const d = deltas(r);
                  const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
                  return (
                    <tr key={r.id} className="border-b border-[color:var(--color-muted)]/20">
                      <td className="p-2 font-mono text-xs">
                        {r.participant_id.slice(0, 8)}…
                      </td>
                      <td className="p-2">{r.step}</td>
                      <td className="p-2">{r.base_quality ?? "—"}</td>
                      <td className="p-2">{r.modifier ?? "—"}</td>
                      <td className="p-2">{r.round}</td>
                      <td className="p-2 font-mono text-xs">
                        {r.h}/{r.s}/{r.b}
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {d ? `${fmt(d.dh)}/${fmt(d.ds)}/${fmt(d.db)}` : "—"}
                      </td>
                      <td className="p-2">
                        <span
                          className="inline-block w-6 h-6 rounded border border-[color:var(--color-muted)]/40 align-middle"
                          style={{ background: hsbToCss(hsb) }}
                        />
                      </td>
                      <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
