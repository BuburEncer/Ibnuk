import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Body limit default 1MB; admin media uploads are capped at 20MB (video) in app code.
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
