/** @type {import('next').NextConfig} */
const nextConfig = {
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
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
}

export default nextConfig
