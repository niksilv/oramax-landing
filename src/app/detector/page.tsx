\'use client\';

import React, { useRef, useState } from \'react\';
import { Api, SuggestItem } from \'@/components/ApiBridge\';

export default function DetectorPage() {
  const [target, setTarget] = useState(\'TIC 268125229\');
  const [suggest, setSuggest] = useState<SuggestItem[]>([]);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [pretty, setPretty] = useState(true);
  const [jsonOut, setJsonOut] = useState<unknown>({});

  async function checkApi() {
    const r = await Api.health();
    setApiOk(r.ok);
    setJsonOut(r.body);
  }

  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);
  async function onSuggest(q: string) {
    if (tmr.current) clearTimeout(tmr.current);
    if (!q || q.length < 3) return setSuggest([]);
    tmr.current = setTimeout(async () => {
      const r = await Api.suggest(q, 'TESS'); // r: HttpResp<{items: SuggestItem[]}>
      const body = r.body as { items?: SuggestItem[] } | undefined;
      const items = Array.isArray(body?.items) ? body!.items! : [];
      setSuggest(items);
    }, 220);
  }

  const rendered = typeof jsonOut === 'string'
    ? (jsonOut as string)
    : (pretty ? JSON.stringify(jsonOut, null, 2) : JSON.stringify(jsonOut));

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Exoplanet Detector</h1>
        <div className="text-sm flex items-center gap-3">
          <button onClick={checkApi} className="px-2 py-1 rounded-md border text-xs">Check API</button>
          <span className={apiOk ? 'text-emerald-600' : apiOk===false ? 'text-red-600' : 'text-slate-400'}>
            {apiOk==null ? 'API' : apiOk ? 'API OK' : 'API error'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Target</label>
        <input
          value={target}
          onChange={(e)=>{ setTarget(e.target.value); onSuggest(e.target.value); }}
          className="w-full border rounded px-3 py-2"
          placeholder="TIC 268125229"
        />
        <div className="text-xs text-slate-500 mt-1">
          Suggestions: {suggest.length ? suggest.map(s => s.label).join(', ') : ''}
        </div>
      </div>

      <pre className="p-3 rounded border bg-slate-50 overflow-auto text-xs">
        {rendered}
      </pre>
    </div>
  );
}