import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.oramax.space/exoplanet";

function buildTargetUrl(req: NextRequest, slug: string[]) {
  const upstream = new URL(API_BASE.replace(/\/$/, "") + "/" + (slug || []).join("/"));
  // copy query params
  req.nextUrl.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));
  return upstream.toString();
}

async function passThrough(up: Response) {
  const headers = new Headers();
  const ct = up.headers.get("content-type") || "application/octet-stream";
  headers.set("content-type", ct);
  headers.set("access-control-allow-origin", "*");
  headers.set("cache-control", "no-store");
  return new NextResponse(up.body, { status: up.status, headers });
}

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const target = buildTargetUrl(req, params.slug || []);
  const up = await fetch(target, {
    method: "GET",
    headers: { accept: req.headers.get("accept") || "*/*" },
    cache: "no-store",
  });
  return passThrough(up);
}

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const target = buildTargetUrl(req, params.slug || []);
  const ct = req.headers.get("content-type") || "application/json";
  let bodyText: string;

  if (ct.includes("application/json")) {
    const parsed: unknown = await req.json().catch(() => ({}));
    bodyText = JSON.stringify(parsed);
  } else {
    bodyText = await req.text();
  }

  const up = await fetch(target, {
    method: "POST",
    headers: { "content-type": ct, accept: req.headers.get("accept") || "*/*" },
    body: bodyText,
    cache: "no-store",
  });
  return passThrough(up);
}
