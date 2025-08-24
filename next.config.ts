import type { NextConfig } from "next";
const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://127.0.0.1:8000";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/exoplanet/:path*", destination: `${apiOrigin}/exoplanet/:path*` }
    ];
  },
};
export default nextConfig;
