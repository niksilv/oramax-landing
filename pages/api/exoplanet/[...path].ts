import type { NextApiRequest, NextApiResponse } from 'next';

const TARGET: string | undefined = process.env.ORAMAX_API_BASE; // π.χ. https://api.oramax.space/exoplanet

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TARGET) {
    res.status(500).json({ error: 'ORAMAX_API_BASE is not set' });
    return;
  }

  const raw = req.query.path;
  const parts = Array.isArray(raw) ? raw : (raw ? [String(raw)] : []);
  const tail = parts.filter(Boolean).join('/');

  const url = `${TARGET.replace(/\/+$/, '')}/${tail}`;

  const headers: Record<string, string> = {};
  const contentType = req.headers['content-type'];
  const accept = req.headers['accept'];
  if (typeof contentType === 'string') headers['content-type'] = contentType;
  if (typeof accept === 'string') headers['accept'] = accept;

  const init: RequestInit = {
    method: req.method,
    headers
  };

  if (req.method && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    (init as RequestInit & { body?: string }).body = bodyStr;
  }

  try {
    const upstream = await fetch(url, init);
    const upstreamCT = upstream.headers.get('content-type') || 'application/octet-stream';
    const arrayBuf = await upstream.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    res.status(upstream.status);
    res.setHeader('content-type', upstreamCT);
    res.send(buf);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: 'Proxy failed', detail: message });
  }
}
