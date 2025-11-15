// Robust backend proxy for POST/GET/PUT/DELETE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND =
  process.env.EXOPLANET_API_BASE ||
  'https://oramax-exoplanet-api.fly.dev/exoplanet';

const HOP = new Set([
  'connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailer','transfer-encoding','upgrade','host','content-length'
]);

function mapUrl(inUrl) {
  const u = new URL(inUrl);
  const slug = u.pathname.replace(/^\/detector\/api\/?/, ''); // strip prefix
  const out = new URL(`${BACKEND}/${slug}`);
  out.search = u.search;
  return out.toString();
}

function filterHeaders(h) {
  const out = new Headers(h);
  for (const k of HOP) out.delete(k);
  // Εξασφάλισε JSON αν είναι JSON
  return out;
}

async function handler(req) {
  try {
    const url = mapUrl(req.url);
    const method = req.method;
    const headers = filterHeaders(req.headers);

    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      const ct = headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        // διάβασε ως text για να μη χαθεί το stream
        body = await req.text();
        headers.set('content-type','application/json');
      } else {
        const ab = await req.arrayBuffer().catch(() => null);
        if (ab && ab.byteLength) body = ab;
      }
    }

    const resp = await fetch(url, {
      method, headers, body,
      redirect: 'manual',
      // Node18: δεν χρειάζεται duplex όταν περνάμε string/buffer
    });

    const outH = new Headers(resp.headers);
    for (const k of HOP) outH.delete(k);

    return new Response(resp.body, { status: resp.status, headers: outH });
  } catch (e) {
    const msg = e?.message || String(e);
    return new Response(JSON.stringify({ ok:false, detail:`proxy error: ${msg}` }), {
      status: 502,
      headers: { 'content-type':'application/json' }
    });
  }
}

export async function GET(req)    { return handler(req); }
export async function POST(req)   { return handler(req); }
export async function PUT(req)    { return handler(req); }
export async function DELETE(req) { return handler(req); }
