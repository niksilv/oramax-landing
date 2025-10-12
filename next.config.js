/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async rewrites() {
    const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const upstreamEnv = process.env.UPSTREAM_BASE;
    // Ασφάλεια: σε production ΔΕΝ επιτρέπουμε fallback σε localhost
    const upstream = (isProd
      ? (upstreamEnv || (() => { throw new Error('Missing UPSTREAM_BASE in production'); })())
      : (upstreamEnv || 'http://localhost:8000/exoplanet')
    );

    return [
      // Static detector
      { source: '/detector',  destination: '/detector/index.html' },
      { source: '/detector/', destination: '/detector/index.html' },

      // Proxy του detector API προς το backend
      { source: '/detector/api/:path*', destination: `${upstream}/:path*` },

      // Προαιρετικό unified proxy (αν το χρειαστείς)
      { source: '/api/exo/:path*', destination: `${upstream}/:path*` },
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
