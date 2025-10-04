// OramaX SW proxy v52 — Gaia GET-first + smart POST fallback (TIC/KIC/EPIC), CORS-safe
const VERSION = 'v52';

const BACKENDS = [
  'https://oramax-app.fly.dev/exoplanet',           // production (πρώτο)
  'https://oramax-exoplanet-api.fly.dev/exoplanet', // εναλλακτικό
  'http://127.0.0.1:8000/exoplanet'                 // τοπικό dev
];

// --- take control immediately (single handlers) ---
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// --- βάλε αυτά κάπου ψηλά (globals) ---
const APP_BASE = 'https://oramax-app.fly.dev/exoplanet';              // TIC (SPOC/QLP) + NEI
const API_BASE = 'https://oramax-exoplanet-api.fly.dev/exoplanet';    // Kepler/K2

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// --- Ο ΚΥΡΙΟΣ ROUTER: πιάνει /detector/api/* ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // μόνο same-origin και μόνο /detector/api/*
  if (url.origin === self.location.origin && url.pathname.startsWith('/detector/api/')) {
    event.respondWith(proxyApi(event.request));
    return;
  }

  // (άλλα routes σου, αν έχεις, αφήσ’ τα όπως είναι)
});

async function proxyApi(request) {
  const inUrl = new URL(request.url);

  // βγάλε το /detector/api prefix → ώστε να γίνει π.χ. "/fetch_detect"
  const path = inUrl.pathname.replace('/detector/api', '');

  // διάβασε flag για επιλογή backend
  const forceApi = inUrl.searchParams.get('__backend') === 'api';
  inUrl.searchParams.delete('__backend');

  const upstreamBase = forceApi ? API_BASE : APP_BASE;
  const upstreamUrl =
    upstreamBase + path + (inUrl.search ? '?' + inUrl.searchParams.toString() : '');

  // κλώνος του request (ώστε να περάσουν headers/body)
  const init = {
    method: request.method,
    headers: new Headers(request.headers),
    // για GET δεν έχει body
    body: (request.method === 'GET') ? undefined : await request.clone().arrayBuffer()
  };

  // σημαντικό: αφαίρεσε τυχόν origin-only headers που μπλοκάρουν CORS στον upstream
  init.headers.delete('Origin');
  init.headers.delete('Referer');

  // κάνε το upstream fetch
  const resp = await fetch(upstreamUrl, init);

  // Επιστρέφουμε όπως είναι (ο SW είναι same-origin, άρα ο browser δεν θα κάνει CORS checks)
  return resp;
}

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

// --------- GAIA neighbors (GET-first, smart POST-fallback) ---------
async function handleGaiaNeighbors(req) {
  // normalise μονοπάτι (π.χ. /detector/detector/api → /detector/api)
  const url0 = new URL(req.url);
  const url = new URL(url0.href.replace(/\/detector\/(?:detector\/)+/g, '/detector/'));
  const targetName = url.searchParams.get('target') || url.searchParams.get('tic') || '';
  const radius = Number(url.searchParams.get('radius') || '60') || 60;

  // 1) Προσπάθησε GET /gaia_neighbors σε κάθε backend
  for (const base of BACKENDS) {
    try {
      const up = join(base, 'gaia_neighbors') + `?target=${encodeURIComponent(targetName)}&radius=${radius}`;
      const r = await fetch(up, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (r.ok) {
        const buf = await r.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `gaia-get-${VERSION}` }
        });
      }
    } catch { /* try next */ }
  }

  // 2) Fallback: POST /fetch_detect (neighbors only) με σωστή αποστολή (TIC/KIC/EPIC)
  const tgt = (targetName || '').trim().toUpperCase();
  const guess =
    tgt.startsWith('TIC')  ? { source:'mast_spoc', mission:'TESS' } :
    tgt.startsWith('KIC')  ? { source:'kepler',    mission:'Kepler' } :
    tgt.startsWith('EPIC') ? { source:'k2',        mission:'K2' } :
                             { source:'mast_spoc', mission:'TESS' };

  const body = JSON.stringify({
    source: guess.source, mission: guess.mission, target: targetName,
    kpeaks: 0, detrend: 'none', quality: false, remove_outliers: false,
    neighbors: true, neighbors_radius: radius, centroid: false
  });
  const initPost = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };

  for (const base of BACKENDS) {
    try {
      const r = await fetch(join(base, 'fetch_detect'), initPost);
      if (!r.ok) continue;
      const j = await r.json();
      const nei = normalizeNeighbors(j.neighbors || j, radius);
      return new Response(JSON.stringify(nei), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `gaia-fd-${VERSION}` }
      });
    } catch { /* try next */ }
  }

  return new Response(JSON.stringify({
    available: false, reason: 'Gaia neighbors failed on all backends.', radius_arcsec: radius
  }), { status: 502, headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `gaia-fail-${VERSION}` } });
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
