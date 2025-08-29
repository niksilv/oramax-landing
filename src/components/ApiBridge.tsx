/* STATIC-FALLBACK ApiBridge: μιλά απευθείας στο backend origin.
   Αν θέλεις, όρισε NEXT_PUBLIC_PUBLIC_API_BASE = https://api.oramax.space/exoplanet
*/
const PUBLIC_BASE =
  (process.env.NEXT_PUBLIC_PUBLIC_API_BASE || 'https://api.oramax.space/exoplanet')
    .replace(/\/$/, '');

export type Jsonish = any;
export type HttpResp = { ok: boolean; status: number; body: Jsonish };

async function get(url: string): Promise<HttpResp> {
  const r = await fetch(url, { cache: 'no-store' });
  const ct = r.headers.get('content-type') || '';
  const body = ct.includes('application/json') ? await r.json().catch(()=> ({})) : await r.text();
  return { ok: r.ok, status: r.status, body };
}

async function post(url: string, payload: any, isJson = true): Promise<HttpResp> {
  const init: RequestInit = { method: 'POST' };
  if (isJson) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(payload ?? {});
  } else {
    init.body = payload as FormData;
  }
  const r = await fetch(url, init);
  const ct = r.headers.get('content-type') || '';
  const body = ct.includes('application/json') ? await r.json().catch(()=> ({})) : await r.text();
  return { ok: r.ok, status: r.status, body };
}

export const Api = {
  health: () => get(`${PUBLIC_BASE}/health`),
  suggest: (q: string, domain = 'TESS') =>
    get(`${PUBLIC_BASE}/suggest?q=${encodeURIComponent(q)}&domain=${encodeURIComponent(domain)}`),
  detect: (payload: any) => post(`${PUBLIC_BASE}/detect`, payload, true),
  predict: (arr: number[]) => post(`${PUBLIC_BASE}/predict`, { lightcurve: arr }, true),
  predictFile: (fd: FormData) => post(`${PUBLIC_BASE}/predict-file`, fd, false),
};

/* --- Backward-compatible named exports (ώστε να ικανοποιούνται παλιοί imports) --- */
export function apiPredictFromJson(arr: number[]) { return Api.predict(arr); }
export function apiPredictFromFile(fd: FormData) { return Api.predictFile(fd); }
export function apiSuggest(q: string, domain = 'TESS') { return Api.suggest(q, domain); }
export function apiFetchDetect(payload: any) { return Api.detect(payload); }

export type SuggestItem = { id: string; label: string };
