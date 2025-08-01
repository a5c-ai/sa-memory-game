import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/sa-memory-game/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/sa-memory-game' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
