/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/detector',  destination: '/detector/index.html' },
      { source: '/detector/', destination: '/detector/index.html' },
      { source: '/detector/api/:path*', destination: 'http://localhost:8000/exoplanet/:path*' },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }]}];
  },
};
module.exports = nextConfig;
