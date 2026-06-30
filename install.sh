#!/bin/bash
# install-pwa-acessibilidade.sh
# Script de instalação automática — execute da raiz do projeto descomplicai

set -e

echo "═══════════════════════════════════════════════════════"
echo "  Instalando PWA + Acessibilidade no Descomplicaí"
echo "═══════════════════════════════════════════════════════"

# Verifica se está na pasta certa
if [ ! -f "package.json" ]; then
  echo "❌ Erro: execute este script da raiz do projeto descomplicai"
  exit 1
fi

# 1. Instalar next-pwa
echo "📦 Instalando next-pwa..."
npm install next-pwa

# 2. Backup dos arquivos originais
echo "💾 Fazendo backup..."
cp next.config.js next.config.js.backup.$(date +%s) 2>/dev/null || true
cp pages/_document.jsx pages/_document.jsx.backup.$(date +%s) 2>/dev/null || true
cp pages/_app.jsx pages/_app.jsx.backup.$(date +%s) 2>/dev/null || true
cp components/ui/Button.jsx components/ui/Button.jsx.backup.$(date +%s) 2>/dev/null || true
cp components/ui/Input.jsx components/ui/Input.jsx.backup.$(date +%s) 2>/dev/null || true
cp components/ui/Card.jsx components/ui/Card.jsx.backup.$(date +%s) 2>/dev/null || true
cp components/ui/Badge.jsx components/ui/Badge.jsx.backup.$(date +%s) 2>/dev/null || true

# 3. Copiar arquivos
echo "📁 Copiando arquivos..."

# PWA
cp next.config.js ./
cp public/manifest.json ./public/
cp public/offline.html ./public/
cp public/sw.js ./public/
mkdir -p ./public/icons
cp public/icons/icon-192x192.svg ./public/icons/ 2>/dev/null || true
cp public/icons/icon-512x512.svg ./public/icons/ 2>/dev/null || true

# Componentes UI
cp components/ui/Button.jsx ./components/ui/
cp components/ui/Input.jsx ./components/ui/
cp components/ui/Card.jsx ./components/ui/
cp components/ui/Badge.jsx ./components/ui/
cp components/ui/Select.jsx ./components/ui/
cp components/ui/SkipLink.jsx ./components/ui/

# Hooks
cp hooks/useReducedMotion.js ./hooks/

# Widget
cp components/AcessibilidadeWidget.jsx ./components/

# Layout
cp pages/_document.jsx ./pages/
cp pages/_app.jsx ./pages/

# CSS patch (adicionar manualmente ao globals.css)
echo ""
echo "⚠️  ATENÇÃO: Adicione manualmente o conteúdo de styles/globals.css.patch.css"
echo "   ao final do arquivo styles/globals.css do projeto."
echo ""

# 4. Build
echo "🔨 Executando build..."
npm run build

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Instalação concluída!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo "  1. Converter ícones SVG para PNG"
echo "  2. Adicionar CSS patch ao globals.css"
echo "  3. Aplicar patch no Icon.jsx (ver Icon.jsx.patch.txt)"
echo "  4. Testar com Lighthouse PWA"
echo ""
