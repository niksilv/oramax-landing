import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.oramax.space/exoplanet";

/** Extracts slug parts from the incoming /api/* pathname without relying on typed context */
function extractSlug(req: NextRequest): string[] {
  const pathname = req.nextUrl.pathname; // e.g. /api/fetch_detect
  const rest = pathname.replace(/^\/api\/?/, ""); // fetch_detect
  if (!rest) return [];
  return rest.split("/").map(decodeURIComponent).filter(Boolean);
}

function buildTargetUrl(req: NextRequest, slug: string[]) {
  const upstream = new URL(API_BASE.replace(/\/$/, "") + "/" + (slug || []).join("/"));
  // Copy query params
  req.nextUrl.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));
  return upstream.toString();
}

async function passThrough(up: Response) {
  const headers = new Headers();
  const ct = up.headers.get("content-type") || "application/octet-stream";
  const cd = up.headers.get("content-disposition");
  headers.set("content-type", ct);
  if (cd) headers.set("content-disposition", cd);
  headers.set("access-control-allow-origin", "*");
  headers.set("cache-control", "no-store");
  return new NextResponse(up.body, { status: up.status, headers });
}

export async function GET(req: NextRequest) {
  const slug = extractSlug(req);
  const target = buildTargetUrl(req, slug);
  const up = await fetch(target, {
    method: "GET",
    headers: { accept: req.headers.get("accept") || "*/*" },
    cache: "no-store",
  });
  return passThrough(up);
}

export async function POST(req: NextRequest) {
  const slug = extractSlug(req);
  const target = buildTargetUrl(req, slug);
  const ct = req.headers.get("content-type") || "application/json";
  // We only expect JSON or text (CSV/TXT). Keep as text to preserve bodies simply.
  const bodyText = await req.text();
  const up = await fetch(target, {
    method: "POST",
    headers: { "content-type": ct, accept: req.headers.get("accept") || "*/*" },
    body: bodyText,
    cache: "no-store",
  });
  return passThrough(up);
}
