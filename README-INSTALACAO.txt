============================================================
  DESCOMPLICAÍ v1.0 — DEPLOY + HARDENING
  Rate Limiting + Sentry + Fallback Supabase
============================================================

COMO USAR:
----------
1. Descompacte este ZIP na RAIZ do seu projeto (mesmo nível do package.json)
2. Execute: bash instalar.sh
3. Siga as instruções no terminal

O QUE É INSTALADO:
------------------
• lib/ratelimit.js          — Rate limiting com @upstash/ratelimit
• lib/errorLogger.js        — Wrapper Sentry + fallback Supabase
• pages/_error.jsx          — Error boundary (Pages Router)
• sentry.*.config.js        — Configuração Sentry (client/server/edge)
• instrumentation.ts        — Registration hook Next.js 14+
• next.config.js            — Com withSentryConfig
• pages/api/*/              — 5 rotas protegidas com rate limit
• sql/criar_tabela_erros.sql — Schema tabela fallback

SEM MIDDLEWARE:
---------------
O rate limit é aplicado via wrapper em CADA rota individualmente:
  export default withRateLimit(handler, limiter);

Nenhum middleware.ts é criado ou necessário.

DEPENDÊNCIAS INSTALADAS:
------------------------
  npm install @upstash/ratelimit @upstash/redis @sentry/nextjs bcryptjs

ENV VARS NECESSÁRIAS:
---------------------
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN
  SENTRY_DSN
  SENTRY_AUTH_TOKEN
  SENTRY_ORG
  SENTRY_PROJECT
  (mais as que você já tem: SUPABASE_URL, MERCADO_PAGO, etc.)

COMMITS SUGERIDOS:
------------------
  git add -A
  git commit -m "feat: deploy v1.0 + rate limit + sentry monitoring"
  git push origin main

DÚVIDAS?
--------
Veja DEPLOY.md e RESUMO.md dentro deste pacote.
