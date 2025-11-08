/** @type {import('next').NextConfig} */
const path = require('path');

// Εγγύηση ότι ο upstream ΠΑΝΤΑ τελειώνει σε /exoplanet
function getUpstream() {
  const raw = process.env.UPSTREAM_BASE || 'https://oramax-exoplanet-api.fly.dev/exoplanet';
  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.endsWith('/exoplanet') ? trimmed : `${trimmed}/exoplanet`;
}

module.exports = {
  reactStrictMode: true,
  output: 'standalone',

  async rewrites() {
    const upstream = getUpstream();
    return [
      { source: '/detector/api/:path*', destination: `${upstream}/:path*` },
      { source: '/api/:path*',         destination: `${upstream}/:path*` },
      { source: '/detector',           destination: '/detector/index.html' },
      { source: '/detector/',          destination: '/detector/index.html' },
    ];
  },

  async headers() {
    const noStore = [
      { key: 'Cache-Control', value: 'no-store' },
      { key: 'Pragma',        value: 'no-cache' },
      { key: 'Expires',       value: '0' },
    ];
    return [
      { source: '/detector/api/:path*', headers: noStore },
      { source: '/api/:path*',          headers: noStore },
    ];
  },

  webpack: (cfg) => {
    cfg.resolve.alias['/'] = path.resolve(__dirname);
    return cfg;
  },
};
