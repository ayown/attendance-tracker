import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@attendance-tracker/shared-types',
    '@attendance-tracker/config',
    '@attendance-tracker/utils',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
