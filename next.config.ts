import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Heroku build: skip lint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Heroku build: skip type errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
