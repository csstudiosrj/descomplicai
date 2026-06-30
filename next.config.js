const { withSentryConfig } = require("@sentry/nextjs");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  maximumFileSizeToCacheInBytes: 5000000, // 5MB
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      // Páginas públicas — NetworkFirst (tenta rede, fallback pro cache)
      urlPattern: /\/$|\/landing$|\/vitrine|\/login$|\/cadastro$|\/fornecedor\/(cadastro|login)$|\/cerimonialista\/(cadastro|login)$|\/convite|\/assinar|\/colaborador/,
      handler: "NetworkFirst",
      options: {
        cacheName: "public-pages",
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }, // 1 dia
      },
    },
    {
      // Assets estáticos — CacheFirst
      urlPattern: /\/_next\/static/,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 }, // 1 ano
      },
    },
    {
      // Imagens e fontes — CacheFirst
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|otf)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 dias
      },
    },
    {
      // API routes — NUNCA cachear (dados sensíveis)
      urlPattern: /\/api\//,
      handler: "NetworkOnly",
    },
    {
      // Google Fonts — CacheFirst
      urlPattern: /https:\/\/fonts\.googleapis\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-stylesheets",
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /https:\/\/fonts\.gstatic\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
  ],
  fallbacks: {
    document: "/offline.html",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "lh3.googleusercontent.com"],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || "descomplicai",
  project: process.env.SENTRY_PROJECT || "descomplicai-web",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  webpack: {
    autoInstrumentServerFunctions: true,
    autoInstrumentMiddleware: true,
    treeshake: { removeDebugLogging: true },
  },
};

module.exports = withSentryConfig(withPWA(nextConfig), sentryWebpackPluginOptions);
