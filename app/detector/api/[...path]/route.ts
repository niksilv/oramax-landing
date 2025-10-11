// app/detector/api/[...path]/route.ts
import type { NextRequest } from 'next/server';

const UPSTREAM = process.env.ORAMAX_API_BASE ?? 'https://api.oramax.space/exoplanet';

function join(a: string, b: string) {
  return a.replace(/\/+$/, '') + '/' + b.replace(/^\/+/, '');
}
function stripSearch(url: URL) {
  const u = new URL(url);
  // προαιρετικά αφαίρεσε εσωτερικά flags
  u.searchParams.delete('__backend');
  return u;
}

async function forward(request: NextRequest, path: string[]) {
  const url = stripSearch(new URL(request.url));
  const qs  = url.search ? url.search : '';
  const upstream = join(UPSTREAM, path.join('/')) + qs;

  const init: RequestInit = {
    method: request.method,
    headers: new Headers(request.headers),
    redirect: 'follow',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }
  // καθάρισε headers που χαλάνε CORS upstream
  init.headers.delete('origin');
  init.headers.delete('referer');

  const r = await fetch(upstream, init);
  // περνάμε πίσω ατόφιο σώμα & status
  const body = await r.arrayBuffer();
  const out = new Response(body, {
    status: r.status,
    headers: new Headers(r.headers),
  });
  return out;
}

export async function GET(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return forward(req, ctx.params.path ?? []);
}
export async function POST(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return forward(req, ctx.params.path ?? []);
}
export async function OPTIONS(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return forward(req, ctx.params.path ?? []);
}
