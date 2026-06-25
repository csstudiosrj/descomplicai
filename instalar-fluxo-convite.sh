#!/bin/bash
# Instalador do Fluxo de Convite — Descomplicaí
# Uso: bash instalar-fluxo-convite.sh

set -e

ZIP="fluxo-convite.zip"

if [ ! -f "$ZIP" ]; then
  echo "Erro: $ZIP não encontrado na pasta atual."
  echo "Certifique-se de que o ZIP está no mesmo diretório deste script."
  exit 1
fi

echo "Extraindo $ZIP na raiz do projeto..."
unzip -o "$ZIP" -d .

echo ""
echo "Removendo arquivo legado (se existir)..."
if [ -f "pages/convite/[leadId].jsx" ]; then
  rm "pages/convite/[leadId].jsx"
  echo "  pages/convite/[leadId].jsx removido (agora é pages/convite/lead/[leadId].jsx)"
fi

echo ""
echo "========================================"
echo "  Fluxo de convite instalado!"
echo "========================================"
echo ""
echo "Arquivos criados/modificados:"
echo "  + pages/api/convite/validar.js"
echo "  + pages/api/convite/aceitar.js"
echo "  + pages/convite/[token].jsx"
echo "  + pages/convite/lead/[leadId].jsx (movido)"
echo "  ~ pages/cerimonialista/convites.jsx"
echo "  ~ components/cerimonialista/ConviteCard.jsx"
echo "  ~ pages/api/cerimonialista/leads.js"
echo ""
echo "Próximo passo:"
echo "  git add ."
echo "  git commit -m 'feat: fluxo convite casal pelo cerimonialista'"
echo "  git push"
echo ""
echo "Depois testar na Vercel."
