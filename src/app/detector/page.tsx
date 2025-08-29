"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import Script from "next/script";
import { Api, SuggestItem } from "@/components/ApiBridge";

// ---- Plotly typings (lightweight) ----
type PlotlyPoint = {
  x?: number[];
  y?: number[];
  mode?: "markers" | "lines" | "lines+markers";
  name?: string;
  marker?: { size?: number };
};
type PlotlyLayout = {
  margin?: { t?: number; r?: number; b?: number; l?: number };
  xaxis?: { title?: string };
  yaxis?: { title?: string };
};
type PlotlyConfig = { displayModeBar?: boolean; responsive?: boolean };
type PlotlyModule = {
  newPlot: (el: HTMLElement, data: PlotlyPoint[], layout?: PlotlyLayout, config?: PlotlyConfig) => Promise<void>;
};

// ---- API types ----
export interface Candidate {
  period?: number; P?: number;
  duration?: number; D?: number;
  depth?: number; depth_ppm?: number; depth_frac?: number;
  power?: number; SDE?: number;
}
export interface Lightcurve { t: number[]; f: number[]; }
export interface Neighbors { points: Array<{ sep: number; gmag: number }>; }
export interface PredictResponse {
  ok?: boolean;
  message?: string;
  lightcurve?: Lightcurve;
  candidates?: Candidate[];
  neighbors?: Neighbors;
  image_base64?: string;
}

// Μικρός type-guard για να δεχτούμε και { items: T[] } και T[]
function hasItemsArray<T>(v: unknown): v is { items: T[] } {
  return typeof v === "object" && v !== null && Array.isArray((v as { items?: unknown }).items);
}

// Formatter που ΕΠΙΣΤΡΕΦΕΙ ΠΑΝΤΑ string (ασφαλές για JSX)
function pd(n: number | undefined, digits = 3): string {
  if (n === undefined || n === null || !Number.isFinite(n)) return "";
  try { return Number(n).toFixed(digits); } catch { return ""; }
}

export default function DetectorPage(): ReactElement {
  const [target, setTarget] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");
  const [lc, setLc] = useState<Lightcurve | null>(null);
  const [cands, setCands] = useState<Candidate[]>([]);
  const [neigh, setNeigh] = useState<Neighbors | null>(null);

  const lcRef = useRef<HTMLDivElement>(null);
  const neighRef = useRef<HTMLDivElement>(null);

  const plotly = useMemo<PlotlyModule | null>(() => {
    const p = (globalThis as unknown as { Plotly?: PlotlyModule }).Plotly;
    return p ?? null;
  }, []);

  // Autocomplete
  const onSuggest = useCallback(async (q: string) => {
    setTarget(q);
    if (!q || q.length < 2) { setSuggestions([]); return; }
    try {
      const res = (await Api.suggest(q)) as unknown;
      const arr = hasItemsArray<SuggestItem>(res) ? res.items : (res as SuggestItem[]);
      setSuggestions(arr);
    } catch (e) {
      console.warn("suggest error", e);
    }
  }, []);

  const pickSuggestion = useCallback((s: SuggestItem) => {
    setTarget(s.label ?? s.id ?? "");
    setSuggestions([]);
  }, []);

  // Γενικό POST JSON με typed απάντηση
  async function postJson<T>(path: string, payload: unknown): Promise<T> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText} — ${text}`);
    }
    return (await res.json()) as T;
  }

  const fetchAndDetect = useCallback(async () => {
    if (!target.trim()) { setMsg("Please provide a target (e.g., TIC 268042363)"); return; }
    setBusy(true); setMsg("Fetching…");
    try {
      // 1) Τοπικό proxy
      let data = await postJson<PredictResponse>("/api/predict", { target });

      // 2) Εναλλακτικές
      if (!data?.lightcurve && !data?.candidates) {
        try { data = await postJson<PredictResponse>("/api/detect", { target }); } catch {}
      }
      if (!data?.lightcurve && !data?.candidates) {
        try { data = await postJson<PredictResponse>("/api/exoplanet/predict", { target }); } catch {}
      }
      if (!data?.lightcurve && !data?.candidates) {
        data = await postJson<PredictResponse>("https://api.oramax.space/exoplanet/predict", { target });
      }

      setLc(data.lightcurve ?? null);
      setCands(Array.isArray(data.candidates) ? data.candidates : []);
      setNeigh(data.neighbors ?? null);
      setMsg(data.message ?? "Done.");
    } catch (err) {
      setMsg(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [target]);

  // Plots
  const plotLc = useCallback(() => {
    if (!plotly || !lc || !lcRef.current) return;
    const el = lcRef.current;
    const trace: PlotlyPoint = { x: lc.t, y: lc.f, mode: "markers", name: "Flux", marker: { size: 3 } };
    const layout: PlotlyLayout = { margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: "Time" }, yaxis: { title: "Flux" } };
    const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
    plotly.newPlot(el, [trace], layout, cfg).catch(() => {});
  }, [plotly, lc]);

  const plotNeigh = useCallback(() => {
    if (!plotly || !neigh || !neighRef.current) return;
    const el = neighRef.current;
    const d = neigh.points ?? [];
    const trace: PlotlyPoint = { x: d.map(p => p.sep), y: d.map(p => p.gmag), mode: "markers", name: "Gaia", marker: { size: 6 } };
    const layout: PlotlyLayout = { margin: { t: 10, r: 10, b: 40, l: 50 }, xaxis: { title: 'sep [""]' }, yaxis: { title: "Gmag" } };
    const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
    plotly.newPlot(el, [trace], layout, cfg).catch(() => {});
  }, [plotly, neigh]);

  useEffect(() => { plotLc(); }, [plotLc]);
  useEffect(() => { plotNeigh(); }, [plotNeigh]);

  // --- Render ---
  return (
    <>
      <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="afterInteractive" />
      <div className="container" style={{ padding: "16px 0", maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 8 }}>Exoplanet Detector (17B)</h1>

        {/* Search row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              value={target}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSuggest(e.target.value)}
              placeholder="TIC 268042363 or Kepler/K2 name…"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }}
            />
            {!!suggestions.length && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #eee", borderTop: "none", zIndex: 5, borderRadius: "0 0 8px 8px" }}>
                {suggestions.map(s => (
                  <div key={s.id} onClick={() => pickSuggestion(s)} style={{ padding: "8px 12px", cursor: "pointer" }}>
                    {s.label ?? s.id}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            disabled={busy}
            onClick={fetchAndDetect}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--brand, #4e7)", background: "var(--brand, #4e7)", color: "#fff" }}
          >
            {busy ? "Working…" : "Fetch & Detect"}
          </button>
        </div>

        {/* Status */}
        <p style={{ minHeight: 24, color: msg.startsWith("Error") ? "#b00" : "#333" }}>{msg}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <h3 style={{ margin: "8px 0" }}>Light Curve</h3>
            <div ref={lcRef} style={{ height: 360, border: "1px solid #eee", borderRadius: 8 }} />
          </div>
          <div>
            <h3 style={{ margin: "8px 0" }}>Neighbors (Gaia DR3)</h3>
            <div ref={neighRef} style={{ height: 360, border: "1px solid #eee", borderRadius: 8 }} />
          </div>
        </div>

        {/* Candidates table */}
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: "8px 0" }}>Candidates</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ borderBottom: "1px solid #eee", padding: "6px 4px" }}>#</th>
                  <th style={{ borderBottom: "1px solid #eee", padding: "6px 4px" }}>Period</th>
                  <th style={{ borderBottom: "1px solid #eee", padding: "6px 4px" }}>Duration</th>
                  <th style={{ borderBottom: "1px solid #eee", padding: "6px 4px" }}>Depth</th>
                  <th style={{ borderBottom: "1px solid #eee", padding: "6px 4px" }}>Power</th>
                </tr>
              </thead>
              <tbody>
                {cands.map((c, i) => (
                  <tr key={i}>
                    <td style={{ borderBottom: "1px solid #f4f4f4", padding: "6px 4px" }}>{i + 1}</td>
                    <td style={{ borderBottom: "1px solid #f4f4f4", padding: "6px 4px" }}>{pd(c.period ?? c.P, 6)}</td>
                    <td style={{ borderBottom: "1px solid #f4f4f4", padding: "6px 4px" }}>{pd(c.duration ?? c.D, 5)}</td>
                    <td style={{ borderBottom: "1px solid #f4f4f4", padding: "6px 4px" }}>{c.depth ?? c.depth_ppm ?? c.depth_frac ?? ""}</td>
                    <td style={{ borderBottom: "1px solid #f4f4f4", padding: "6px 4px" }}>{c.power ?? c.SDE ?? ""}</td>
                  </tr>
                ))}
                {!cands.length && (
                  <tr><td colSpan={5} style={{ padding: 8, color: "#777" }}>No candidates yet. Try Fetch & Detect.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
