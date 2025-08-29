"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Api, SuggestItem } from "@/components/ApiBridge";

/** ---- Μικρο-τύποι για Plotly (χωρίς any) ---- */
type Trace = {
  x: number[];
  y: number[];
  mode?: string;
  name?: string;
  marker?: { size?: number };
};
type Layout = {
  margin?: { t?: number };
  xaxis?: { title?: string };
  yaxis?: { title?: string };
};
type Config = { displayModeBar?: boolean; responsive?: boolean };

declare global {
  interface Window {
    Plotly?: {
      newPlot: (
        el: HTMLElement,
        data: unknown,
        layout?: unknown,
        config?: unknown
      ) => unknown;
    };
  }
}

/** ---- Βοηθητικά ---- */
const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isNumArray = (a: unknown): a is number[] =>
  Array.isArray(a) && a.every(isNum);

/** Ασφαλές unwrapping από διάφορες πιθανές μορφές API απάντησης */
function unwrapItems(resp: unknown): SuggestItem[] {
  if (!resp || typeof resp !== "object") return [];
  const r = resp as Record<string, unknown>;
  if (Array.isArray(r.items)) return r.items as SuggestItem[];
  const data = r.data;
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    // TS note: το (data as any) χρησιμοποιείται μόνο για το in-operator check,
    // δεν διαρρέει στο υπόλοιπο API.
    return (data as { items: SuggestItem[] }).items;
  }
  return [];
}

type LightCurveArrays = { t: number[]; f: number[] };
type LightCurvePoints = { points: { t: number; f: number }[] };
type NeighPoints = { points: { sep: number; gmag: number }[] };
type Candidate = {
  period?: number; P?: number;
  duration?: number; D?: number;
  depth?: number; depth_ppm?: number; depth_frac?: number;
  power?: number; SDE?: number;
  vetted?: boolean;
};
type DetectResult = {
  lc?: LightCurveArrays | LightCurvePoints;
  neighbors?: NeighPoints;
  candidates?: Candidate[];
};

function unwrapDetect(resp: unknown): DetectResult {
  if (!resp || typeof resp !== "object") return {};
  const r = resp as Record<string, unknown>;

  // Μορφή { ok: true, data: {...} }
  if (r.ok === true && r.data && typeof r.data === "object") {
    const d = r.data as Record<string, unknown>;
    return {
      lc: (d.lc as DetectResult["lc"]) ?? undefined,
      neighbors: (d.neighbors as NeighPoints) ?? undefined,
      candidates: Array.isArray(d.candidates) ? (d.candidates as Candidate[]) : undefined,
    };
  }

  // Απευθείας { lc, neighbors, candidates }
  return {
    lc: (r.lc as DetectResult["lc"]) ?? undefined,
    neighbors: (r.neighbors as NeighPoints) ?? undefined,
    candidates: Array.isArray(r.candidates) ? (r.candidates as Candidate[]) : undefined,
  };
}

/** ---- Κύρια σελίδα ---- */
export default function DetectorPage() {
  const [q, setQ] = useState<string>("");
  const [suggest, setSuggest] = useState<SuggestItem[]>([]);
  const [suggestOpen, setSuggestOpen] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const lcRef = useRef<HTMLDivElement>(null);
  const neiRef = useRef<HTMLDivElement>(null);

  /** Debounced autocomplete */
  useEffect(() => {
    let cancelled = false;
    if (!q || q.trim().length < 2) {
      setSuggest([]);
      setSuggestOpen(false);
      return;
    }
    const h = setTimeout(async () => {
      try {
        const raw = await Api.suggest(q.trim());
        if (cancelled) return;
        const items = unwrapItems(raw);
        setSuggest(items);
        setSuggestOpen(items.length > 0);
      } catch {
        setSuggest([]);
        setSuggestOpen(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [q]);

  const onPickSuggest = useCallback((s: SuggestItem) => {
    setQ(s.label ?? s.id ?? "");
    setSuggest([]);
    setSuggestOpen(false);
  }, []);

  /** Plot helpers */
  const plotLc = useCallback((r: DetectResult) => {
    const el = lcRef.current;
    if (!el || !window.Plotly) return;

    let t: number[] = [];
    let f: number[] = [];
    const lc = r.lc;
    if (lc && "t" in lc && "f" in lc) {
      const cand = lc as LightCurveArrays;
      if (isNumArray(cand.t) && isNumArray(cand.f)) {
        t = cand.t; f = cand.f;
      }
    } else if (lc && "points" in lc) {
      const cand = lc as LightCurvePoints;
      if (Array.isArray(cand.points)) {
        t = cand.points.map((p) => p.t).filter(isNum);
        f = cand.points.map((p) => p.f).filter(isNum);
      }
    }

    const data: Trace[] = [{ x: t, y: f, mode: "lines", name: "Flux" }];
    const layout: Layout = { margin: { t: 10 }, xaxis: { title: "Time" }, yaxis: { title: "Flux" } };
    const cfg: Config = { displayModeBar: false, responsive: true };
    window.Plotly.newPlot(el, data, layout, cfg);
  }, []);

  const plotNeigh = useCallback((r: DetectResult) => {
    const el = neiRef.current;
    if (!el || !window.Plotly) return;

    const n = r.neighbors;
    const pts = n && Array.isArray(n.points) ? n.points : [];
    const x = pts.map((p) => p.sep).filter(isNum);
    const y = pts.map((p) => p.gmag).filter(isNum);

    const data: Trace[] = [{ x, y, mode: "markers", marker: { size: 6 }, name: "Gaia" }];
    const layout: Layout = { margin: { t: 10 }, xaxis: { title: 'sep [""]' }, yaxis: { title: "Gmag" } };
    const cfg: Config = { displayModeBar: false, responsive: true };
    window.Plotly.newPlot(el, data, layout, cfg);
  }, []);

  /** Fetch & Detect */
  const [cands, setCands] = useState<Candidate[]>([]);

  const onFetchDetect = useCallback(async () => {
    const target = q.trim();
    if (!target) return;

    setBusy(true);
    setErrorMsg("");
    try {
      // Χρησιμοποιούμε το υπαρκτό Api.detect(...) αντί για fetchDetect
      const raw = await Api.detect({ target }); // στέλνουμε μόνο target, τα υπόλοιπα defaults από backend
      const r = unwrapDetect(raw);

      plotLc(r);
      plotNeigh(r);

      setCands(Array.isArray(r.candidates) ? r.candidates : []);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unexpected error during detect.");
      setCands([]);
    } finally {
      setBusy(false);
    }
  }, [q, plotLc, plotNeigh]);

  const pd = (x: unknown, d = 6): string => (isNum(x) ? x.toFixed(d) : x === 0 ? "0" : "");

  return (
    <>
      {/* Plotly */}
      <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="afterInteractive" />

      <div className="mx-auto max-w-6xl px-4 py-6 text-slate-100">
        <h1 className="mb-4 text-3xl font-extrabold">Exoplanet Detector (17B)</h1>

        {/* Search row */}
        <div className="relative mb-6">
          <div className="flex gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="TIC id ή λέξεις-κλειδιά…"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              onClick={onFetchDetect}
              disabled={busy}
              className="rounded-lg bg-teal-500 px-4 py-2 font-semibold text-black hover:bg-teal-400 disabled:opacity-60"
            >
              {busy ? "Working…" : "Fetch & Detect"}
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {suggestOpen && suggest.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-700 bg-slate-900 shadow-lg">
              {suggest.map((s, i) => (
                <li
                  key={`${s.id ?? s.label ?? i}`}
                  className="cursor-pointer px-3 py-2 hover:bg-slate-800"
                  onClick={() => onPickSuggest(s)}
                >
                  {s.label ?? s.id}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 rounded-md border border-red-600 bg-red-900/30 px-3 py-2 text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Plots */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xl font-bold">Light Curve</h2>
            <div ref={lcRef} className="h-[420px] rounded-md border border-slate-700" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold">Neighbors (Gaia DR3)</h2>
            <div ref={neiRef} className="h-[420px] rounded-md border border-slate-700" />
          </div>
        </div>

        {/* Candidates */}
        <div className="mt-8">
          <h2 className="mb-2 text-xl font-bold">Candidates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-slate-200">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Period</th>
                  <th className="py-2 pr-4">Duration</th>
                  <th className="py-2 pr-4">Depth</th>
                  <th className="py-2 pr-4">Power</th>
                </tr>
              </thead>
              <tbody>
                {cands.length === 0 && (
                  <tr>
                    <td className="py-3 text-slate-400" colSpan={5}>
                      No candidates yet. Try Fetch &amp; Detect.
                    </td>
                  </tr>
                )}
                {cands.map((c, i) => {
                  const period = c.period ?? c.P;
                  const duration = c.duration ?? c.D;
                  const depth = c.depth ?? c.depth_ppm ?? c.depth_frac ?? undefined;
                  const power = c.power ?? c.SDE ?? undefined;
                  const vetted = c.vetted === true;
                  return (
                    <tr
                      key={i}
                      className="border-b border-slate-800"
                      style={{ cursor: "pointer", background: vetted ? "#eaffea" : undefined }}
                    >
                      <td className="py-2 pr-4">{i + 1}</td>
                      <td className="py-2 pr-4">{pd(period, 6)}</td>
                      <td className="py-2 pr-4">{pd(duration, 5)}</td>
                      <td className="py-2 pr-4">{depth ?? ""}</td>
                      <td className="py-2 pr-4">{power ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
