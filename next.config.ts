import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vbnnjwgfbadvqavqnlhh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
