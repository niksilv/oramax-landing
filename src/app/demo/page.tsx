'use client';
import { useState } from 'react';

export default function Demo() {
  const [raw, setRaw] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [prob, setProb] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function predictJson() {
    setLoading(true); setErr(null); setProb(null);
    try {
      const values = raw.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
      const res = await fetch('https://app.oramax.space/predict', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ lightcurve: values })
      });
      const data = await res.json();
      setProb(data.planet_prob ?? null);
    } catch (e:any) { setErr(e?.message ?? 'Request failed'); }
    finally { setLoading(false); }
  }

  async function predictFile() {
    if (!file) return;
    setLoading(true); setErr(null); setProb(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('https://app.oramax.space/predict-file', { method: 'POST', body: fd });
      const data = await res.json();
      setProb(data.planet_prob ?? null);
    } catch (e:any) { setErr(e?.message ?? 'Upload failed'); }
    finally { setLoading(false); }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Orama X — Demo</h1>

      <section className="p-4 rounded-2xl border">
        <h2 className="font-semibold">JSON input</h2>
        <p className="text-sm opacity-80">Δώσε τιμές light curve (comma-separated)</p>
        <textarea
          className="w-full h-28 mt-2 p-3 border rounded"
          placeholder="1.0, 0.999, 1.001, 0.997"
          value={raw}
          onChange={e => setRaw(e.target.value)}
        />
        <button
          onClick={predictJson}
          disabled={loading}
          className="mt-3 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Υπολογισμός…' : 'Predict (JSON)'}
        </button>
      </section>

      <section className="p-4 rounded-2xl border">
        <h2 className="font-semibold">Ανέβασμα αρχείου (txt/csv)</h2>
        <input type="file" accept=".txt,.csv" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-2" />
        <button
          onClick={predictFile}
          disabled={loading || !file}
          className="ml-3 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Ανέβασμα…' : 'Predict (File)'}
        </button>
      </section>

      {prob !== null && <div className="text-lg">Planet probability: <b>{(prob*100).toFixed(2)}%</b></div>}
      {err && <div className="text-red-600">Σφάλμα: {err}</div>}
    </main>
  );
}
