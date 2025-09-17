// OramaX SW proxy v42 — PDF always client-side, Gaia robust fallbacks
const VERSION = 'v42';
const BACKENDS = [
  'http://127.0.0.1:8000/exoplanet', // new-style
  'http://127.0.0.1:8000'            // legacy root
];

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/detector/')) return;

  // 1) PDF: πάντα client-side (κόβουμε δρόμο)
  if (url.pathname === '/detector/api/report_pdf') {
    event.respondWith(handlePdfDirect(event.request));
    return;
  }

  // 2) Gaia neighbors με fallbacks
  if (url.pathname === '/detector/api/gaia_neighbors') {
    event.respondWith(handleGaiaNeighbors(event.request));
    return;
  }

  // 3) Άλλα /detector/api/* → απλό proxy με fallbacks
  if (url.pathname.startsWith('/detector/api/')) {
    event.respondWith(proxyGeneric(event.request));
  }
});

// ---------- PDF (always client-side) ----------
async function handlePdfDirect(req){
  try{
    let savedBodyBuf = null, normalized = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      savedBodyBuf = await req.clone().arrayBuffer();
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try {
          const body = JSON.parse(new TextDecoder().decode(savedBodyBuf));
          normalized = normalizePdfPayload(body);
        } catch {}
      }
    }
    const pdfBytes = buildSimplePdfBytes(normalized || {});
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Oramax_Vetting.pdf"',
        'X-Oramax-SW': `client-pdf-${VERSION}`
      }
    });
  }catch(err){
    return jsonError(500, `SW PDF error: ${String(err)}`);
  }
}

// ---------- Gaia neighbors (robust) ----------
async function handleGaiaNeighbors(req){
  const url = new URL(req.url);
  const targetName = url.searchParams.get('target') || url.searchParams.get('tic') || '';
  const radius = parseFloat(url.searchParams.get('radius') || '60');

  // 1) POST /fetch_detect (neighbors only)
  const body = JSON.stringify({
    source: 'mast_spoc', mission: 'TESS', target: targetName,
    kpeaks: 0, detrend:'none', quality:false, remove_outliers:false, sigma:5,
    neighbors: true, neighbors_radius: Number.isFinite(radius) ? radius : 60
  });
  const initPost = { method:'POST', headers: {'Content-Type':'application/json'}, body, redirect:'follow' };
  const tries = [];
  for (const base of BACKENDS) tries.push(fetch(join(base, 'fetch_detect'), initPost).catch(e=>e));

  // 2) GET /exoplanet/gaia_neighbors?...
  for (const base of BACKENDS) tries.push(fetch(join(base, 'gaia_neighbors') + url.search, {redirect:'follow'}).catch(e=>e));

  // εκτέλεσε σειριακά με early success
  let last = null;
  for (const p of tries){
    try{
      const r = await p;
      if (r && r.ok) return r; // πέρασε ένας
      last = r;
    }catch(e){ last = e; }
  }
  const detail = (last && typeof last.text === 'function')
    ? await last.text().catch(()=>String(last)) : String(last);
  return jsonError(502, `Gaia neighbors failed on all backends. ${detail}`);
}

// ---------- Generic proxy for other /detector/api/* ----------
async function proxyGeneric(req){
  const url = new URL(req.url);
  const rest = url.pathname.replace(/^\/detector\/api\//,'');
  const candidates = [];
  for (const base of BACKENDS) candidates.push(join(base, rest) + url.search);

  const init = { method:req.method, headers:new Headers(req.headers), redirect:'follow' };
  if (req.method !== 'GET' && req.method !== 'HEAD') init.body = await req.clone().arrayBuffer();

  let last = null;
  for (const target of candidates) {
    try{
      const r = await fetch(target, init);
      if (r.status !== 404 && r.status !== 405) return r;
      last = r;
    }catch(e){ last = e; }
  }
  const detail = (last && typeof last.text === 'function')
    ? await last.text().catch(()=>String(last)) : String(last);
  return jsonError(502, `Backend not reachable or endpoint missing.\n${detail}`);
}

// ---------- Helpers ----------
function join(base, path){ if (!base.endsWith('/')) base += '/'; return base + path.replace(/^\//,''); }
function num(v){ const n=Number(v); return Number.isFinite(n)?n:null; }
function jsonError(status, msg){
  return new Response(JSON.stringify({ error: msg, detail: msg, sw: VERSION }), {
    status, headers: { 'Content-Type':'application/json', 'X-Oramax-SW': `err-${VERSION}` }
  });
}

// old → new schema for PDF
function normalizePdfPayload(body){
  const out = { target:'', preprocess:{}, candidates:[], neighbors:{available:false}, pfold:null, centroid:null };
  if (!body || typeof body !== 'object') return out;

  if (body.meta || body.candidate) {
    out.target = String(body?.meta?.target || body?.meta?.tic || '');
    out.preprocess = body?.preprocess || {};
    const c = body.candidate || {};
    out.candidates = [{
      period: num(c.period), duration: num(c.duration), depth: num(c.depth),
      power: num(c.power), p_planet: num(c.probability ?? c.p_planet ?? 0),
      snr: num(c?.fit?.snr), delta_bic: num(c?.fit?.delta_bic),
      odd_even_delta_ppm: num(c?.vetting?.odd_even_diff_ppm) ?? 0,
      secondary: !!(c?.vetting?.has_secondary_like),
      centroid_ok: (c?.centroid?.available===true) ? !c?.centroid?.suspect_beb : null,
      t0: num(c.t0)
    }];
    out.neighbors = body?.neighbors || { available:false };
    return out;
  }

  out.target = String(body.target || '');
  out.preprocess = body.preprocess || {};
  out.candidates = Array.isArray(body.candidates) ? body.candidates : [];
  out.neighbors = body.neighbors || { available:false };
  out.pfold = body.pfold || null;
  out.centroid = body.centroid || null;
  return out;
}

// Tiny PDF (text only) — always valid
function buildSimplePdfBytes(data){
  const title = `OramaX · Vetting Report (${VERSION})`;
  const target = (data?.target || 'target').toString();
  const lines = [];

  lines.push(`Target: ${target}`);
  const cands = Array.isArray(data?.candidates) ? data.candidates : [];
  if (!cands.length) {
    lines.push(`No candidates provided.`);
  } else {
    lines.push(`Candidates: ${cands.length}`);
    cands.slice(0,12).forEach((c,i)=>{
      const p  = isFinite(c.period)   ? c.period.toFixed(6)   : '';
      const du = isFinite(c.duration) ? c.duration.toFixed(6) : '';
      const d  = isFinite(c.depth)    ? c.depth.toExponential(2) : '';
      const pow= isFinite(c.power)    ? c.power.toFixed(3)    : '';
      const pp = isFinite(c.p_planet) ? c.p_planet.toFixed(3) : '';
      lines.push(`#${i+1}  P=${p} d  dur=${du} d  depth=${d}  power=${pow}  Pp=${pp}`);
    });
  }
  return makePdf({ title, lines });
}

function makePdf({ title, lines }) {
  const esc = s => (s||'').toString().replace(/([()\\])/g, '\\$1');
  const header = '%PDF-1.4\n';
  let y = 760;
  let stream = 'BT\n/F1 18 Tf\n72 ' + y + ' Td\n(' + esc(title) + ') Tj\n';
  y -= 24;
  stream += '/F1 12 Tf\n72 ' + y + ' Td\n';
  lines.forEach((ln, idx) => { if (idx>0) stream += '0 -16 Td\n'; stream += '(' + esc(ln) + ') Tj\n'; });
  stream += 'ET';
  const cont = `4 0 obj << /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const font = '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n';
  const page = '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n';
  const pages = '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n';
  const catalog = '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n';

  let pdf = header;
  const offsets = [0];
  function add(part){ offsets.push(pdf.length); pdf += part; }
  add(catalog); add(pages); add(page); add(cont); add(font);

  const xrefStart = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n`;
  for (let i=1;i<=5;i++){
    const off = offsets[i].toString().padStart(10, '0');
    pdf += `${off} 00000 n \n`;
  }
  pdf += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

console.log(`OramaX SW proxy ready (${VERSION})`);
