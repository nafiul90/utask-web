import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '154.26.131.31' },
      { protocol: 'https', hostname: '154.26.131.31' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'http', hostname: 'example.com' }
    ]
  }
};

export default nextConfig;
