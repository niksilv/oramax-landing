/** @type {import('next').NextConfig} */
const nextConfig = {
  // Κάνε πιο χαλαρό το build αν χρειαστεί
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async rewrites() {
    const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    // Upstream base: βάλε το στο Vercel env (π.χ. https://oramax-exoplanet-api.fly.dev/exoplanet)
    const upstream = process.env.UPSTREAM_BASE || 'http://localhost:8000/exoplanet';

    return [
      // Σερβίρεις το static detector
      { source: '/detector', destination: '/detector/index.html' },
      { source: '/detector/', destination: '/detector/index.html' },

      // Proxy των API κλήσεων του detector προς το upstream
      // Σε prod ΔΕΝ δείχνουμε ποτέ σε localhost
      { source: '/detector/api/:path*', destination: `${upstream}/:path*` },

      // ΝΕΟ: unified proxy για το νέο front-end base που είπαμε (/api/exo/*)
      { source: '/api/exo/:path*', destination: `${upstream}/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
