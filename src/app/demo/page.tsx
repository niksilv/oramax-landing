'use client';

import { useState, ChangeEvent } from 'react';

type PredictResponse = { planet_prob: number };

function parseNumbers(input: string): number[] {
  return input
    .trim()
    .split(/[,\s]+/) // κόμματα ή/και κενά
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
}

export default function Demo() {
  const [raw, setRaw] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [prob, setProb] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFile(e.target.files?.[0] ?? null);
  };

  const predictJson = async (): Promise<void> => {
    setLoading(true);
    setErr(null);
    setProb(null);
    try {
      const values = parseNumbers(raw);
      const res = await fetch('https://app.oramax.space/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lightcurve: values }),
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const maybe = JSON.parse(text) as { detail?: string };
          setErr(maybe.detail ?? `HTTP ${res.status}`);
        } catch {
          setErr(`HTTP ${res.status}`);
        }
        return;
      }

      const data = (await res.json()) as PredictResponse;
      setProb(data.planet_prob ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const predictFile = async (): Promise<void> => {
    if (!file) return;
    setLoading(true);
    setErr(null);
    setProb(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('https://app.oramax.space/predict-file', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const maybe = JSON.parse(text) as { detail?: string };
          setErr(maybe.detail ?? `HTTP ${res.status}`);
        } catch {
          setErr(`HTTP ${res.status}`);
        }
        return;
      }

      const data = (await res.json()) as PredictResponse;
      setProb(data.planet_prob ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <h1 className="text-3xl font-bold">Orama X — Demo</h1>

      {/* JSON input */}
      <section className="rounded-xl border border-neutral-700 p-4 space-y-3">
        <h2 className="text-lg font-semibold">JSON input</h2>
        <p className="text-sm text-neutral-400">
          Δώσε τιμές light curve (comma-separated)
        </p>
        <textarea
          className="w-full h-40 rounded-md bg-neutral-900 border border-neutral-700 p-3 outline-none"
          placeholder="1.0, 0.999, 1.001, 0.997"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <button
          onClick={predictJson}
          disabled={loading}
          className="rounded-md bg-white text-black px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Predicting…' : 'Predict (JSON)'}
        </button>
      </section>

      {/* File upload */}
      <section className="rounded-xl border border-neutral-700 p-4 space-y-3">
        <h2 className="text-lg font-semibold">Ανέβασμα αρχείου (txt/csv)</h2>
        <input type="file" accept=".txt,.csv" onChange={onFileChange} />
        <button
          onClick={predictFile}
          disabled={loading || !file}
          className="rounded-md bg-white text-black px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Predicting…' : 'Predict (File)'}
        </button>
      </section>

      {/* Output */}
      {prob !== null && (
        <div className="rounded-md border border-emerald-700 p-3 text-emerald-400">
          planet_prob: {prob.toFixed(6)}
        </div>
      )}
      {err && (
        <div className="rounded-md border border-red-700 p-3 text-red-400">
          Σφάλμα: {err}
        </div>
      )}
    </div>
  );
}
