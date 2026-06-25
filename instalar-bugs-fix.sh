#!/bin/bash
set -e
ZIP="bugs-fix.zip"
if [ ! -f "$ZIP" ]; then
  echo "Erro: $ZIP nao encontrado"
  exit 1
fi
unzip -o "$ZIP" -d .
echo ""
echo "========================================"
echo "  Bugs fix instalados!"
echo "========================================"
echo ""
echo "Arquivos corrigidos:"
echo "  ~ hooks/useAuth.js (BUG 1: casal login)"
echo "  ~ pages/login.jsx (BUG 2: fornecedor redirect)"
echo "  ~ pages/cerimonialista/eventos.jsx (BUG 3: novo evento)"
echo ""
echo "Proximo: git add . && git commit -m 'fix: 3 bugs criticos integracao' && git push"
