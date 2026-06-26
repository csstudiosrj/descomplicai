#!/bin/bash
# instalar-substituir-hardcode.sh
# Instala os scripts de substituição de hardcode no memorial

set -e

echo "========================================"
echo "  Instalando scripts de hardcode"
echo "========================================"

# Copia os scripts para a raiz do projeto
cp substituir-hardcode-memorial.js ~/descomplicai/
cp restaurar-backup-memorial.js ~/descomplicai/

echo ""
echo "Scripts copiados para ~/descomplicai/"
echo ""
echo "Para executar (modo teste em 1 arquivo):"
echo "  cd ~/descomplicai && node substituir-hardcode-memorial.js"
echo ""
echo "Para restaurar backup se algo der errado:"
echo "  cd ~/descomplicai && node restaurar-backup-memorial.js"
echo ""
echo "========================================"
