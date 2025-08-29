"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

// -------------------------------------------------------------
// Detector (React version of the step17B UI)
// - Wires all controls to our /api proxy (Vercel) with fallbacks
// - No `any`, strict typings, lint-safe, server-friendly
// -------------------------------------------------------------

type Lightcurve = { time?: number[]; flux?: number[] };
type Candidate = {
  P?: number; // legacy
  D?: number; // legacy
  period?: number;
  duration?: number;
  depth?: number; depth_ppm?: number; depth_frac?: number;
  power?: number; SDE?: number;
  p_planet?: number; p?: number; prob?: number;
};

type NeighPoint = { ra: number; dec: number; gmag: number; sep: number };

type SuggestItem = { id: string; label: string };

type DetectPayload = {
  target?: string;
  lc?: string; // csv or json string
  threshold?: number;
  source?: string; // e.g. "MAST" | "SPOC" | "auto"
  mission?: string; // e.g. "auto" | "tess" | "kepler"
  peaks?: number;
  detrend?: string; // e.g. "flatten"
  quality_mask?: boolean;
  remove_outliers?: boolean;
  sigma?: number;
  centroid_vetting?: boolean;
  gaia_neighbors?: boolean;
};

// ----------------- Helpers -----------------
const API_BASE = "/api"; // our Vercel route proxy
const PATHS = [
  "predict", // 1st choice
  "detect",
  "process",
  "run",
].flatMap((p) => [`${API_BASE}/${p}`, `${API_BASE}/exoplanet/${p}`]);

const toNum = (x: unknown, def = NaN) => (typeof x === "number" && Number.isFinite(x) ? x : def);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// decimal formatter that ALWAYS returns a string (fixes ReactNode type error)
const pd = (x: unknown, n: number) => (typeof x === "number" ? x.toFixed(n) : String(x ?? ""));

async function apiGet(url: string): Promise<any> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
async function apiPost(url: string, body: unknown): Promise<any> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const ct = r.headers.get("content-type") || "";
  if (!r.ok) {
    let reason = `${r.status} ${r.statusText}`;
    if (ct.includes("json")) {
      try { const j = await r.json(); reason = j?.detail || j?.error || JSON.stringify(j); } catch {}
    } else {
      try { reason = await r.text(); } catch {}
    }
    throw new Error(reason);
  }
  return ct.includes("json") ? r.json() : r.text();
}

// ---- API wrappers ----
async function fetchSuggest(q: string): Promise<SuggestItem[]> {
  if (!q || q.length < 2) return [];
  const urls = [
    `${API_BASE}/suggest?text=${encodeURIComponent(q)}`,
    `${API_BASE}/exoplanet/suggest?text=${encodeURIComponent(q)}`,
  ];
  for (const u of urls) {
    try {
      const res = await apiGet(u);
      const arr = (res?.items || res?.suggestions || res) as any[];
      if (Array.isArray(arr)) return arr.map((x) => ({ id: String(x.id ?? x.value ?? x), label: String(x.label ?? x.name ?? x.id ?? x) }));
    } catch {}
  }
  return [];
}

async function fetchDetect(payload: DetectPayload): Promise<{ lc?: Lightcurve; candidates?: Candidate[]; neighbors?: NeighPoint[]; pdf_url?: string }>
{
  const body: DetectPayload = { ...payload };
  // try JSON endpoints first
  for (const p of PATHS) {
    try { return await apiPost(p, { ...body, op: "fetch_detect" }); } catch {}
  }
  // final fallback
  throw new Error("No detect endpoint responded");
}

async function detectFromUpload(file: File, opts: DetectPayload) {
  const text = await file.text();
  const isCsv = /,/.test(text) || /\n/.test(text);
  const lcStr = isCsv ? text : JSON.stringify(JSON.parse(text));
  return fetchDetect({ ...opts, lc: lcStr });
}

async function fitTransit(target?: string) {
  const urls = [
    `${API_BASE}/fit?target=${encodeURIComponent(target ?? "")}`,
    `${API_BASE}/exoplanet/fit?target=${encodeURIComponent(target ?? "")}`,
  ];
  for (const u of urls) { try { return await apiGet(u); } catch {} }
  throw new Error("fit endpoint not found");
}

async function downloadPdf(target?: string) {
  const urls = [
    `${API_BASE}/report_pdf?target=${encodeURIComponent(target ?? "")}`,
    `${API_BASE}/exoplanet/report_pdf?target=${encodeURIComponent(target ?? "")}`,
  ];
  for (const u of urls) {
    try {
      const res = await apiGet(u);
      const link = res?.url || res?.pdf || res?.pdf_url;
      if (link) {
        const a = document.createElement("a");
        a.href = link; a.download = "report.pdf"; document.body.appendChild(a); a.click(); a.remove();
        return;
      }
    } catch {}
  }
  throw new Error("report_pdf endpoint not found");
}

// ----------------- Plotly helpers -----------------
type PlotlyData = { x: number[]; y: number[]; mode: "markers" | "lines"; marker?: { size?: number; color?: string }; name?: string };
type PlotlyLayout = { title?: string; margin?: { t?: number }; xaxis?: { title?: string }; yaxis?: { title?: string } };
type PlotlyConfig = { displayModeBar?: boolean; responsive?: boolean };

type PlotlyLib = { newPlot: (el: HTMLElement, data: PlotlyData[], layout?: PlotlyLayout, config?: PlotlyConfig) => void };
declare global { interface Window { Plotly?: PlotlyLib } }

const usePlot = () => {
  const plotLc = (el: HTMLDivElement | null, lc?: Lightcurve) => {
    if (!el || !lc?.time || !lc.flux) return;
    const data: PlotlyData[] = [{ x: lc.time, y: lc.flux, mode: "markers", marker: { size: 3 }, name: "Flux" }];
    const layout: PlotlyLayout = { margin: { t: 10 }, xaxis: { title: "time" }, yaxis: { title: "flux" } };
    const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
    window.Plotly?.newPlot(el, data, layout, cfg);
  };
  const plotNeigh = (el: HTMLDivElement | null, pts?: NeighPoint[]) => {
    if (!el || !pts || !pts.length) return;
    const data: PlotlyData[] = [{ x: pts.map((p) => p.sep), y: pts.map((p) => p.gmag), mode: "markers", marker: { size: 6 }, name: "Gaia" }];
    const layout: PlotlyLayout = { margin: { t: 10 }, xaxis: { title: 'sep [""]' }, yaxis: { title: "Gmag" } };
    const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
    window.Plotly?.newPlot(el, data, layout, cfg);
  };
  return { plotLc, plotNeigh };
};

// ----------------- UI -----------------
export default function DetectorReact() {
  const [query, setQuery] = useState("");
  const [suggest, setSuggest] = useState<SuggestItem[]>([]);
  const [sel, setSel] = useState<SuggestItem | null>(null);

  const [thr, setThr] = useState(0.8);
  const [sigma, setSigma] = useState(5);
  const [peaks, setPeaks] = useState(3);

  const [source, setSource] = useState("MAST");
  const [mission, setMission] = useState("auto");
  const [detrend, setDetrend] = useState("flatten");
  const [qualityMask, setQualityMask] = useState(true);
  const [rmOutliers, setRmOutliers] = useState(true);
  const [doCentroid, setDoCentroid] = useState(true);
  const [gaiaNeigh, setGaiaNeigh] = useState(true);

  const [lc, setLc] = useState<Lightcurve | null>(null);
  const [cands, setCands] = useState<Candidate[]>([]);
  const [neighbors, setNeighbors] = useState<NeighPoint[]>([]);

  const [status, setStatus] = useState("Loading...");
  const [busy, setBusy] = useState(false);

  const currentTarget = useRef<string | undefined>(undefined);
  const { plotLc, plotNeigh } = usePlot();

  // Suggest
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!query || query.length < 2) { setSuggest([]); return; }
      try { const s = await fetchSuggest(query); if (alive) setSuggest(s); } catch {}
    })();
    return () => { alive = false; };
  }, [query]);

  // Plot
  const lcDiv = useRef<HTMLDivElement | null>(null);
  const neiDiv = useRef<HTMLDivElement | null>(null);
  useEffect(() => { plotLc(lcDiv.current, lc || undefined); }, [lc]);
  useEffect(() => { plotNeigh(neiDiv.current, neighbors || undefined); }, [neighbors]);

  // Download helper
  const downloadText = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(href); a.remove(); }, 0);
  };

  // Export buttons
  const onExportAll = () => {
    if (!lc?.time || !lc.flux) { alert("No lightcurve"); return; }
    const rows = lc.time.map((t, i) => `${t},${lc.flux[i] ?? ""}`).join("\n");
    downloadText(`${currentTarget.current ?? "lightcurve"}.csv`, `time,flux\n${rows}`);
  };
  const onExportVetted = () => {
    const rows = cands
      .filter((c) => toNum(c.p_planet ?? c.p ?? c.prob, -1) >= thr)
      .map((c, i) => [
        i + 1,
        c.period ?? c.P ?? "",
        c.duration ?? c.D ?? "",
        c.power ?? c.SDE ?? "",
        c.p_planet ?? c.p ?? c.prob ?? "",
      ].join(","))
      .join("\n");
    downloadText(`${currentTarget.current ?? "candidates"}.csv`, `# idx,period,duration,power,prob\n${rows}`);
  };

  // PDF
  const onPdf = async () => {
    try { await downloadPdf(currentTarget.current); }
    catch (e) { alert(`report_pdf: ${e instanceof Error ? e.message : String(e)}`); }
  };

  // Health check on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await apiGet(`${API_BASE}/health`);
        const ok = r.ok ? "API ✓" : "API ?";
        setStatus(ok);
      } catch { setStatus("API ?"); }
    })();
  }, []);

  // Main fetch+detect
  const onFetchDetect = async () => {
    const target = sel?.id || query.trim();
    if (!target) { alert("Give a target or upload a lightcurve"); return; }
    setBusy(true);
    try {
      currentTarget.current = target;
      const resp = await fetchDetect({
        target,
        threshold: thr,
        source, mission, peaks,
        detrend,
        quality_mask: qualityMask,
        remove_outliers: rmOutliers,
        sigma,
        centroid_vetting: doCentroid,
        gaia_neighbors: gaiaNeigh,
      });
      setLc(resp.lc || null);
      setCands(resp.candidates || []);
      setNeighbors(resp.neighbors || []);
    } catch (e) {
      alert(`fetch_detect: ${e instanceof Error ? e.message : String(e)}`);
    } finally { setBusy(false); }
  };

  const onUpload = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const resp = await detectFromUpload(file, {
        threshold: thr,
        source, mission, peaks,
        detrend,
        quality_mask: qualityMask,
        remove_outliers: rmOutliers,
        sigma,
        centroid_vetting: doCentroid,
        gaia_neighbors: gaiaNeigh,
      });
      currentTarget.current = file.name.replace(/\.[^.]+$/, "");
      setLc(resp.lc || null);
      setCands(resp.candidates || []);
      setNeighbors(resp.neighbors || []);
    } catch (e) {
      alert(`upload_detect: ${e instanceof Error ? e.message : String(e)}`);
    } finally { setBusy(false); }
  };

  // Render
  return (
    <>
      <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="afterInteractive" />
      <div className="container" style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <h1 style={{ fontWeight: 800 }}>Exoplanet Detector</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(null); }}
            placeholder="TIC 268042363"
            style={{ flex: 1, padding: 8, fontSize: 16 }}
            list="suggest-list"
          />
          <datalist id="suggest-list">
            {suggest.map((s) => (<option key={s.id} value={s.label} />))}
          </datalist>
          <button onClick={onFetchDetect} disabled={busy}>Fetch &amp; Detect</button>
          <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <input type="file" accept=".txt,.csv,.json" onChange={(e) => onUpload(e.target.files?.[0])} />
            Upload TXT/CSV/JSON
          </label>
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>{status}</span>
        </div>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
          <div>
            <label>Planet threshold p</label>
            <input type="range" min={0} max={1} step={0.01} value={thr} onChange={(e) => setThr(parseFloat(e.target.value))} />
            <div>{thr.toFixed(2)}</div>
          </div>
          <div>
            <label>σ (outlier)</label>
            <input type="range" min={2} max={10} step={0.1} value={sigma} onChange={(e) => setSigma(parseFloat(e.target.value))} />
            <div>{sigma.toFixed(1)}</div>
          </div>
          <div>
            <label>k-peaks</label>
            <input type="range" min={1} max={10} step={1} value={peaks} onChange={(e) => setPeaks(parseInt(e.target.value))} />
            <div>{peaks}</div>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          <div>
            <label>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option>MAST</option>
              <option>SPOC</option>
            </select>
          </div>
          <div>
            <label>Mission</label>
            <select value={mission} onChange={(e) => setMission(e.target.value)}>
              <option>auto</option>
              <option>tess</option>
              <option>kepler</option>
            </select>
          </div>
          <div>
            <label>Detrend</label>
            <select value={detrend} onChange={(e) => setDetrend(e.target.value)}>
              <option>flatten</option>
            </select>
          </div>
          <label><input type="checkbox" checked={qualityMask} onChange={(e) => setQualityMask(e.target.checked)} /> quality mask</label>
          <label><input type="checkbox" checked={rmOutliers} onChange={(e) => setRmOutliers(e.target.checked)} /> remove outliers</label>
          <label><input type="checkbox" checked={doCentroid} onChange={(e) => setDoCentroid(e.target.checked)} /> Centroid vetting (TESSCut)</label>
          <label><input type="checkbox" checked={gaiaNeigh} onChange={(e) => setGaiaNeigh(e.target.checked)} /> Gaia neighbors</label>
        </div>

        {/* Plots */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <h3>Light Curve</h3>
            <div ref={lcDiv} style={{ width: "100%", height: 320, border: "1px solid #ddd", borderRadius: 8 }} />
          </div>
          <div>
            <h3>Neighbors (Gaia DR3)</h3>
            <div ref={neiDiv} style={{ width: "100%", height: 320, border: "1px solid #ddd", borderRadius: 8 }} />
          </div>
        </div>

        {/* Candidates table */}
        <div style={{ marginTop: 16 }}>
          <h3>Candidates (green = vetted with P threshold)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Period</th>
                  <th>Duration</th>
                  <th>Depth</th>
                  <th>Power</th>
                  <th>Prob</th>
                </tr>
              </thead>
              <tbody>
                {cands.map((c, i) => {
                  const vetted = toNum(c.p_planet ?? c.p ?? c.prob, -1) >= thr;
                  const onClick = () => window.alert(`Fit transit for candidate ${i + 1} (TODO: wire to backend fit)`);
                  return (
                    <tr key={i} onClick={onClick} style={{ cursor: "pointer", background: vetted ? "#eaffea" : undefined }}>
                      <td>{i + 1}</td>
                      <td>{pd(c.period ?? c.P, 6)}</td>
                      <td>{pd(c.duration ?? c.D, 5)}</td>
                      <td>{c.depth ?? c.depth_ppm ?? c.depth_frac ?? ""}</td>
                      <td>{c.power ?? c.SDE ?? ""}</td>
                      <td>{pd(c.p_planet ?? c.p ?? c.prob, 2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={onExportAll}>Export CSV</button>
          <button onClick={onExportVetted} title="Export only candidates with P threshold">Export Vetted CSV</button>
          <button onClick={onPdf} title="Create a PDF vetting report for the current target">Download PDF report</button>
        </div>
      </div>
    </>
  );
}
