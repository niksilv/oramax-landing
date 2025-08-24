'use client';

import { useMemo, useState } from 'react';

type PredictFeatures = Record<string, number>;
type PredictResponse = { planet_prob: number } & PredictFeatures;

const API_BASE = 'https://app.oramax.space';

function parseFlux(raw: string): number[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const tokens = trimmed.split(/[\s,]+/);
  const vals: number[] = [];
  for (const t of tokens) {
    const v = Number(t);
    if (!Number.isNaN(v) && Number.isFinite(v)) vals.push(v);
  }
  return vals;
}

function linePoints(flux: number[], width = 800, height = 300, pad = 24): string {
  if (flux.length === 0) return '';
  const min = Math.min(...flux);
  const max = Math.max(...flux);
  const span = max - min || 1; // avoid divide-by-zero

  const innerW = width - 2 * pad;
  const innerH = height - 2 * pad;

  const pts: string[] = [];
  const n = flux.length;
  for (let i = 0; i < n; i++) {
    const x = pad + (i / Math.max(1, n - 1)) * innerW;
    const y = pad + (1 - (flux[i] - min) / span) * innerH;
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
}

export default function Viewer() {
  const [raw, setRaw] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [prob, setProb] = useState<number | null>(null);
  const [features, setFeatures] = useState<PredictFeatures | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const flux = useMemo(() => parseFlux(raw), [raw]);
  const normFlux = useMemo(() => {
    if (flux.length === 0) return [];
    const med = [...flux].sort((a, b) => a - b)[Math.floor(flux.length / 2)] || 1;
    return med !== 0 ? flux.map(v => v / med) : flux;
  }, [flux]);

  async function runJSON() {
    setLoading(true); setError(null); setProb(null); setFeatures(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lightcurve: flux }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as PredictResponse;
      setProb(typeof data.planet_prob === 'number' ? data.planet_prob : null);
      // κράτα μόνο numeric key/values σαν features
      const f: PredictFeatures = {};
      for (const [k, v] of Object.entries(data)) {
        if (k !== 'planet_prob' && typeof v === 'number' && Number.isFinite(v)) f[k] = v;
      }
      setFeatures(f);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function runFile() {
    if (!file) return;
    setLoading(true); setError(null); setProb(null); setFeatures(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/predict-file`, { method: 'POST', body: fd });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as PredictResponse;
      setProb(typeof data.planet_prob === 'number' ? data.planet_prob : null);
      const f: PredictFeatures = {};
      for (const [k, v] of Object.entries(data)) {
        if (k !== 'planet_prob' && typeof v === 'number' && Number.isFinite(v)) f[k] = v;
      }
      setFeatures(f);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 flex flex-col gap-8 items-center">
      <div className="w-full max-w-5xl space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Oramax Viewer</h1>
        <p className="text-neutral-600">
          Επικόλλησε τιμές καμπύλης φωτός ή ανέβασε αρχείο (.txt/.csv). Θα δεις το γράφημα και την πιθανότητα πλανήτη.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-medium">Τιμές (χωρισμένες με κόμμα/κενό/γραμμή)</label>
            <textarea
              className="w-full h-40 p-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="1.0, 0.999, 1.001, 0.997, 1.000, 0.998, ..."
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
            <button
              onClick={() => setRaw('1.000 0.999 1.001 0.998 1.000 0.997 1.001 0.999 1.000')}
              className="text-sm underline"
            >
              Γέμισε με δείγμα
            </button>
            <div className="text-sm text-neutral-600">
              {flux.length} σημεία • {normFlux.length > 0 ? 'έτοιμο για πρόβλεψη' : 'δώσε τιμές'}
            </div>
            <button
              disabled={loading || normFlux.length < 5}
              onClick={runJSON}
              className="rounded-full px-5 py-2 bg-black text-white disabled:opacity-60"
            >
              {loading ? 'Υπολογισμός…' : 'Predict (JSON)'}
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Ανέβασμα αρχείου (.txt / .csv)</label>
            <input
              type="file"
              accept=".txt,.csv,text/plain"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block"
            />
            <button
              disabled={loading || !file}
              onClick={runFile}
              className="rounded-full px-5 py-2 bg-black text-white disabled:opacity-60"
            >
              {loading ? 'Υπολογισμός…' : 'Predict (File)'}
            </button>
            <p className="text-xs text-neutral-500">
              Το API σου: <code>{API_BASE}</code>
            </p>
          </div>
        </div>

        {/* Plot */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Γράφημα (κανονικοποιημένη ροή)</h2>
          <div className="overflow-auto rounded-xl border border-neutral-200 bg-white">
            <svg width={800} height={300} role="img" aria-label="Light curve chart">
              <rect x={0} y={0} width={800} height={300} fill="white" />
              <polyline
                fill="none"
                stroke="black"
                strokeWidth={1.5}
                points={linePoints(normFlux, 800, 300)}
              />
              {/* Axes-ish labels */}
              <text x={12} y={16} fontSize="10" fill="#666">Flux (norm.)</text>
              <text x={760} y={292} fontSize="10" fill="#666">Index →</text>
            </svg>
          </div>
        </div>

        {/* Result */}
        <div className="space-y-2">
          {prob !== null && (
            <div className="p-4 rounded-lg border border-neutral-200 bg-green-50">
              <div className="text-sm text-neutral-700">Πιθανότητα πλανήτη</div>
              <div className="text-2xl font-bold">
                {(prob * 100).toFixed(2)}%
              </div>
            </div>
          )}
          {features && (
            <div className="p-4 rounded-lg border border-neutral-200">
              <div className="text-sm font-semibold mb-2">Χαρακτηριστικά</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(features).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-neutral-600">{k}</span>
                    <span className="font-mono">{Number.isFinite(v) ? v.toFixed(4) : String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
