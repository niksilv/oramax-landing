// next.config.ts
import type { NextConfig } from "next";

// Προωθούμε ΟΛΑ τα /api/* στο backend (origin + optional prefix)
const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "https://api.oramax.space";
const apiPrefix = (process.env.NEXT_PUBLIC_API_PREFIX || "/exoplanet").replace(/\/$/, "");

function joinDest(...parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p.replace(/\/$/, "") : p.replace(/^\//, "")))
    .join("/");
}

const nextConfig: NextConfig = {
  // ΠΡΟΣΟΧΗ: ΔΕΝ βάζουμε output:'export' γιατί σκοτώνει τα API routes.
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: joinDest(apiOrigin, apiPrefix, ":path*") },
      // back-compat αν το UI χτυπάει «γυμνά» αυτά (viewer/demo)
      { source: "/predict",      destination: joinDest(apiOrigin, apiPrefix, "predict") },
      { source: "/predict-file", destination: joinDest(apiOrigin, apiPrefix, "predict-file") },
      // expose health όπως είναι
      { source: "/exoplanet/:path*", destination: joinDest(apiOrigin, "exoplanet", ":path*") },
    ];
  },
};

export default nextConfig;
