/* STATIC-FALLBACK ApiBridge: talks directly to backend origin.
   If needed, set NEXT_PUBLIC_PUBLIC_API_BASE to override the base URL.
*/
const PUBLIC_BASE =
  (process.env.NEXT_PUBLIC_PUBLIC_API_BASE || 'https://api.oramax.space/exoplanet')
    .replace(/\/$/, '');

export type Jsonish = unknown;
export interface HttpResp<T = unknown> { ok: boolean; status: number; body: T; }

async function parseBody(r: Response): Promise<unknown> {
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await r.json(); } catch { return {}; }
  }
  return await r.text();
}

function isFormData(x: unknown): x is FormData {
  return typeof FormData !== 'undefined' && x instanceof FormData;
}

export async function get<T = unknown>(url: string): Promise<HttpResp<T>> {
  const r = await fetch(url, { cache: 'no-store' });
  const body = await parseBody(r) as T;
  return { ok: r.ok, status: r.status, body };
}

export async function post<T = unknown>(url: string, payload: unknown, isJson = true): Promise<HttpResp<T>> {
  const init: RequestInit = { method: 'POST' };
  if (!isJson && isFormData(payload)) {
    init.body = payload;
  } else {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(payload ?? {});
  }
  const r = await fetch(url, init);
  const body = await parseBody(r) as T;
  return { ok: r.ok, status: r.status, body };
}

export type SuggestItem = { id: string; label: string };

export const Api = {
  health: () => get<{ ok: boolean; api_prefix?: string }>(`${PUBLIC_BASE}/health`),
  suggest: (q: string, domain = 'TESS') =>
    get<{ items: SuggestItem[] }>(`${PUBLIC_BASE}/suggest?q=${encodeURIComponent(q)}&domain=${encodeURIComponent(domain)}`),
  detect: (payload: Record<string, unknown>) => post(`${PUBLIC_BASE}/detect`, payload, true),
  predict: (arr: number[]) => post<{ planet_prob: number }>(`${PUBLIC_BASE}/predict`, { lightcurve: arr }, true),
  predictFile: (fd: FormData) => post<{ planet_prob: number }>(`${PUBLIC_BASE}/predict-file`, fd, false),
};

/* --- Backward-compatible named exports (for any older imports) --- */
export function apiPredictFromJson(arr: number[]) { return Api.predict(arr); }
export function apiPredictFromFile(fd: FormData) { return Api.predictFile(fd); }
export function apiSuggest(q: string, domain = 'TESS') { return Api.suggest(q, domain); }
export function apiFetchDetect(payload: Record<string, unknown>) { return Api.detect(payload); }