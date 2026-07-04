#!/bin/bash
# Corrige opcaopcao.campo → opcao.campo
# Sequelas do corrige-o-solto.sh que substituiu o.campo dentro de opcao.campo

set -e

STEPS_DIR="components/memorial/steps"
BACKUP_DIR="backups/opcaopcao-campo-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "  CORREÇÃO: opcaopcao.campo → opcao.campo"
echo "  Backup: $BACKUP_DIR"
echo "=========================================="

# 1. BACKUP
echo ""
echo ">> [1/2] Criando backup..."
mkdir -p "$BACKUP_DIR"
find "$STEPS_DIR" -maxdepth 1 -name "*.jsx" -exec cp {} "$BACKUP_DIR/" \;
echo "   ✅ $(ls "$BACKUP_DIR" | wc -l) arquivos copiados"

# 2. CORREÇÃO CIRÚRGICA
echo ""
echo ">> [2/2] Corrigindo opcaopcao.campo → opcao.campo..."
CONTADOR=0
for arquivo in "$STEPS_DIR"/*.jsx; do
  if grep -q "opcaopcao\.campo" "$arquivo" 2>/dev/null; then
    sed -i 's/opcaopcao\.campo/opcao.campo/g' "$arquivo"
    CONTADOR=$((CONTADOR + 1))
  fi
done
echo "   ✅ $CONTADOR arquivo(s) corrigidos"

# 3. VERIFICAÇÃO
echo ""
echo "=========================================="
echo "  VERIFICAÇÃO"
echo "=========================================="
RESTANTES=$(grep -rn "opcaopcao\.campo" "$STEPS_DIR" --include="*.jsx" | wc -l)
echo "opcaopcao.campo restantes: $RESTANTES"

if [ "$RESTANTES" -eq 0 ]; then
  echo "✅ LIMPO — nenhum opcaopcao.campo restante"
else
  echo "❌ Ainda existem $RESTANTES ocorrências:"
  grep -rn "opcaopcao\.campo" "$STEPS_DIR" --include="*.jsx"
  exit 1
fi

# Bônus: verifica se NÃO recriamos o problema (o.campo dentro de opcao.campo)
echo ""
echo "Verificando se opcao.campo está correto (sem recursão):"
OPCAO_CAMPO=$(grep -rn "opcao\.campo" "$STEPS_DIR" --include="*.jsx" | wc -l)
echo "   opcao.campo presente: $OPCAO_CAMPO ocorrências"
echo "=========================================="