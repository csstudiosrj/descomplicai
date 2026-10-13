/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/descomplicai',
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: '**.uploadthing.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', '@react-pdf/renderer'],
  },

  async headers() {
    return [
      {
        // Assets do Next.js sao imutaveis — hash no nome do arquivo garante cache longo
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Imagens e fontes publicas — cache de 7 dias com revalidacao
        source: '/(:path(icons|fonts|images).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://*.mercadopago.com https://*.mercadolibre.com https://*.google.com https://*.googleapis.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://*.mercadopago.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.mercadopago.com https://*.mercadolibre.com https://images.unsplash.com https://lh3.googleusercontent.com https://*.supabase.co",
              "connect-src 'self' https://*.mercadopago.com https://*.mercadolibre.com https://api.mercadopago.com https://*.supabase.co https://*.google.com https://servicodados.ibge.gov.br",
              "frame-src 'self' https://*.mercadopago.com https://*.mercadolibre.com",
              "font-src 'self' https://fonts.gstatic.com",
              "media-src 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;