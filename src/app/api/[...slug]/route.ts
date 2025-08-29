import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function joinUrl(origin: string, prefix: string, parts: string[], search: string) {
  const pfx = (prefix || '').replace(/\/$/, '');
  const path = parts.join('/');
  const qs = search ? `?${search}` : '';
  return pfx ? `${origin}${pfx}/${path}${qs}` : `${origin}/${path}${qs}`;
}

function forwardHeaders(req: NextRequest, includeContentType = false): HeadersInit {
  const headers = new Headers();
  req.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (['host','connection','content-length'].includes(key)) return;
    headers.set(k, v);
  });
  if (includeContentType && !headers.has('content-type')) headers.set('content-type', 'application/json');
  return headers;
}

async function proxy(method: string, req: NextRequest, params: { slug?: string[] }) {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN || 'https://api.oramax.space';
  const prefix = (process.env.NEXT_PUBLIC_API_PREFIX || '/exoplanet').replace(/\/$/, '');
  const slug = params.slug || [];
  const dest = joinUrl(origin, prefix, slug, req.nextUrl.searchParams.toString());

  const init: RequestInit = { method, headers: forwardHeaders(req, method !== 'GET' && method !== 'HEAD') };
  if (method !== 'GET' && method !== 'HEAD') init.body = await req.arrayBuffer();

  const res = await fetch(dest, init);
  const body = await res.arrayBuffer();
  const out = new NextResponse(body, { status: res.status });
  res.headers.forEach((v, k) => {
    if (!['content-length','transfer-encoding'].includes(k.toLowerCase())) out.headers.set(k, v);
  });
  return out;
}

export async function GET(req: NextRequest, ctx: any)    { return proxy('GET', req, ctx.params); }
export async function POST(req: NextRequest, ctx: any)   { return proxy('POST', req, ctx.params); }
export async function PUT(req: NextRequest, ctx: any)    { return proxy('PUT', req, ctx.params); }
export async function PATCH(req: NextRequest, ctx: any)  { return proxy('PATCH', req, ctx.params); }
export async function DELETE(req: NextRequest, ctx: any) { return proxy('DELETE', req, ctx.params); }
export async function OPTIONS(req: NextRequest, ctx: any){ return proxy('OPTIONS', req, ctx.params); }
export async function HEAD(req: NextRequest, ctx: any)   { return proxy('HEAD', req, ctx.params); }
