#!/bin/bash
set -e
ZIP="perfil-cerimonialista.zip"
if [ ! -f "$ZIP" ]; then
  echo "Erro: $ZIP nao encontrado"
  exit 1
fi
unzip -o "$ZIP" -d .
echo ""
echo "========================================"
echo "  Perfil do cerimonialista instalado!"
echo "========================================"
echo ""
echo "Arquivos:"
echo "  + pages/api/cerimonialista/perfil.js"
echo "  + pages/cerimonialista/perfil.jsx"
echo "  ~ pages/cerimonialista/painel.jsx"
echo "  ~ hooks/useAuth.js"
echo ""
echo "Proximo: git add . && git commit -m 'feat: pagina perfil cerimonialista' && git push"
