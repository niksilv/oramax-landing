// components/ApiBridge.ts
// Γενικός client προς το backend (χωρίς `any`) + helpers predict & predictFile.

const isBrowser = typeof window !== "undefined";
const isLocal =
  isBrowser && ["localhost", "127.0.0.1"].includes(window.location.hostname);

type WindowWithAPI = Window & {
  API_BASE?: string;
  APP_BASE?: string;
};

// Παίρνουμε API_BASE από window (set στο index.html) ή βάζουμε default
export const API_BASE: string =
  (isBrowser ? (window as WindowWithAPI).API_BASE : undefined) ||
  (isLocal ? "http://localhost:8000/exoplanet" : "/detector/api");

// Join χωρίς διπλά slashes
function join(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

type PostBody = string | JsonValue | ArrayBuffer | Blob | FormData;

function isBinaryBody(b: PostBody): b is ArrayBuffer | Blob | FormData {
  return (
    b instanceof ArrayBuffer ||
    (typeof Blob !== "undefined" && b instanceof Blob) ||
    (typeof FormData !== "undefined" && b instanceof FormData)
  );
}

function ensureHeaders(init?: RequestInit): Headers {
  if (init?.headers instanceof Headers) return init.headers;
  const h = new Headers(init?.headers as HeadersInit | undefined);
  return h;
}

export const Api = {
  async get(path: string, init?: RequestInit): Promise<Response> {
    const url = join(API_BASE, path);
    const res = await fetch(url, { ...init, method: "GET" });
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
    return res;
  },

  async post(path: string, body: PostBody, init?: RequestInit): Promise<Response> {
    const url = join(API_BASE, path);
    const headers = ensureHeaders(init);

    let payload: BodyInit | null = null;

    if (isBinaryBody(body)) {
      // ΜΗΝ ορίζεις Content-Type για FormData/Blob/ArrayBuffer
      headers.delete("Content-Type");
      payload = body as BodyInit;
    } else if (typeof body === "string") {
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      payload = body;
    } else {
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      payload = JSON.stringify(body);
    }

    const res = await fetch(url, {
      ...init,
      method: "POST",
      headers,
      body: payload,
    });

    if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
    return res;
  },

  // ---- helper: predict (array αριθμών) ----
  async predict(values: number[], init?: RequestInit): Promise<{ status: number; body: unknown }> {
    // αν το backend σου έχει άλλο path, άλλαξέ το εδώ
    const res = await this.post("ml/predict", { values }, init);
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  },

  // ---- helper: predictFile (File/Blob μέσω FormData) ----
  async predictFile(form: FormData, init?: RequestInit): Promise<{ status: number; body: unknown }> {
    // φροντίζουμε να μην έχει Content-Type (θα το βάλει ο browser)
    const headers = ensureHeaders(init);
    headers.delete("Content-Type");
    const res = await this.post("ml/predict_file", form, { ...init, headers });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  },
};

export default Api;
