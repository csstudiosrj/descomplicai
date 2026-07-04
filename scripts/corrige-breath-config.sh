#!/bin/bash
# Corrige getBreathConfig.js para usar getAssetPath nos backgroundImage

ARQUIVO="utils/getBreathConfig.js"

echo "=== Estado antes ==="
head -n 2 "$ARQUIVO"

# Adiciona import no topo (antes do import existente)
sed -i '1s|^|import { getAssetPath } from '\''./getAssetPath'\'';\n|' "$ARQUIVO"

# Troca backgroundImage para usar getAssetPath
sed -i "s|backgroundImage: '/images/breath/|backgroundImage: getAssetPath('/images/breath/|g" "$ARQUIVO"

echo ""
echo "=== Estado depois ==="
head -n 3 "$ARQUIVO"
echo "..."
grep -n "getAssetPath" "$ARQUIVO" | head -n 3

echo ""
echo "=== Verificação de sintaxe ==="
node --check "$ARQUIVO" 2>&1 && echo "✅ Sintaxe OK" || echo "❌ Erro de sintaxe"