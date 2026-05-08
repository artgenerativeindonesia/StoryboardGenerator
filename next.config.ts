import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.higgsfield.ai',
      },
      {
        protocol: 'https',
        hostname: '*.kie.ai',
      },
      {
        protocol: 'https',
        hostname: '*.wavespeed.ai',
      },
    ],
  },
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
