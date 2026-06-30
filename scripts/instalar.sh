#!/bin/bash
# ============================================================
# INSTALADOR — Descomplicaí v1.0 Deploy + Hardening
# Execute na RAIZ do projeto (mesmo nível do package.json)
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(pwd)"

echo "========================================"
echo "  DESCOMPLICAÍ v1.0 — INSTALADOR"
echo "========================================"
echo ""
echo "Diretório do script: $SCRIPT_DIR"
echo "Raiz do projeto:    $PROJECT_ROOT"
echo ""

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script na RAIZ do projeto (onde está package.json)"
    exit 1
fi

echo "[1/6] Criando diretórios necessários..."
mkdir -p lib
mkdir -p pages/api/pagamento
mkdir -p pages/api/analytics
mkdir -p pages/api/cerimonialista
mkdir -p pages/api/fornecedor
mkdir -p pages/api/convite
mkdir -p sql

echo "[2/6] Copiando arquivos de rate limiting..."
cp "$SCRIPT_DIR/lib/ratelimit.js" lib/ratelimit.js
echo "      → lib/ratelimit.js"

echo "[3/6] Copiando arquivos de monitoramento (Sentry)..."
cp "$SCRIPT_DIR/instrumentation.ts" instrumentation.ts
cp "$SCRIPT_DIR/sentry.client.config.js" sentry.client.config.js
cp "$SCRIPT_DIR/sentry.server.config.js" sentry.server.config.js
cp "$SCRIPT_DIR/sentry.edge.config.js" sentry.edge.config.js
cp "$SCRIPT_DIR/pages/_error.jsx" pages/_error.jsx
cp "$SCRIPT_DIR/lib/errorLogger.js" lib/errorLogger.js
cp "$SCRIPT_DIR/next.config.js" next.config.js
echo "      → instrumentation.ts"
echo "      → sentry.*.config.js (3 arquivos)"
echo "      → pages/_error.jsx"
echo "      → lib/errorLogger.js"
echo "      → next.config.js"

echo "[4/6] Copiando rotas API protegidas com rate limit..."
cp "$SCRIPT_DIR/pages/api/pagamento/criar.js" pages/api/pagamento/criar.js
cp "$SCRIPT_DIR/pages/api/analytics/track.js" pages/api/analytics/track.js
cp "$SCRIPT_DIR/pages/api/cerimonialista/cadastro.js" pages/api/cerimonialista/cadastro.js
cp "$SCRIPT_DIR/pages/api/fornecedor/cadastro.js" pages/api/fornecedor/cadastro.js
cp "$SCRIPT_DIR/pages/api/convite/validar.js" pages/api/convite/validar.js
echo "      → pages/api/pagamento/criar.js (10 req/min)"
echo "      → pages/api/analytics/track.js (100 req/min)"
echo "      → pages/api/cerimonialista/cadastro.js (5 req/min)"
echo "      → pages/api/fornecedor/cadastro.js (5 req/min)"
echo "      → pages/api/convite/validar.js (10 req/min)"

echo "[5/6] Copiando schema SQL..."
cp "$SCRIPT_DIR/sql/criar_tabela_erros.sql" sql/criar_tabela_erros.sql
echo "      → sql/criar_tabela_erros.sql"

echo "[6/6] Instalando dependências npm..."
npm install @upstash/ratelimit @upstash/redis @sentry/nextjs bcryptjs

echo ""
echo "========================================"
echo "  ✅ INSTALAÇÃO CONCLUÍDA!"
echo "========================================"
echo ""
echo "Próximos passos:"
echo "  1. Configure as env vars na Vercel (veja DEPLOY.md)"
echo "  2. Execute o SQL em sql/criar_tabela_erros.sql no Supabase"
echo "  3. Commit 1: git add -A && git commit -m 'feat: lançamento v1.0'"
echo "  4. Commit 2: (rate limit já está no commit 1, separe se preferir)"
echo "  5. Commit 3: (monitoramento já está no commit 1, separe se preferir)"
echo "  6. git push origin main"
echo ""
echo "⚠️  IMPORTANTE: Este pacote NÃO inclui middleware.ts"
echo "    (rate limit é aplicado via wrapper em cada rota individualmente)"
echo ""
