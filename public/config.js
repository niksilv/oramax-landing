(function () {
  const isLocal = ['localhost','127.0.0.1'].includes(location.hostname);
  window.API_BASE = isLocal
    ? 'http://localhost:8000'                            // ΧΩΡΙΣ /exoplanet
    : 'https://oramax-exoplanet-api.fly.dev/exoplanet';
})();
