/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignores all ESLint warnings during build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: true,
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