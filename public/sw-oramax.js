// Orama X — Service Worker proxy (v57)
// - No window usage (SW runs in ServiceWorkerGlobalScope)
// - Same-origin only: intercepts /detector/*
// - Proxies /detector/api/* to backend (no CORS headaches)
// - Special handling for gaia_neighbors
// - Safe stub for report_pdf

const VERSION = "v57";

// Upstream backends to try in order:
const BACKENDS = [
  "https://api.oramax.space/exoplanet",
  "https://oramax-exoplanet-api.fly.dev/exoplanet",
  "http://127.0.0.1:8000/exoplanet",
];

// ---------- SW lifecycle ----------
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// ---------- helpers ----------
function join(base, path) {
  if (!base.endsWith("/")) base += "/";
  return base + path.replace(/^\//, "");
}
function json(status, data, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Oramax-SW": `v${VERSION}`,
      ...(extraHeaders || {}),
    },
  });
}
function normalizeNeighbors(nei, defaultRadius) {
  if (!nei) return { available: false, reason: "n/a", radius_arcsec: defaultRadius };
  if (typeof nei.available === "boolean") {
    if (!("radius_arcsec" in nei)) nei.radius_arcsec = defaultRadius;
    return nei;
  }
  if (Array.isArray(nei)) return { available: true, radius_arcsec: defaultRadius, items: nei };
  const items = nei.items || nei.sources || nei.data || [];
  return {
    available: Array.isArray(items) && items.length > 0,
    radius_arcsec: nei.radius_arcsec || defaultRadius,
    items,
  };
}
function stripInternalFlags(u) {
  const url = new URL(u);
  url.searchParams.delete("__backend");
  return url;
}

// ---------- special endpoints ----------
async function handlePdfDirect() {
  // placeholder PDF to keep UX responsive if backend PDF is disabled
  const pdfBytes = new TextEncoder().encode("%PDF-1.4\n%…minimal…\n%%EOF");
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Oramax_Vetting.pdf"',
      "X-Oramax-SW": `pdf-${VERSION}`,
    },
  });
}

async function handleGaiaNeighbors(req) {
  const url = new URL(req.url);
  const targetName = url.searchParams.get("target") || url.searchParams.get("tic") || "";
  const radius = Number(url.searchParams.get("radius") || "60") || 60;

  // 1) Try GET /gaia_neighbors on each backend
  for (const base of BACKENDS) {
    try {
      const up = join(base, "gaia_neighbors") + `?target=${encodeURIComponent(targetName)}&radius=${radius}`;
      const r = await fetch(up, { method: "GET", headers: { Accept: "application/json" } });
      if (r.ok) {
        const buf = await r.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: { "Content-Type": "application/json", "X-Oramax-SW": `gaia-get-${VERSION}` },
        });
      }
    } catch {
      /* try next */
    }
  }

  // 2) Fallback: POST /fetch_detect (neighbors only)
  const body = JSON.stringify({
    source: "mast_spoc",
    mission: "TESS",
    target: targetName,
    kpeaks: 0,
    detrend: "none",
    quality: false,
    remove_outliers: false,
    neighbors: true,
    neighbors_radius: radius,
    centroid: false,
  });
  const initPost = { method: "POST", headers: { "Content-Type": "application/json" }, body };

  for (const base of BACKENDS) {
    try {
      const r = await fetch(join(base, "fetch_detect"), initPost);
      if (!r.ok) continue;
      const j = await r.json();
      const nei = normalizeNeighbors(j.neighbors || j, radius);
      return json(200, nei, { "X-Oramax-SW": `gaia-fd-${VERSION}` });
    } catch {
      /* try next */
    }
  }

  return json(502, {
    available: false,
    reason: "Gaia neighbors failed on all backends.",
    radius_arcsec: radius,
  });
}

// ---------- generic proxy for /detector/api/* ----------
async function proxyGeneric(req) {
  // Normalize any accidental /detector/detector/api duplication
  const u0 = new URL(req.url);
  const u = new URL(u0.href.replace(/\/detector\/(?:detector\/)+/g, "/detector/"));
  const rest = u.pathname.replace(/^\/detector\/api\//, "");
  const init = {
    method: req.method,
    headers: new Headers(req.headers),
    redirect: "follow",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.clone().arrayBuffer();
  }
  // Avoid leaking browser-origin to upstream
  init.headers.delete("origin");
  init.headers.delete("referer");

  let lastErr = null;
  for (const base of BACKENDS) {
    try {
      const r = await fetch(join(base, rest) + stripInternalFlags(u).search, init);
      // Forward any non-404/405 upstream response as-is
      if (r.status !== 404 && r.status !== 405) return r;
      lastErr = `HTTP ${r.status}`;
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return json(502, { error: `Backend not reachable or endpoint missing. ${lastErr || ""}`, sw: VERSION });
}

// ---------- router ----------
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only same-origin within our scope
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.includes("/detector/")) return;

  // PDF stub
  if (url.pathname.includes("/detector/api/report_pdf")) {
    event.respondWith(handlePdfDirect());
    return;
  }

  // GAIA explicit route
  if (/\/detector(?:\/detector)*\/api\/gaia_neighbors$/.test(url.pathname)) {
    event.respondWith(handleGaiaNeighbors(event.request));
    return;
  }

  // Generic /detector/api/*
  if (url.pathname.includes("/detector/api/")) {
    event.respondWith(proxyGeneric(event.request));
    return;
  }
});

console.log(`OramaX SW proxy ready (${VERSION})`);
