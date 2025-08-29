'use client';

import React, { useState } from 'react';
import { apiPredictFromJson, apiPredictFromFile } from '@/components/ApiBridge';

function parseNumbers(input: string) {
  return input.trim().split(/[\s,]+/).map(Number).filter(n => Number.isFinite(n));
}

export default function Viewer() {
  const [raw, setRaw] = useState('');
  const [file, setFile] = useState<File|null>(null);
  const [out, setOut] = useState<any>({});
  const [err, setErr] = useState<string|null>(null);

  async function submitJSON() {
    setErr(null); setOut({});
    try {
      const data = await apiPredictFromJson(parseNumbers(raw));
      setOut(data);
    } catch (e:any) { setErr(e?.message || String(e)); }
  }
  async function submitFile() {
    if (!file) return;
    setErr(null); setOut({});
    try {
      const fd = new FormData(); fd.append('file', file);
      const data = await apiPredictFromFile(fd);
      setOut(data);
    } catch (e:any) { setErr(e?.message || String(e)); }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Predict</h1>
      <textarea className="w-full border rounded-md p-2 min-h-[120px]" value={raw} onChange={(e)=>setRaw(e.target.value)} placeholder="0.01, 0.02, 0.015, ..." />
      <button className="px-3 py-2 rounded-md bg-black text-white" onClick={submitJSON}>POST /api/predict</button>

      <div className="space-y-2">
        <input type="file" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
        <button className="px-3 py-2 rounded-md bg-black text-white" onClick={submitFile} disabled={!file}>POST /api/predict-file</button>
      </div>

      {err && <div className="p-2 rounded-md border border-red-300 text-red-700 text-sm">{err}</div>}
      <pre className="text-xs p-3 border rounded-md bg-slate-50 overflow-auto">{JSON.stringify(out, null, 2)}</pre>
    </div>
  );
}
