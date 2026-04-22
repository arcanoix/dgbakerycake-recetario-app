/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Image Optimization habilitada — sirve WebP/AVIF automáticamente
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 días de caché
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Excluye motion del bundle SSR — necesario para Next.js 16 + React 19
  serverExternalPackages: ['motion'],
  // Turbopack vacío silencia el warning de "no turbopack config"
  turbopack: {},
}

module.exports = nextConfig
