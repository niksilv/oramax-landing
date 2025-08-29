import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SlugParams = { slug: string[] };

function joinUrl(origin: string, prefix: string, parts: string[], search: string) {
  const pfx = (prefix || "").replace(/\/$/, "");
  const path = parts.join("/");
  const qs = search ? `?${search}` : "";
  return pfx ? `${origin}${pfx}/${path}${qs}` : `${origin}/${path}${qs}`;
}

function forwardHeaders(req: NextRequest, includeContentType = false): HeadersInit {
  const headers = new Headers();
  req.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (["host", "connection", "content-length"].includes(key)) return;
    headers.set(k, v);
  });
  if (includeContentType && !headers.has("content-type")) headers.set("content-type", "application/json");
  return headers;
}

async function proxy(method: string, req: NextRequest, slug: string[]) {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN || "https://api.oramax.space";
  const prefix = (process.env.NEXT_PUBLIC_API_PREFIX || "/exoplanet").replace(/\/$/, "");
  const dest = joinUrl(origin, prefix, slug, req.nextUrl.searchParams.toString());

  const init: RequestInit = { method, headers: forwardHeaders(req, method !== "GET" && method !== "HEAD") };
  if (method !== "GET" && method !== "HEAD") {
    const buf = await req.arrayBuffer();
    init.body = buf;
  }

  const res = await fetch(dest, init);
  const body = await res.arrayBuffer();
  const out = new NextResponse(body, { status: res.status });
  res.headers.forEach((v, k) => {
    if (!["content-length", "transfer-encoding"].includes(k.toLowerCase())) out.headers.set(k, v);
  });
  return out;
}

// In Next.js 15, context.params is a Promise
export async function GET(req: NextRequest, ctx: { params: Promise<SlugParams> }) {
  const { slug } = await ctx.params;
  return proxy("GET", req, slug);
}
export async function POST(req: NextRequest, ctx: { params: Promise<SlugParams> }) {
  const { slug } = await ctx.params;
  return proxy("POST", req, slug);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<SlugParams> }) {
  const { slug } = await ctx.params;
  return proxy("PUT", req, slug);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<SlugParams> }) {
  const { slug } = await ctx.params;
  return proxy("PATCH", req, slug);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<SlugParams> }) {
  const { slug } = await ctx.params;
  return proxy("DELETE", req, slug);
}
export async function OPTIONS(req: NextRequest, ctx: { params: Promise<SlugParams> }) {
  const { slug } = await ctx.params;
  return proxy("OPTIONS", req, slug);
}
export async function HEAD(req: NextRequest, ctx: { params: Promise<SlugParams> }) {
  const { slug } = await ctx.params;
  return proxy("HEAD", req, slug);
}