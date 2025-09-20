import type { NextApiRequest, NextApiResponse } from 'next';

const TARGET: string | undefined = process.env.TARGET; // e.g. https://oramax-exoplanet.fly.dev/exoplanet

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TARGET) {
    res.status(500).json({ error: 'TARGET env var is not set' });
    return;
  }

  const raw = req.query.path;
  const parts: string[] = Array.isArray(raw) ? raw.map(String) : (typeof raw === 'string' ? [raw] : []);
  const tail = parts.join('/');

  const qs = (typeof req.url === 'string' && req.url.includes('?')) ? `?${req.url.split('?')[1]}` : '';
  const url = `${TARGET.replace(/\/+$/, '')}/${tail}${qs}`;

  const headers: Record<string, string> = {};
  const ct = req.headers['content-type']; const ac = req.headers['accept'];
  if (typeof ct === 'string') headers['content-type'] = ct;
  if (typeof ac === 'string') headers['accept'] = ac;

  const init: RequestInit = { method: req.method, headers };

  if (req.method && ['POST','PUT','PATCH'].includes(req.method)) {
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    (init as { body?: string }).body = bodyStr;
    if (!headers['content-type']) headers['content-type'] = 'application/json';
  }

  try {
    const up = await fetch(url, init);
    res.status(up.status);
    up.headers.forEach((v,k) => { if (k.toLowerCase() !== 'transfer-encoding') res.setHeader(k, v); });

    const respCT = up.headers.get('content-type') || '';
    if (respCT.includes('application/json')) {
      const j = await up.json();
      res.json(j);
    } else {
      const buf = Buffer.from(await up.arrayBuffer());
      res.send(buf);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: 'Proxy failed', detail: msg });
  }
}
