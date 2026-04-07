/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Excluye motion del bundle SSR — necesario para Next.js 16 + React 19
  serverExternalPackages: ['motion'],
  // Turbopack vacío silencia el warning de "no turbopack config"
  turbopack: {},
}

module.exports = nextConfig
