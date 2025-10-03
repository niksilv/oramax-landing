// OramaX SW proxy v51 — Gaia GET-first + POST fallback, CORS-safe
const VERSION = 'v52';
const BACKENDS = [
  self.API_BASE || 'https://oramax-exoplanet-api.fly.dev/exoplanet',
  'https://oramax-exoplanet-api.fly.dev/exoplanet',
  'http://127.0.0.1:8000/exoplanet'
];

self.addEventListener('install', (evt) => {
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

// --------- Helpers ---------
function join(base, path) {
  if (!base.endsWith('/')) base += '/';
  return base + path.replace(/^\//, '');
}
function normalizeNeighbors(nei, defaultRadius) {
  if (!nei) return { available: false, reason: 'n/a', radius_arcsec: defaultRadius };
  if (typeof nei.available === 'boolean') {
    if (!('radius_arcsec' in nei)) nei.radius_arcsec = defaultRadius;
    return nei;
  }
  if (Array.isArray(nei)) return { available: true, radius_arcsec: defaultRadius, items: nei };
  const items = nei.items || nei.sources || nei.data || [];
  return { available: Array.isArray(items) && items.length > 0, radius_arcsec: (nei.radius_arcsec || defaultRadius), items };
}
function jsonError(status, msg) {
  return new Response(JSON.stringify({ error: msg, sw: VERSION }), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `err-${VERSION}` }
  });
}

// --------- PDF (always client-side) ---------
async function handlePdfDirect(req) {
  try {
    const pdfBytes = new TextEncoder().encode('%PDF-1.4\n%…minimal…\n%%EOF');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Oramax_Vetting.pdf"',
        'X-Oramax-SW': `client-pdf-${VERSION}`
      }
    });
  } catch (e) {
    return jsonError(500, `SW PDF error: ${String(e)}`);
  }
}

// --------- GAIA neighbors (GET-first, POST-fallback) ---------
async function handleGaiaNeighbors(req) {
  const url0 = new URL(req.url);
  const url = new URL(url0.href.replace(/\/detector\/(?:detector\/)+/g, '/detector/'));
  const targetName = url.searchParams.get('target') || url.searchParams.get('tic') || '';
  const radius = Number(url.searchParams.get('radius') || '60') || 60;

  const body = JSON.stringify({
    source: 'mast_spoc', mission: 'TESS', target: targetName,
    kpeaks: 0, detrend: 'none', quality: false, remove_outliers: false,
    neighbors: true, neighbors_radius: radius, centroid: false
  });
  const initPost = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };

  // 2 προσπάθειες POST (με μικρή καθυστέρηση μετά την 1η)
  let last = null;
  for (let attempt=0; attempt<2; attempt++){
    for (const base of BACKENDS) {
      try {
        const r = await fetch(join(base, 'fetch_detect'), initPost);
        if (!r.ok) { last = `HTTP ${r.status}`; continue; }
        const j = await r.json();
        const nei = normalizeNeighbors(j.neighbors || j, radius);
        // αν δεν είναι το γνωστό IO error -> επέστρεψε
        if (!(nei && nei.available === false && /I\/O operation on closed file/i.test(nei.reason||''))) {
          return new Response(JSON.stringify(nei), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `gaia-fd-${VERSION}` }
          });
        }
        last = 'io-closed';
      } catch (e) { last = e?.message || String(e); }
    }
    // μικρό sleep πριν retry
    await new Promise(r=>setTimeout(r, 180));
  }

  return new Response(JSON.stringify({
    available: false,
    reason: (last==='io-closed') ? 'backend IO error (retry exhausted)' : (last || 'unknown'),
    radius_arcsec: radius
  }), { status: 200, headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `gaia-retry-fail-${VERSION}` } });
}

// --------- Generic proxy (/detector/api/*) ---------
async function proxyGeneric(req) {
  const url0 = new URL(req.url);
  // normalise /detector/detector/api → /detector/api
  const url = new URL(url0.href.replace(/\/detector\/(?:detector\/)+/g, '/detector/'));
  const rest = url.pathname.replace(/^\/detector\/api\//, '');
  const init = {
    method: req.method,
    headers: new Headers(req.headers),
    redirect: 'follow'
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.clone().arrayBuffer();
  }

  let lastErr = null;
  for (const base of BACKENDS) {
    try {
      const r = await fetch(join(base, rest) + url.search, init);
      if (r.status !== 404 && r.status !== 405) return r;
      lastErr = `HTTP ${r.status}`;
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return jsonError(502, `Backend not reachable or endpoint missing. ${lastErr || ''}`);
}

// --------- Router ---------
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // μόνο same-origin & scope /detector/
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.includes('/detector/')) return;

  // PDF
  if (url.pathname.includes('/detector/api/report_pdf')) {
    event.respondWith(handlePdfDirect(event.request));
    return;
  }

  // GAIA (πιάσε κάθε παραλλαγή /api/gaia_neighbors)
  if (/\/detector(?:\/detector)*\/api\/gaia_neighbors$/.test(url.pathname)) {
    event.respondWith(handleGaiaNeighbors(event.request));
    return;
  }

  // Generic /detector/api/*
  if (url.pathname.includes('/detector/api/')) {
    event.respondWith(proxyGeneric(event.request));
    return;
  }
});

console.log(`OramaX SW proxy ready (${VERSION})`);
