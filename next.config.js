/** @type {import('next').NextConfig} */
const upstream = (process.env.UPSTREAM_BASE || 'https://oramax-exoplanet-api.fly.dev')
  .replace(/\/+$/,'');

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      // σερβίρει το static UI
      { source: '/detector',  destination: '/detector/index.html' },
      { source: '/detector/', destination: '/detector/index.html' },

      // API proxy (same-origin  no CORS)
      { source: '/detector/api/:path*', destination: `${upstream}/exoplanet/:path*` },
      { source: '/api/:path*',          destination: `${upstream}/exoplanet/:path*` },
    ];
  },

  async headers() {
    return [
      { source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ]
      }
    ];
  },
};

module.exports = nextConfig;