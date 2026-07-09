/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/descomplicai',
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
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
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://*.mercadopago.com https://*.mercadolibre.com https://*.google.com https://*.googleapis.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://*.mercadopago.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.mercadopago.com https://*.mercadolibre.com https://images.unsplash.com https://lh3.googleusercontent.com https://**.supabase.co",
              "connect-src 'self' https://*.mercadopago.com https://*.mercadolibre.com https://api.mercadopago.com https://**.supabase.co https://*.google.com",
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