import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png')],
  },
};

export default nextConfig;
