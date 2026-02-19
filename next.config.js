/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizeCss: false, // Disable CSS optimization to prevent MIME issues
  },
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  generateBuildId: async () => {
    // Force new build ID to bust CSS cache
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
}

module.exports = nextConfig