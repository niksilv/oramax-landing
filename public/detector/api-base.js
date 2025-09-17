/* Auto API base selection for OramaX detector.
   - Local (localhost/127.0.0.1): http://localhost:8000/exoplanet
   - Production: via Vercel proxy /detector/api/exoplanet -> Fly.io
*/
(() => {
  try {
    const qs = new URLSearchParams(location.search);
    const apiOverride = qs.get('api');

    const host = location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    const API_BASE = apiOverride
      ? apiOverride.replace(/\/$/, '')
      : (isLocal
          ? 'http://localhost:8000/exoplanet'
          : '/detector/api/exoplanet');

    // Expose
    window.API_BASE = API_BASE;
    console.log('[OramaX] API_BASE =', API_BASE);
  } catch (e) {
    console.error('[OramaX] Failed to set API_BASE', e);
  }
})();
