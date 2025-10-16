// OramaX SW proxy v61 — Gaia GET-first + smart POST fallback (TIC/KIC/EPIC), CORS-safe
const VERSION = 'v61';

const BACKENDS = [
  'https://oramax-exoplanet-api.fly.dev/exoplanet', // κύριο upstream
  'http://127.0.0.1:8000/exoplanet'                 // τοπικό fallback (dev)
];

// --- Helpers ---
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
  if (Array.isArray(nei)) return { available: nei.length > 0, radius_arcsec: defaultRadius, items: nei };
  const items = nei.items || nei.sources || nei.data || [];
  return { available: Array.isArray(items) && items.length > 0, radius_arcsec: (nei.radius_arcsec || defaultRadius), items };
}
function jsonError(status, msg) {
  return new Response(JSON.stringify({ error: msg, sw: VERSION }), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `err-${VERSION}` }
  });
}

// --- PDF (always client-side) ---
async function handlePdfDirect() {
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

// --- GAIA neighbors (GET-first, smart POST-fallback) ---
async function handleGaiaNeighbors(req) {
  // κανονικοποίηση μονοπατιού (/detector/detector/api → /detector/api)
  const url0 = new URL(req.url);
  const url = new URL(url0.href.replace(/\/detector\/(?:detector\/)+/g, '/detector/'));
  const targetName = url.searchParams.get('target') || url.searchParams.get('tic') || '';
  const radius = Number(url.searchParams.get('radius') || '60') || 60;

  // 1) GET /gaia_neighbors σε κάθε backend
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
    } catch { /* δοκίμασε επόμενο backend */ }
  }

  // 2) Fallback: POST /fetch_detect (neighbors only) — υποστήριξη TIC/KIC/EPIC
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
    } catch { /* επόμενο */ }
  }

  return new Response(JSON.stringify({
    available: false, reason: 'Gaia neighbors failed on all backends.', radius_arcsec: radius
  }), { status: 502, headers: { 'Content-Type': 'application/json', 'X-Oramax-SW': `gaia-fail-${VERSION}` } });
}

// --- Generic proxy για /detector/api/* ---
async function proxyGeneric(req) {
  // κανονικοποίηση /detector/detector/api -> /detector/api
  const url0 = new URL(req.url);
  const url  = new URL(url0.href.replace(/\/detector\/(?:detector\/)+/g, '/detector/'));

  // path μετά το /detector/api/
  const rest = url.pathname.replace(/^\/detector\/api\//, '');
  const query = url.searchParams.toString();

  const init = {
    method: req.method,
    headers: new Headers(req.headers),
    redirect: 'follow'
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.clone().arrayBuffer();
  }
  // καθάρισε headers που προκαλούν CORS upstream
  init.headers.delete('Origin');
  init.headers.delete('Referer');

  let lastErr = null;
  for (const base of BACKENDS) {
    try {
      const r = await fetch(join(base, rest) + (query ? '?' + query : ''), init);
      if (r.status !== 404 && r.status !== 405) return r; // δέξου το πρώτο «ουσιαστικό» response
      lastErr = `HTTP ${r.status}`;
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return jsonError(502, `Backend not reachable or endpoint missing. ${lastErr || ''}`);
}

// --- Router (single fetch listener) ---
self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

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

  // GAIA (κάθε παραλλαγή /api/gaia_neighbors)
  if (/\/detector(?:\/detector)*\/api\/gaia_neighbors$/.test(url.pathname)) {
    event.respondWith(handleGaiaNeighbors(event.request));
    return;
  }

  // Generic /detector/api/*
  if (url.pathname.startsWith('/detector/api/')) {
    event.respondWith(proxyGeneric(event.request));
    return;
  }
});

console.log(`OramaX SW proxy ready (${VERSION})`);
