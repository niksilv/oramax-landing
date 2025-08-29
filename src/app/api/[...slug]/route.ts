// eslint-disable @typescript-eslint/no-explicit-any
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.oramax.space/exoplanet";

function buildTargetUrl(req: NextRequest, slug: string[]) {
  const upstream = new URL(API_BASE.replace(/\/$/, "") + "/" + (slug || []).join("/"));
  // Copy query params
  req.nextUrl.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));
  return upstream.toString();
}

async function passThrough(up: Response) {
  const headers = new Headers();
  const ct = up.headers.get("content-type") || "application/octet-stream";
  headers.set("content-type", ct);
  // Allow CORS for safety (site-only; adjust if needed)
  headers.set("access-control-allow-origin", "*");
  // Avoid caching during dev
  headers.set("cache-control", "no-store");
  return new NextResponse(up.body, { status: up.status, headers });
}

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const target = buildTargetUrl(req, params.slug || []);
  const up = await fetch(target, {
    method: "GET",
    // Important for PDF and binary
    headers: { accept: req.headers.get("accept") || "*/*" },
    cache: "no-store",
  });
  return passThrough(up);
}

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const target = buildTargetUrl(req, params.slug || []);
  const ct = req.headers.get("content-type") || "application/json";
  let body: any;
  if (ct.includes("application/json")) {
    body = JSON.stringify(await req.json());
  } else {
    // text/plain or CSV uploads
    body = await req.text();
  }
  const up = await fetch(target, {
    method: "POST",
    headers: { "content-type": ct, accept: req.headers.get("accept") || "*/*" },
    body,
    cache: "no-store",
  });
  return passThrough(up);
}
