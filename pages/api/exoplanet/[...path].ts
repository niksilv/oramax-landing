import type { NextApiRequest, NextApiResponse } from 'next';

const TARGET = process.env.ORAMAX_API_BASE; // π.χ. https://api.oramax.space/exoplanet

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TARGET) {
    res.status(500).json({ error: 'ORAMAX_API_BASE is not set' });
    return;
  }
  const tail = ((req.query.path as string[]) || []).join('/');
  const url = ${TARGET.replace(/\/+$/, '')}/;

  const init: RequestInit = {
    method: req.method,
    // προώθηση βασικών headers (όχι host/cookie)
    headers: {
      'content-type': (req.headers['content-type'] as string) || '',
      'accept': (req.headers['accept'] as string) || 'application/json'
    } as any,
    // σώμα μόνο για methods με body
    body: ['POST','PUT','PATCH'].includes(req.method || '') 
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
      : undefined,
  };

  try {
    const r = await fetch(url, init as any);
    const ct = r.headers.get('content-type') || 'application/octet-stream';
    const buf = Buffer.from(await r.arrayBuffer());
    res.status(r.status);
    res.setHeader('content-type', ct);
    res.send(buf);
  } catch (e: any) {
    res.status(502).json({ error: 'Proxy failed', detail: String(e?.message || e) });
  }
}
