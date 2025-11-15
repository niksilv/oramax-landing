// public/detector/detector-worker.js

// Υπολογίζουμε το API_BASE όπως και στο index:
// - local dev -> http://localhost:8000/exoplanet
// - production -> /detector/api  (same-origin, χωρίς CORS)
const IS_LOCAL =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1';

const API_BASE = IS_LOCAL
  ? 'http://localhost:8000/exoplanet'
  : '/detector/api';

// Helper για safe JSON
async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON from backend');
  }
}

self.addEventListener('message', async (event) => {
  const { id, type, payload } = event.data || {};
  if (!id || !type) return;

  try {
    let result;

    // 1) Κύριο fetch_detect (Live Fetch & Detect)
    if (type === 'fetch_detect') {
      const body = payload?.body || {};
      const res = await fetch(`${API_BASE}/fetch_detect?__backend=api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      result = await safeJson(res);
    }

    // 2) TXT/CSV upload (αν θέλεις να το περάσουμε κι αυτό στον worker)
    else if (type === 'fetch_txt') {
      const { text, engine, kpeaks } = payload || {};
      const res = await fetch(`${API_BASE}/fetch_detect?__backend=api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: engine || 'bls',
          kpeaks: kpeaks ?? 3,
          text,
          neighbors: false,
          source: 'upload',
          target: 'TIC 00000000',
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      result = await safeJson(res);
    }

    // 3) Gaia neighbors (αν το χρειαστείς από τον worker)
    else if (type === 'gaia_neighbors') {
      const { target, radius } = payload || {};
      const url = new URL('/detector/api/gaia_neighbors', self.location.origin);
      url.search = new URLSearchParams({
        target: target || '',
        radius: String(radius ?? 60),
      }).toString();

      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      result = await safeJson(res);
    }

    else {
      throw new Error(`Unknown worker type: ${type}`);
    }

    self.postMessage({ id, ok: true, result });
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: err?.message || String(err),
    });
  }
});
