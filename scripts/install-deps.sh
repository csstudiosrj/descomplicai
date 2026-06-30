#!/bin/bash
# Instalar dependências necessárias para produção
set -e

echo "=== Instalando dependências de produção ==="

# Rate limiting
npm install @upstash/ratelimit @upstash/redis

# Sentry
npm install @sentry/nextjs

# Bcrypt (para cadastros)
npm install bcryptjs

# Outras dependências já devem estar no package.json
# (supabase-js, next, react, etc.)

echo "=== Dependências instaladas ==="
