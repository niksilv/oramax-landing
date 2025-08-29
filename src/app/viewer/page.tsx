'use client';
import React, { useState } from 'react';
import { Api } from '@/components/ApiBridge';

function parseNumbers(input: string) {
  return input.trim().split(/[\s,]+/).map(Number).filter(n => Number.isFinite(n));
}

export default function ViewerPage() {
  const [raw, setRaw] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [out, setOut] = useState('');

  async function postJSON() {
    const nums = parseNumbers(raw);
    const r = await Api.predict(nums);
    setOut(JSON.stringify(r.body, null, 2));
  }

  async function postFile() {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const r = await Api.predictFile(fd);
    setOut(JSON.stringify(r.body, null, 2));
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Viewer</h1>
      <textarea className="w-full border rounded p-2 min-h-[120px]" value={raw} onChange={e=>setRaw(e.target.value)} />
      <div className="flex gap-2 items-center">
        <button className="px-3 py-2 bg-black text-white rounded" onClick={postJSON}>POST predict (JSON)</button>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="px-3 py-2 bg-black text-white rounded" onClick={postFile}>POST predict-file</button>
      </div>
      <pre className="text-xs bg-slate-50 border rounded p-2 overflow-auto">{out}</pre>
    </div>
  );
}
