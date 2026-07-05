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
};

module.exports = nextConfig;
