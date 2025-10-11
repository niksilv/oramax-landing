/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        source: "/detector/api/:path*",
        destination: "https://api.oramax.space/exoplanet/:path*",
      },
    ];
  },
};
export default nextConfig;
