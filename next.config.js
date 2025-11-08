/** @type {import('next').NextConfig} */
const upstreamBaseRaw =
  process.env.UPSTREAM_BASE || 'https://oramax-exoplanet-api.fly.dev';

// καθαρισμός: βγάλε τελικά /, και αν τελειώνει ήδη σε /exoplanet, βγάλ' το
const base = upstreamBaseRaw.replace(/\/+$/, '');
const baseNoExoplanet = base.replace(/\/exoplanet$/, '');

// τελικό destination: ΠΑΝΤΑ ακριβώς ένα /exoplanet
const DEST = `${baseNoExoplanet}/exoplanet/:path*`;

const nextConfig = {
  async rewrites() {
    return [
      { source: '/detector/api/:path*', destination: DEST },
      { source: '/detector',  destination: '/detector/index.html' },
      { source: '/detector/', destination: '/detector/index.html' },
    ];
  },
  async headers() {
    return [
      {
        source: '/detector/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};
module.exports = nextConfig;
