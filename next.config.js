/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/detector', destination: '/detector/index.html' }];
  },
};
module.exports = nextConfig;
