import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize build for Fly.io
  // https://fly.io/docs/js/frameworks/nextjs/#standalone-builds-recommended
  output: "standalone",
  // Mantine tree shaking
  // https://mantine.dev/guides/next/#app-router-tree-shaking
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
