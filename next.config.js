/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Activar prefetch DNS
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // HSTS: fuerza HTTPS durante 2 años en dominio y subdominios
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Prevenir clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevenir MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Política de referrer
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  // Deshabilitar APIs sensibles del navegador
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requiere unsafe-inline/unsafe-eval para hydration en desarrollo;
      // en producción se mantiene por compatibilidad con scripts inline del framework.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      // Supabase (REST + WebSocket), Vercel Analytics/Speed Insights
      [
        "connect-src 'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://vitals.vercel-insights.com',
        'https://va.vercel-scripts.com',
      ].join(' '),
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Optimizaciones de producción
  compress: true,
  poweredByHeader: false,
  
  // Optimizar chunks para mejor caching
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache estático agresivo para assets
      {
        source: '/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache para fuentes
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  images: {
    // Image Optimization habilitada — sirve WebP/AVIF automáticamente
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 días de caché
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  
  // Excluye motion del bundle SSR — necesario para Next.js 16 + React 19
  serverExternalPackages: ['motion', 'framer-motion'],
  
  // Turbopack vacío silencia el warning de "no turbopack config"
  turbopack: {},
}

module.exports = nextConfig
