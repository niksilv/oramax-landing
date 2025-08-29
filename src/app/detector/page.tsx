"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type NumArray = number[];
type Folded = { phase: NumArray; flux: NumArray };
type Centroid = { pass?: boolean; ok?: boolean };
type NeighborPoint = { sep: number; gmag: number; bprp?: number };
type Neighbors = { points?: NeighborPoint[]; info?: string };

type Candidate = {
  period?: number;
  P?: number;
  duration?: number;
  D?: number;
  depth?: number | string;
  depth_ppm?: number;
  depth_frac?: number;
  power?: number;
  SDE?: number;
  p_planet?: number;
  p?: number;
  prob?: number;
  snr?: number;
  SNR?: number;
  delta_bic?: number;
  dBIC?: number;
  odd_even_ppm?: number;
  secondary?: string | boolean;
  centroid?: Centroid;
  folded?: Folded;
};

type LightCurve = { time: NumArray; flux: NumArray };

type DetectResponse = {
  target?: string;
  id?: string;
  lc?: LightCurve;
  lightcurve?: LightCurve;
  raw?: LightCurve;
  time?: NumArray;
  flux?: NumArray;
  pf?: Folded;
  folded?: Folded;
  cands?: Candidate[];
  candidates?: Candidate[];
  results?: Candidate[];
  neighbors?: Neighbors;
  gaia?: Neighbors;
  centroid?: unknown;
  error?: string;
  detail?: string;
};

// ---- Plotly typings (minimal) ----
type PlotlyData = { x: number[]; y: number[]; mode: "markers"; marker?: { size?: number }; name?: string };
type PlotlyLayout = {
  margin?: { l?: number; r?: number; t?: number; b?: number };
  xaxis?: { title?: string };
  yaxis?: { title?: string };
};
type PlotlyConfig = { displayModeBar?: boolean; responsive?: boolean };
interface PlotlyLike {
  newPlot: (el: HTMLElement, data: PlotlyData[], layout?: PlotlyLayout, config?: PlotlyConfig) => void;
}

const toNum = (x: unknown, fallback = 0): number => {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : fallback;
};

const API_BASE = "/api"; // proxied to Fly

function hasPlotly(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { Plotly?: PlotlyLike };
  return typeof w.Plotly !== "undefined";
}

async function apiGet(path: string): Promise<Response> {
  return fetch(path, { method: "GET", cache: "no-store" });
}
async function apiPost(path: string, body: unknown, contentType = "application/json"): Promise<Response> {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": contentType, accept: "*/*" },
    body: contentType.includes("json") ? JSON.stringify(body) : (body as string),
    cache: "no-store",
  };
  return fetch(path, init);
}
async function tryJson<T = unknown>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return { ok: false, raw: text } as unknown as T;
  }
}

async function fetchSuggest(q: string): Promise<unknown> {
  let res = await apiGet(`${API_BASE}/suggest?q=${encodeURIComponent(q)}&limit=10`);
  if (res.status === 404) res = await apiGet(`${API_BASE}/predict/suggest?q=${encodeURIComponent(q)}&limit=10`);
  return tryJson(res);
}

async function fetchDetect(body: unknown): Promise<DetectResponse> {
  let res = await apiPost(`${API_BASE}/fetch_detect`, body);
  if (res.status === 404 || res.status === 405) res = await apiPost(`${API_BASE}/predict`, { ...(body as object), op: "fetch_detect" });
  return tryJson<DetectResponse>(res);
}

async function detectFromUpload(text: string): Promise<DetectResponse> {
  let res = await apiPost(`${API_BASE}/detect`, text, "text/plain");
  if (res.status === 404 || res.status === 405) res = await apiPost(`${API_BASE}/predict`, { from: "upload", text });
  return tryJson<DetectResponse>(res);
}

async function fitTransit(payload: unknown): Promise<unknown> {
  let res = await apiPost(`${API_BASE}/fit_transit`, payload);
  if (res.status === 404 || res.status === 405) res = await apiPost(`${API_BASE}/fit`, payload);
  return tryJson(res);
}

async function downloadPdf(target: string | null | undefined): Promise<void> {
  const safe = encodeURIComponent(String(target ?? ""));
  let r = await apiGet(`${API_BASE}/report_pdf?target=${safe}`);
  if (r.status === 404) r = await apiGet(`${API_BASE}/report?target=${safe}`);
  if (!r.ok) throw new Error(await r.text());
  const blob = await r.blob();
  const obj = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = obj;
  a.download = `${String(target ?? "report")}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(obj);
    a.remove();
  }, 0);
}

function Plot({ id, height }: { id: string; height: number }) {
  return <div id={id} style={{ height }} />;
}

export default function DetectorReact() {
  // Controls
  const [source, setSource] = useState<"mast_spoc" | "mast_qlp" | "url">("mast_spoc");
  const [mission, setMission] = useState<"auto" | "TESS" | "Kepler" | "K2">("auto");
  const [kpeaks, setKpeaks] = useState<number>(3);
  const [detrend, setDetrend] = useState<"flatten" | "none">("flatten");
  const [qualityMask, setQualityMask] = useState<boolean>(true);
  const [removeOutliers, setRemoveOutliers] = useState<boolean>(true);
  const [sigmaCut, setSigmaCut] = useState<number>(5);
  const [centroid, setCentroid] = useState<boolean>(false);
  const [gaia, setGaia] = useState<boolean>(false);

  const [thr, setThr] = useState<number>(0.8);
  const [sigmaThr, setSigmaThr] = useState<number>(3);
  const [rhoThr, setRhoThr] = useState<number>(0.15);
  const [neiRadius, setNeiRadius] = useState<number>(60);

  const [target, setTarget] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [fitStatus, setFitStatus] = useState<string>("");
  const [vettedCount, setVettedCount] = useState<number>(0);

  // Results
  const [lc, setLc] = useState<LightCurve | null>(null);
  const [pf, setPf] = useState<Folded | null>(null);
  const [cands, setCands] = useState<Candidate[]>([]);
  const [neighbors, setNeighbors] = useState<Neighbors | null>(null);
  const currentTarget = useRef<string | null>(null);

  // Suggest debounce
  useEffect(() => {
    if (source === "url") return; // no suggest
    const q = target.trim();
    if (q.length < 3) return;
    const t = setTimeout(async () => {
      try {
        const js = (await fetchSuggest(q)) as unknown;
        const jso = js as { items?: unknown[]; suggestions?: unknown[] };
        const items = Array.isArray(js) ? (js as unknown[]) : (jso.items ?? jso.suggestions ?? []);
        const vals: string[] = items.map((it) => {
          if (typeof it === "string" || typeof it === "number") return String(it);
          if (typeof it === "object" && it !== null) {
            const o = it as Record<string, unknown>;
            const cand = o["id"] ?? o["value"] ?? o["label"] ?? o["tic"] ?? o["name"];
            return String(cand ?? "");
          }
          return "";
        }).filter(Boolean);
        setSuggestions(vals.slice(0, 10));
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [target, source]);

  // Plot helpers
  const plotLC = (lcData: LightCurve | null) => {
    if (!lcData || !hasPlotly()) return;
    const Plotly = (window as unknown as { Plotly: PlotlyLike }).Plotly;
    const el = document.getElementById("lc") as HTMLElement | null;
    if (!el) return;
    const data: PlotlyData[] = [{ x: lcData.time, y: lcData.flux, mode: "markers", marker: { size: 3 }, name: "flux" }];
    const layout: PlotlyLayout = { margin: { l: 40, r: 10, t: 10, b: 30 }, xaxis: { title: "time" }, yaxis: { title: "flux" } };
    const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
    Plotly.newPlot(el, data, layout, cfg);
  };
  const plotPF = (pfData: Folded | null) => {
    if (!pfData || !hasPlotly()) return;
    const Plotly = (window as unknown as { Plotly: PlotlyLike }).Plotly;
    const el = document.getElementById("pf") as HTMLElement | null;
    if (!el) return;
    const data: PlotlyData[] = [{ x: pfData.phase, y: pfData.flux, mode: "markers", marker: { size: 3 }, name: "folded" }];
    const layout: PlotlyLayout = { margin: { l: 40, r: 10, t: 10, b: 30 }, xaxis: { title: "phase" }, yaxis: { title: "flux" } };
    const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
    Plotly.newPlot(el, data, layout, cfg);
  };
  const plotNeighbors = (nei: Neighbors | null) => {
    if (!nei?.points || !hasPlotly()) return;
    const Plotly = (window as unknown as { Plotly: PlotlyLike }).Plotly;
    const el = document.getElementById("neighborsPlot") as HTMLElement | null;
    if (!el) return;
    const d = nei.points;
    const data: PlotlyData[] = [{ x: d.map((p) => p.sep), y: d.map((p) => p.gmag), mode: "markers", marker: { size: 6 }, name: "Gaia" }];
    const layout: PlotlyLayout = { margin: { t: 10 }, xaxis: { title: 'sep ["]' }, yaxis: { title: "Gmag" } };
    const cfg: PlotlyConfig = { displayModeBar: false, responsive: true };
    Plotly.newPlot(el, data, layout, cfg);
  };

  // Render plots on state change
  useEffect(() => { plotLC(lc); }, [lc]);
  useEffect(() => { plotPF(pf); }, [pf]);
  useEffect(() => { plotNeighbors(neighbors); }, [neighbors]);

  // Handle detect result
  const handleDetectResult = (js: DetectResponse) => {
    const lc0 = js.lc ?? js.lightcurve ?? js.raw ?? null;
    const time = Array.isArray(js.time) ? js.time : lc0?.time;
    const flux = Array.isArray(js.flux) ? js.flux : lc0?.flux;
    const lcData: LightCurve | null = time && flux ? { time, flux } : null;
    const pf0 = js.pf ?? js.folded ?? null;
    const cands0 = js.cands ?? js.candidates ?? js.results ?? [];

    setLc(lcData);
    setPf(pf0);
    setCands(cands0);
    setNeighbors(js.neighbors ?? js.gaia ?? null);
    currentTarget.current = js.target ?? js.id ?? target;

    // vetted count
    const threshold = thr;
    const vetted = cands0.filter((c) => {
      const p = c.p_planet ?? c.p ?? c.prob;
      return typeof p === "number" && p >= threshold;
    }).length;
    setVettedCount(vetted);
  };

  // Fetch & Detect
  const onFetch = async () => {
    if (source === "url" && url.trim() === "") { setStatus("Provide CSV/TXT URL"); return; }
    if (source !== "url" && target.trim() === "") { setStatus("Provide target (e.g., TIC ...)"); return; }
    setStatus("Working...");
    try {
      const body = {
        source,
        mission,
        target: source === "url" ? null : target.trim(),
        url: source === "url" ? url.trim() : null,
        options: {
          kpeaks, detrend, sigma: sigmaCut, quality: qualityMask, outliers: removeOutliers,
          centroid, gaia, centroid_sigma_thr: sigmaThr, centroid_rho_thr: rhoThr,
          neighbors_radius: neiRadius, prob_thr: thr,
        },
      };
      const js = await fetchDetect(body);
      if ((js as DetectResponse).error || (js as DetectResponse).detail) throw new Error((js as DetectResponse).error || (js as DetectResponse).detail);
      handleDetectResult(js);
      setStatus("Done");
    } catch (e) {
      setStatus("Error");
      alert(`fetch_detect: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // Upload Detect
  const onUpload = async (file?: File) => {
    if (!file) return;
    setStatus("Working upload...");
    try {
      const txt = await file.text();
      const js = await detectFromUpload(txt);
      if (js.error || js.detail) throw new Error(js.error || js.detail);
      handleDetectResult(js);
      setStatus("Done");
    } catch (e) {
      setStatus("Error");
      alert(`detect(upload): ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  // Export
  const downloadText = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(href); a.remove(); }, 0);
  };
  const onExportAll = () => {
    if (!lc?.time || !lc.flux) { alert("No lightcurve"); return; }
    const rows = lc.time.map((t, i) => `${t},${lc.flux[i] ?? ""}`).join("\n");
    downloadText(`${currentTarget.current ?? "lightcurve"}.csv`, `time,flux\n${rows}`);
  };
  const onExportVetted = () => {
    const rows = cands
      .filter((c) => toNum(c.p_planet ?? c.p ?? c.prob, -1) >= thr)
      .map((c, i) =>
        [i + 1, c.period ?? c.P ?? "", c.duration ?? c.D ?? "", c.depth ?? c.depth_ppm ?? c.depth_frac ?? "", c.power ?? c.SDE ?? "", c.p_planet ?? c.p ?? c.prob ?? ""].join(",")
      )
      .join("\n");
    if (!rows) { alert("No vetted candidates"); return; }
    downloadText(`${currentTarget.current ?? "candidates"}_vetted.csv`, "index,period,duration,depth,power,prob\n" + rows);
  };

  // Fit transit
  const onFit = async () => {
    const cand = cands[0];
    if (!cand) { alert("Select a candidate first"); return; }
    setFitStatus("Fitting...");
    try {
      const js = await fitTransit({ target: currentTarget.current, candidate: cand, method: "batman", bootstrap: 80 });
      const folded = (js as { folded?: Folded; pf?: Folded }).folded ?? (js as { folded?: Folded; pf?: Folded }).pf;
      if (folded) setPf(folded);
      setFitStatus("Done");
    } catch (e) {
      setFitStatus("Error");
      alert(`fit_transit: ${e instanceof Error ? e.message : String(e)}`);
    }
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

  // Styles
  const styles: React.CSSProperties = {
    fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif',
    margin: 24,
    background: "#fafafa",
    color: "#111",
  };

  const vettedBadge = useMemo(() => (vettedCount ? `vetted: ${vettedCount}` : ""), [vettedCount]);

  return (
    <>
      <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="afterInteractive" />
      <div style={styles}>
        <h1>Orama X  Exoplanet Detector</h1>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <h3>Live Fetch &amp; Detect</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <label>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value as typeof source)}>
              <option value="mast_spoc">MAST  SPOC (PDCSAP)</option>
              <option value="mast_qlp">MAST  QLP</option>
              <option value="url">External CSV/TXT URL</option>
            </select>

            <label>Mission</label>
            <select value={mission} onChange={(e) => setMission(e.target.value as typeof mission)}>
              <option value="auto">auto</option>
              <option value="TESS">TESS</option>
              <option value="Kepler">Kepler</option>
              <option value="K2">K2</option>
            </select>

            <label>k-peaks</label>
            <input type="number" value={kpeaks} onChange={(e) => setKpeaks(toNum(e.target.value, 3))} min={1} max={5} style={{ width: 70 }} />

            <label>Detrend</label>
            <select value={detrend} onChange={(e) => setDetrend(e.target.value as typeof detrend)}>
              <option value="flatten">flatten</option>
              <option value="none">none</option>
            </select>

            <label><input type="checkbox" checked={qualityMask} onChange={(e) => setQualityMask(e.target.checked)} /> quality mask</label>
            <label><input type="checkbox" checked={removeOutliers} onChange={(e) => setRemoveOutliers(e.target.checked)} /> remove outliers</label>

            <label>σ</label>
            <input type="number" value={sigmaCut} step={0.5} onChange={(e) => setSigmaCut(toNum(e.target.value, 5))} style={{ width: 70 }} />

            <label><input type="checkbox" checked={centroid} onChange={(e) => setCentroid(e.target.checked)} /> Centroid vetting (TESSCut)</label>
            <label><input type="checkbox" checked={gaia} onChange={(e) => setGaia(e.target.checked)} /> Gaia neighbors</label>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
            <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>Planet threshold</span>
            <input type="range" min={0.5} max={0.99} step={0.01} value={thr} onChange={(e) => setThr(toNum(e.target.value, 0.8))} style={{ width: 180 }} />
            <span style={{ color: "#666", fontSize: 13 }}>p <b>{thr.toFixed(2)}</b></span>
            <span style={{ color: "#666", fontSize: 13 }}>{vettedBadge}</span>

            <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>Centroid σ-thr</span>
            <input type="range" min={1} max={10} step={0.5} value={sigmaThr} onChange={(e) => setSigmaThr(toNum(e.target.value, 3))} style={{ width: 160 }} />
            <span style={{ color: "#666", fontSize: 13 }}><b>{sigmaThr.toFixed(1)}</b></span>

            <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>ρ-thr</span>
            <input type="range" min={0} max={0.5} step={0.01} value={rhoThr} onChange={(e) => setRhoThr(toNum(e.target.value, 0.15))} style={{ width: 160 }} />
            <span style={{ color: "#666", fontSize: 13 }}><b>{rhoThr.toFixed(2)}</b></span>

            <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>Gaia radius [&quot;]</span>
            <input type="range" min={20} max={120} step={5} value={neiRadius} onChange={(e) => setNeiRadius(toNum(e.target.value, 60))} style={{ width: 160 }} />
            <span style={{ color: "#666", fontSize: 13 }}><b>{neiRadius.toFixed(0)}</b></span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
            {source === "url" ? (
              <input type="text" placeholder="https://.../lightcurve.csv (time,flux)" value={url} onChange={(e) => setUrl(e.target.value)} style={{ minWidth: 400 }} />
            ) : (
              <>
                <input
                  type="text"
                  list="targetList"
                  placeholder="TIC 307210830 (for MAST)"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  style={{ minWidth: 260 }}
                />
                <datalist id="targetList">
                  {suggestions.map((s) => <option key={s} value={s} />)}
                </datalist>
              </>
            )}

            <button onClick={onFetch}>Fetch &amp; Detect</button>
            <button onClick={onExportAll}>Export CSV</button>
            <button onClick={onExportVetted} title="Export only candidates with P threshold">Export Vetted CSV</button>
            <span style={{ color: "#666", fontSize: 13 }}>{status}</span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
            <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>Fit method</span>
            <select defaultValue="batman">
              <option value="batman">batman</option>
              <option value="trapezoid">trapezoid</option>
            </select>
            <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd" }}>bootstrap N</span>
            <input type="number" defaultValue={80} min={0} max={400} step={20} style={{ width: 90 }} />
            <button onClick={onFit}>Fit transit (selected)</button>
            <button onClick={onPdf} title="Create a PDF vetting report for the current target">Download PDF report</button>
            <span style={{ color: "#666", fontSize: 13 }}>{fitStatus}</span>
          </div>
        </div>

        <details>
          <summary><b>Advanced: Upload custom light curve (TXT/CSV)</b></summary>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, marginTop: 10 }}>
            <h3>Upload TXT (2 columns: time, flux)</h3>
            <input type="file" accept=".txt,.csv" onChange={(e) => onUpload(e.currentTarget.files?.[0] ?? undefined)} />
          </div>
        </details>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
          <div style={{ flex: 1, minWidth: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <h3>Light Curve</h3>
            <Plot id="lc" height={380} />
          </div>
          <div style={{ flex: 1, minWidth: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
            <h3>Phase-Folded (selected candidate)</h3>
            <Plot id="pf" height={340} />
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, marginTop: 16 }}>
          <h3>
            Candidates <span style={{ color: "#666", fontSize: 13 }}>(green = vetted with P threshold; badge = centroid test)</span>
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>#</th><th>Period (d)</th><th>Duration (d)</th><th>Depth</th><th>Power</th><th>P(planet)</th>
                <th>SNR</th><th>ΔBIC</th><th>OddEven Δ (ppm)</th><th>Secondary?</th><th>Centroid</th>
              </tr>
            </thead>
            <tbody>
              {cands.map((c, i) => {
                const p =
                  typeof c.p_planet === "number" ? c.p_planet :
                  typeof c.p === "number" ? c.p :
                  typeof c.prob === "number" ? c.prob : null;
                const vetted = p !== null && p >= thr;
                const onClick = () => { if (c.folded?.phase && c.folded.flux) setPf(c.folded); };
                const pd = (x: unknown, n: number) => (typeof x === "number" ? x.toFixed(n) : (x ?? ""));
                const centroidBadge = c.centroid && (c.centroid.pass === true || c.centroid.ok === true) ?
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", background: "#e6ffed", color: "#006622" }}>OK</span> :
                  c.centroid ? <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", background: "#ffe6e6", color: "#b30000" }}>Shift</span> : null;
                return (
                  <tr key={i} onClick={onClick} style={{ cursor: "pointer", background: vetted ? "#eaffea" : undefined }}>
                    <td>{i + 1}</td>
                    <td>{pd(c.period ?? c.P, 6)}</td>
                    <td>{pd(c.duration ?? c.D, 5)}</td>
                    <td>{c.depth ?? c.depth_ppm ?? c.depth_frac ?? ""}</td>
                    <td>{c.power ?? c.SDE ?? ""}</td>
                    <td>{p !== null ? <b>{(p * 100).toFixed(1)}%</b> : ""}</td>
                    <td>{c.snr ?? c.SNR ?? ""}</td>
                    <td>{c.delta_bic ?? c.dBIC ?? ""}</td>
                    <td>{c.odd_even_ppm ?? ""}</td>
                    <td>{String(c.secondary ?? "")}</td>
                    <td>{centroidBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, marginTop: 16 }}>
          <h3>Neighbors (Gaia DR3)</h3>
          <Plot id="neighborsPlot" height={320} />
          {neighbors?.info && <div style={{ color: "#666", fontSize: 13 }}>{neighbors.info}</div>}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead><tr><th>sep [&quot;]</th><th>Gmag</th><th>BPRP</th></tr></thead>
            <tbody>
              {(neighbors?.points ?? []).map((p, i) => (
                <tr key={i}><td>{p.sep}</td><td>{p.gmag}</td><td>{p.bprp ?? ""}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
