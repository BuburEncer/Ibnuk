import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Body limit default 1MB; admin image upload cap is 2MB + multipart overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
