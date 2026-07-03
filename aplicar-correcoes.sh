#!/bin/bash
# Script para aplicar correcoes de redirecionamento do admin
# Uso: bash aplicar-correcoes.sh

set -e

echo "=========================================="
echo "Aplicando correcoes de redirecionamento"
echo "=========================================="
echo ""

# Verifica se esta na raiz do projeto
if [ ! -f "next.config.mjs" ] && [ ! -f "next.config.js" ]; then
    echo "ERRO: Execute este script na RAIZ do projeto (onde fica next.config.mjs)"
    exit 1
fi

# Faz backup dos arquivos originais
echo "[1/3] Criando backups..."
mkdir -p .backups/$(date +%Y%m%d_%H%M%S)
cp pages/admin/login.jsx .backups/$(date +%Y%m%d_%H%M%S)/admin_login.jsx.bak 2>/dev/null || true
cp pages/admin/index.jsx .backups/$(date +%Y%m%d_%H%M%S)/admin_index.jsx.bak 2>/dev/null || true
echo "Backups criados em .backups/$(date +%Y%m%d_%H%M%S)/"

# Descompacta e aplica os arquivos
echo "[2/3] Descompactando correcoes..."
unzip -o correcoes-admin.zip -d .
echo "Arquivos descompactados."

# Verifica se os arquivos foram aplicados
echo "[3/3] Verificando..."
if grep -q "apiPath" pages/admin/login.jsx 2>/dev/null; then
    echo "✅ pages/admin/login.jsx corrigido"
else
    echo "⚠️  pages/admin/login.jsx - verifique manualmente"
fi

if grep -q "appPath" pages/admin/index.jsx 2>/dev/null; then
    echo "✅ pages/admin/index.jsx corrigido"
else
    echo "⚠️  pages/admin/index.jsx - verifique manualmente"
fi

echo ""
echo "=========================================="
echo "Correcoes aplicadas!"
echo "=========================================="
echo ""
echo "Proximo passo:"
echo "  1. No terminal do IDX, rode: npm run build"
echo "  2. Depois: vercel --prod"
echo ""
