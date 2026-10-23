import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
