// src/app/detector/page.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Api } from "@/components/ApiBridge";

/** ----- Types (χωρίς any) ----- */
type SuggestItem = { id: string; label: string };
type SuggestResp = SuggestItem[] | { items: SuggestItem[] };

type LcXY = { x: number[]; y: number[] };
type LcArray = { time: number[]; flux: number[] };

type LcShape =
  | LcXY
  | LcArray
  | { t: number[]; f: number[] }
  | { lc: LcXY | LcArray | { t: number[]; f: number[] } };

type Candidate = {
  P?: number;
  period?: number;
  D?: number;
  duration?: number;
  depth?: number | string;
  depth_ppm?: number | string;
  depth_frac?: number | string;
  power?: number | string;
  SDE?: number | string;
  vetted?: boolean;
};

type NeighborPoint = { sep: number; gmag: number };
type NeighResp =
  | { points: NeighborPoint[] }
  | { sep: number[]; gmag: number[] }
  | undefined;

type DetectResp = {
  lc?: LcShape;
  candidates?: Candidate[];
  neighbors?: NeighResp;
};

/** ----- Μικρά helpers ----- */
const unwrapSuggest = (r: SuggestResp): SuggestItem[] =>
  Array.isArray(r) ? r : r?.items ?? [];

const fmt = (v: number | string | undefined, d = 6): string => {
  if (v === undefined || v === "") return "";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(d);
};

const lcToXY = (lc: LcShape | undefined): LcXY | null => {
  if (!lc) return null;
  const val = ((): LcXY | null => {
    if ("lc" in lc) return lcToXY(lc.lc as LcShape);
    if ("x" in lc && "y" in lc) return { x: lc.x, y: lc.y };
    if ("time" in lc && "flux" in lc) return { x: lc.time, y: lc.flux };
    if ("t" in lc && "f" in lc) return { x: lc.t, y: lc.f };
    return null;
  })();
  if (!val) return null;
  if (!Array.isArray(val.x) || !Array.isArray(val.y)) return null;
  return val;
};

const neighToArray = (n: NeighResp): NeighborPoint[] => {
  if (!n) return [];
  if ("points" in n && Array.isArray(n.points)) return n.points;
  if ("sep" in n && "gmag" in n && Array.isArray(n.sep) && Array.isArray(n.gmag)) {
    return n.sep.map((s, i) => ({ sep: s, gmag: n.gmag[i] }));
  }
  return [];
};

/** ----- Plotly types (τοπικά, ώστε να μην βάλουμε any) ----- */
type PlotlyConfig = { displayModeBar?: boolean; responsive?: boolean };
type PlotlyLayout = {
  title?: string;
  margin?: { t?: number; r?: number; b?: number; l?: number };
  xaxis?: { title?: string };
  yaxis?: { title?: string };
};
type PlotlyData = {
  x: number[] | string[];
  y: number[] | string[];
  mode?: "lines" | "markers" | "lines+markers";
  type?: "scatter";
  marker?: { size?: number };
  name?: string;
};

/** ----- Κυρίως Component ----- */
export default function DetectorPage() {
  // --- State ---
  const [q, setQ] = useState<string>("");
  const [suggest, setSuggest] = useState<SuggestItem[]>([]);
  const [suggestOpen, setSuggestOpen] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  // 17B controls
  const [source, setSource] = useState<"spt-pdcsap" | "mast-pdcsap">("spt-pdcsap");
  const [mission, setMission] = useState<"auto" | "tess" | "kepler" | "k2">("auto");
  const [kpeaks, setKpeaks] = useState<number>(3);

  const [applyFlatten, setApplyFlatten] = useState<boolean>(true);
  const [applyQualMask, setApplyQualMask] = useState<boolean>(true);
  const [applyOutliers, setApplyOutliers] = useState<boolean>(true);
  const [sigma, setSigma] = useState<number>(5);

  const [doCentroid, setDoCentroid] = useState<boolean>(true);
  const [doGaia, setDoGaia] = useState<boolean>(true);

  const [pthr, setPthr] = useState<number>(0.8);
  const [sigmaThr, setSigmaThr] = useState<number>(3.0);
  const [rhoThr, setRhoThr] = useState<number>(0.15);
  const [gaiaRad, setGaiaRad] = useState<number>(60); // arcsec

  // Results
  const [cands, setCands] = useState<Candidate[]>([]);
  const lcRef = useRef<HTMLDivElement | null>(null);
  const ngRef = useRef<HTMLDivElement | null>(null);

  /** ---- Autocomplete (debounced) ---- */
  useEffect(() => {
    const id = setTimeout(async () => {
      const s = q.trim();
      if (s.length < 2) {
        setSuggest([]);
        setSuggestOpen(false);
        return;
      }
      try {
        const r = (await Api.suggest(s)) as SuggestResp;
        const items = unwrapSuggest(r);
        setSuggest(items);
        setSuggestOpen(items.length > 0);
      } catch (e) {
        setSuggest([]);
        setSuggestOpen(false);
        console.warn("suggest error", e);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const selectSuggest = (it: SuggestItem) => {
    setQ(it.label);
    setSuggestOpen(false);
  };

  /** ---- Fetch & Detect ---- */
  const onFetchDetect = useCallback(async () => {
    const target = q.trim();
    if (!target) return;
    setBusy(true);
    setCands([]);

    // options payload (17B-style)
    const payload = {
      target,
      options: {
        source,
        mission,
        kpeaks,
        detrend: {
          flatten: applyFlatten,
          qualityMask: applyQualMask,
          removeOutliers: applyOutliers,
          sigma,
        },
        centroid: doCentroid,
        gaiaNeighbors: doGaia,
        thresholds: {
          p: pthr,
          sigma: sigmaThr,
          rho: rhoThr,
          gaia_radius_arcsec: gaiaRad,
        },
      },
    };

    try {
      const r = (await Api.fetchDetect(payload)) as DetectResp;
      // Light curve
      const xy = lcToXY(r?.lc);
      if (xy && lcRef.current && (window as unknown as Record<string, any>).Plotly) {
        const Plotly = (window as unknown as { Plotly: any }).Plotly;
        const data: PlotlyData[] = [{ x: xy.x, y: xy.y, type: "scatter", mode: "lines", name: "PDCSAP" }];
        const layout: PlotlyLayout = { margin: { t: 10 }, xaxis: { title: "Time" }, yaxis: { title: "Flux" } };
        const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
        Plotly.newPlot(lcRef.current, data, layout, cfg);
      }
      // Neighbors
      const neigh = neighToArray(r?.neighbors);
      if (ngRef.current && (window as unknown as Record<string, any>).Plotly) {
        const Plotly = (window as unknown as { Plotly: any }).Plotly;
        const data: PlotlyData[] = [
          { x: neigh.map((p) => p.sep), y: neigh.map((p) => p.gmag), mode: "markers", type: "scatter", marker: { size: 6 }, name: "Gaia" },
        ];
        const layout: PlotlyLayout = {
          margin: { t: 10 },
          xaxis: { title: 'sep [&quot;]' },
          yaxis: { title: "Gmag" },
        };
        const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
        Plotly.newPlot(ngRef.current, data, layout, cfg);
      }
      // Candidates
      setCands(r?.candidates ?? []);
    } catch (e) {
      console.error("fetchDetect error", e);
      alert("Detect failed. Check logs / API.");
    } finally {
      setBusy(false);
    }
  }, [
    q,
    source,
    mission,
    kpeaks,
    applyFlatten,
    applyQualMask,
    applyOutliers,
    sigma,
    doCentroid,
    doGaia,
    pthr,
    sigmaThr,
    rhoThr,
    gaiaRad,
  ]);

  /** ---- UI ---- */
  return (
    <>
      <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="afterInteractive" />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-extrabold mb-4">Exoplanet Detector (17B)</h1>

        {/* Row: search + button */}
        <div className="flex gap-3 items-start relative">
          <div className="flex-1 relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSuggestOpen(suggest.length > 0)}
              placeholder="Enter TIC / name (e.g. 268042363)"
              className="w-full rounded-md border px-3 py-2 text-black"
            />
            {/* Autocomplete dropdown */}
            {suggestOpen && suggest.length > 0 && (
              <div
                className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-white shadow"
                onMouseLeave={() => setSuggestOpen(false)}
              >
                {suggest.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => selectSuggest(it)}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-100"
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onFetchDetect}
            disabled={busy || !q.trim()}
            className="rounded-md bg-teal-400 px-4 py-2 font-semibold text-black disabled:opacity-50"
          >
            {busy ? "Working..." : "Fetch & Detect"}
          </button>
        </div>

        {/* Controls grid (17B-style) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Source / Mission */}
          <div className="rounded-lg border p-3">
            <div className="font-semibold mb-2">Source</div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="src"
                  checked={source === "spt-pdcsap"}
                  onChange={() => setSource("spt-pdcsap")}
                />
                <span>MAST SPOC (PDCSAP)</span>
              </label>
              <label className="flex items-center gap-2 opacity-60">
                <input type="radio" name="src" disabled />
                <span>Other</span>
              </label>
            </div>
            <div className="font-semibold mt-3 mb-1">Mission</div>
            <select
              value={mission}
              onChange={(e) => setMission(e.target.value as typeof mission)}
              className="rounded-md border px-2 py-1 text-black"
            >
              <option value="auto">auto</option>
              <option value="tess">TESS</option>
              <option value="kepler">Kepler</option>
              <option value="k2">K2</option>
            </select>

            <div className="mt-3">
              <label className="font-semibold mr-2">k-peaks</label>
              <input
                type="number"
                value={kpeaks}
                min={1}
                max={10}
                onChange={(e) => setKpeaks(Number(e.target.value))}
                className="w-20 rounded-md border px-2 py-1 text-black"
              />
            </div>
          </div>

          {/* Detrend */}
          <div className="rounded-lg border p-3">
            <div className="font-semibold mb-2">Detrend</div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={applyFlatten} onChange={(e) => setApplyFlatten(e.target.checked)} />
              <span>flatten</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={applyQualMask} onChange={(e) => setApplyQualMask(e.target.checked)} />
              <span>quality mask</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={applyOutliers} onChange={(e) => setApplyOutliers(e.target.checked)} />
              <span>remove outliers</span>
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span>σ</span>
              <input
                type="number"
                value={sigma}
                min={1}
                max={10}
                step={0.5}
                onChange={(e) => setSigma(Number(e.target.value))}
                className="w-24 rounded-md border px-2 py-1 text-black"
              />
            </div>
          </div>

          {/* Vetting / thresholds */}
          <div className="rounded-lg border p-3">
            <div className="font-semibold mb-2">Centroid vetting (TESSCut) &amp; Gaia neighbors</div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={doCentroid} onChange={(e) => setDoCentroid(e.target.checked)} />
              <span>Centroid vetting</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={doGaia} onChange={(e) => setDoGaia(e.target.checked)} />
              <span>Gaia neighbors</span>
            </label>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-40">Planet threshold p</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={pthr}
                  onChange={(e) => setPthr(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{fmt(pthr, 2)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-40">Centroid σ-thr</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={sigmaThr}
                  onChange={(e) => setSigmaThr(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{fmt(sigmaThr, 2)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-40">ρ-thr</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={rhoThr}
                  onChange={(e) => setRhoThr(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{fmt(rhoThr, 2)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-40">Gaia radius [&quot;]</span>
                <input
                  type="number"
                  min={5}
                  max={300}
                  step={5}
                  value={gaiaRad}
                  onChange={(e) => setGaiaRad(Number(e.target.value))}
                  className="w-24 rounded-md border px-2 py-1 text-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plots */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold mb-2">Light Curve</div>
            <div ref={lcRef} className="h-[420px] rounded-lg border" />
          </div>
          <div>
            <div className="font-semibold mb-2">Neighbors (Gaia DR3)</div>
            <div ref={ngRef} className="h-[420px] rounded-lg border" />
          </div>
        </div>

        {/* Candidates table */}
        <div className="mt-6">
          <div className="font-semibold text-lg mb-2">Candidates</div>
          <div className="overflow-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Period</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                  <th className="px-3 py-2 text-left">Depth</th>
                  <th className="px-3 py-2 text-left">Power</th>
                </tr>
              </thead>
              <tbody>
                {cands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-slate-400">
                      No candidates yet. Try Fetch &amp; Detect.
                    </td>
                  </tr>
                ) : (
                  cands.map((c, i) => {
                    const vetted = Boolean(c.vetted) || (typeof c.power === "number" && c.power >= pthr);
                    return (
                      <tr key={i} style={{ cursor: "pointer", background: vetted ? "#eaffea" : undefined }}>
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">{fmt(c.period ?? c.P, 6)}</td>
                        <td className="px-3 py-2">{fmt(c.duration ?? c.D, 5)}</td>
                        <td className="px-3 py-2">{c.depth ?? c.depth_ppm ?? c.depth_frac ?? ""}</td>
                        <td className="px-3 py-2">{c.power ?? c.SDE ?? ""}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom actions (προαιρετικά disabled μέχρι να συνδεθούν endpoints) */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button disabled className="rounded-md border px-4 py-2 opacity-50">Export CSV</button>
          <button disabled className="rounded-md border px-4 py-2 opacity-50">Export Vetted CSV &amp; Fit transit</button>
          <button disabled className="rounded-md border px-4 py-2 opacity-50">Download PDF report</button>
        </div>
      </div>
    </>
  );
}
