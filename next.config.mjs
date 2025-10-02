/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignores all ESLint warnings during build
  },
  typescript: {
    // Ignores all TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Ensure API routes work properly on Vercel
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    serverActions: true,
  },
  // Runtime configuration for Vercel
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
};

export default nextConfig; 
