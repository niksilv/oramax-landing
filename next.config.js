/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async rewrites() {
    const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    // Προτεραιότητα: UPSTREAM_BASE → TARGET → ασφαλές default (prod) → localhost (dev)
    const PROD_DEFAULT = 'https://oramax-exoplanet-api.fly.dev/exoplanet';
    const upstream =
      process.env.UPSTREAM_BASE ||
      process.env.TARGET ||
      (isProd ? PROD_DEFAULT : 'http://localhost:8000/exoplanet');

    return [
      { source: '/detector',  destination: '/detector/index.html' },
      { source: '/detector/', destination: '/detector/index.html' },

      // Proxy τα πάντα προς το backend
      { source: '/detector/api/:path*', destination: `${upstream}/:path*` },

      // Προαιρετικό unified path
      { source: '/api/exo/:path*',      destination: `${upstream}/:path*` },
    ];
  },

  async headers() {
    return [{
      source: '/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    }];
  },
};

module.exports = nextConfig;
