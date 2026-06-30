#!/bin/bash
# ============================================================
# INSTALACAO COMPLETA — Testes + Otimizacoes Descomplicai
# Cole no terminal do IDX (raiz do projeto)
# ============================================================

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  INSTALACAO DESCOMPLICAI — TESTES + OTIMIZACOES"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verifica se esta na raiz do projeto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script na raiz do projeto (onde esta package.json)"
    exit 1
fi

echo "📦 Instalando dependencias de teste..."
npm install --save-dev jest @playwright/test node-mocks-http

echo ""
echo "📁 Descompactando LOTE 1: Testes de Integracao..."
unzip -o lote1-testes-integracao.zip

echo ""
echo "📁 Descompactando LOTE 2: Testes E2E..."
unzip -o lote2-testes-e2e.zip

echo ""
echo "📁 Descompactando LOTE 3: Otimizacoes..."
unzip -o lote3-otimizacoes.zip

echo ""
echo "📁 Descompactando LOTE 4: Correcoes de Bugs..."
unzip -o lote4-correcoes-bugs.zip

echo ""
echo "🔧 Instalando Playwright browsers..."
npx playwright install chromium

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ INSTALACAO CONCLUIDA"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Proximos passos:"
echo ""
echo "1. Rodar testes de integracao:"
echo "   npm test"
echo ""
echo "2. Rodar testes em watch mode:"
echo "   npm run test:watch"
echo ""
echo "3. Rodar testes com coverage (CI):"
echo "   npm run test:ci"
echo ""
echo "4. Rodar testes E2E:"
echo "   npm run test:e2e"
echo ""
echo "5. Rodar auditoria Lighthouse:"
echo "   npm run lighthouse"
echo ""
echo "6. Aplicar migration SQL no Supabase:"
echo "   Cole o conteudo de sql/migration_analytics_batch.sql"
echo "   no SQL Editor do Supabase"
echo ""
echo "═══════════════════════════════════════════════════════════════"
