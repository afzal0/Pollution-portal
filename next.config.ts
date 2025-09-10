import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Heroku build: skip lint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
