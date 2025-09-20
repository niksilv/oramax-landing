import type { NextApiRequest, NextApiResponse } from 'next';

const TARGET: string | undefined = process.env.TARGET; // e.g. https://api.oramax.space/exoplanet

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TARGET) {
    res.status(500).json({ error: 'TARGET env var is not set' });
    return;
  }

  // [...path] -> segments
  const raw = req.query.path;
  const segments: string[] =
    Array.isArray(raw) ? raw.map(String) : (typeof raw === 'string' ? [raw] : []);
  const tail = segments.join('/');

  // preserve querystring
  const query = (typeof req.url === 'string' && req.url.includes('?'))
    ? `?${req.url.split('?')[1]}`
    : '';

  const upstreamUrl = `${TARGET.replace(/\/+$/, '')}/${tail}${query}`;

  // forward safe headers
  const headers: Record<string, string> = {};
  const ct = req.headers['content-type'];
  const accept = req.headers['accept'];
  if (typeof ct === 'string') headers['content-type'] = ct;
  if (typeof accept === 'string') headers['accept'] = accept;

  // request init
  const init: RequestInit = { method: req.method, headers };

  // body for write methods
  if (req.method && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    (init as { body?: string }).body = bodyStr;
    if (!headers['content-type']) headers['content-type'] = 'application/json';
  }

  try {
    const upstream = await fetch(upstreamUrl, init);
    res.status(upstream.status);

    upstream.headers.forEach((v, k) => {
      if (k.toLowerCase() !== 'transfer-encoding') res.setHeader(k, v);
    });

    const respCT = upstream.headers.get('content-type') || '';
    if (respCT.includes('application/json')) {
      const j = await upstream.json();
      res.json(j);
    } else {
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.send(buf);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: 'Proxy failed', detail: message });
  }
}
