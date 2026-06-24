"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
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

  async function deleteItem(target: "participant" | "response" | "all", id?: string | number) {
    const label =
      target === "all"
        ? "ALL participants and responses"
        : target === "participant"
          ? "this participant (and their responses)"
          : "this response";
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "x-admin-password": password, "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", target, id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }

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

  function buildRow(r: ResponseRow, byPid: Map<string, Participant>) {
    const p = byPid.get(r.participant_id);
    const d = deltas(r);
    return {
      participant_id: r.participant_id,
      over_18: p?.over_18 ?? "",
      chosen_base: p?.chosen_base ?? "",
      participant_created_at: p?.created_at ?? "",
      completed_at: p?.completed_at ?? "",
      step: r.step,
      base_quality: r.base_quality ?? "",
      modifier: r.modifier ?? "",
      round: r.round,
      h: r.h,
      s: r.s,
      b: r.b,
      h_delta: d?.dh ?? "",
      s_delta: d?.ds ?? "",
      b_delta: d?.db ?? "",
      response_created_at: r.created_at,
    };
  }

  function downloadXlsx() {
    if (!participants || !responses) return;
    const byPid = new Map<string, Participant>();
    for (const p of participants) byPid.set(p.id, p);

    const wb = XLSX.utils.book_new();

    const allRows = responses.map((r) => buildRow(r, byPid));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(allRows),
      "All",
    );

    for (const c of CATEGORIES) {
      const filtered = responses.filter((r) =>
        c.kind === "base"
          ? r.step === "base" && r.base_quality === c.value
          : r.step === "modifier" && r.modifier === c.value,
      );
      if (filtered.length === 0) continue;
      const sheetRows = filtered.map((r) => buildRow(r, byPid));
      const rawName = `${c.kind === "base" ? "base_" : "mod_"}${c.value}`;
      const safeName = rawName.replace(/[\\/?*[\]:]/g, "_").slice(0, 31);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(sheetRows),
        safeName,
      );
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    XLSX.writeFile(wb, `palettory-export-${stamp}.xlsx`);
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
              onClick={downloadXlsx}
              className="text-sm border border-[color:var(--color-ink)] px-3 py-1 rounded-full"
            >
              Download XLSX
            </button>
            <button
              type="button"
              onClick={load}
              className="text-sm border border-[color:var(--color-ink)] px-3 py-1 rounded-full"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => deleteItem("all")}
              className="text-sm border border-red-600 text-red-600 px-3 py-1 rounded-full"
            >
              Delete all
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
                  <th className="p-2"></th>
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
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => deleteItem("participant", p.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        delete
                      </button>
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
                  <th className="p-2"></th>
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
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => deleteItem("response", r.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          delete
                        </button>
                      </td>
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
