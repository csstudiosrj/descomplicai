#!/bin/bash
# Corrige 'o' solto em callbacks e propriedades — sequelas do fix-todos-os-o.sh
# ATENÇÃO: Só toca arquivos em components/memorial/steps/

set -e

STEPS_DIR="components/memorial/steps"
BACKUP_DIR="backups/o-solto-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "  CORREÇÃO: 'o' solto em callbacks"
echo "  Backup: $BACKUP_DIR"
echo "=========================================="

# 1. BACKUP
echo ""
echo ">> [1/5] Criando backup..."
mkdir -p "$BACKUP_DIR"
find "$STEPS_DIR" -maxdepth 1 -name "*.jsx" -exec cp {} "$BACKUP_DIR/" \;
echo "   ✅ $(ls "$BACKUP_DIR" | wc -l) arquivos copiados"

# 2. handleCardClick(o) → handleCardClick(opcao)
echo ""
echo ">> [2/5] Corrigindo handleCardClick(o) → handleCardClick(opcao)..."
CONTADOR_HCC=0
for arquivo in "$STEPS_DIR"/*.jsx; do
  if grep -q "handleCardClick(o)" "$arquivo" 2>/dev/null; then
    sed -i 's/handleCardClick(o)/handleCardClick(opcao)/g' "$arquivo"
    CONTADOR_HCC=$((CONTADOR_HCC + 1))
  fi
done
echo "   ✅ $CONTADOR_HCC arquivo(s) corrigidos"

# 3. handleClick(o) → handleClick(opcao)
echo ""
echo ">> [3/5] Corrigindo handleClick(o) → handleClick(opcao)..."
CONTADOR_HC=0
for arquivo in "$STEPS_DIR"/*.jsx; do
  if grep -q "handleClick(o)" "$arquivo" 2>/dev/null; then
    sed -i 's/handleClick(o)/handleClick(opcao)/g' "$arquivo"
    CONTADOR_HC=$((CONTADOR_HC + 1))
  fi
done
echo "   ✅ $CONTADOR_HC arquivo(s) corrigidos"

# 4. Casos especiais + o.campo residual
echo ""
echo ">> [4/5] Corrigindo casos especiais e o.campo residual..."
CONTADOR_ESP=0

# setTransporte(o) / setPlano(o) / key={o} / === o
for arquivo in "$STEPS_DIR"/Step11bTransporte.jsx "$STEPS_DIR"/Step11PlanoChuva.jsx; do
  if [ -f "$arquivo" ]; then
    MOD=0
    if grep -q "setTransporte(o)" "$arquivo" 2>/dev/null; then
      sed -i 's/setTransporte(o)/setTransporte(opcao)/g' "$arquivo"
      MOD=1
    fi
    if grep -q "setPlano(o)" "$arquivo" 2>/dev/null; then
      sed -i 's/setPlano(o)/setPlano(opcao)/g' "$arquivo"
      MOD=1
    fi
    if grep -q "=== o" "$arquivo" 2>/dev/null; then
      sed -i 's/=== o/=== opcao/g' "$arquivo"
      MOD=1
    fi
    if grep -q "key={o}" "$arquivo" 2>/dev/null; then
      sed -i 's/key={o}/key={opcao}/g' "$arquivo"
      MOD=1
    fi
    if [ "$MOD" -eq 1 ]; then
      CONTADOR_ESP=$((CONTADOR_ESP + 1))
      echo "   ✅ $(basename "$arquivo") corrigido"
    fi
  fi
done

# o.campo → opcao.campo (em qualquer step que tenha)
for arquivo in "$STEPS_DIR"/*.jsx; do
  if grep -q "o\.campo" "$arquivo" 2>/dev/null; then
    sed -i 's/o\.campo/opcao.campo/g' "$arquivo"
    echo "   ✅ $(basename "$arquivo") — o.campo corrigido"
    CONTADOR_ESP=$((CONTADOR_ESP + 1))
  fi
done

# 5. VERIFICAÇÃO FINAL
echo ""
echo ">> [5/5] Verificação final..."
echo "------------------------------------------"

# Verifica callbacks com o solto
RESTANTES_CALLBACKS=$(grep -rn "handleCardClick(o)\|handleClick(o)\|setTransporte(o)\|setPlano(o)" "$STEPS_DIR" --include="*.jsx" | wc -l)

# Verifica o. residual
O_DOT=$(grep -rn "\bo\." "$STEPS_DIR" --include="*.jsx" | grep -v "node_modules" | grep -v "OPCOES\|opcao\|onSelect\|onChange\|onClick\|onFocus\|onBlur\|onError\|onUpload\|onRemover\|role\|style\|const o\|let o\|var o\|for (let o\|for (const o\|function o\|=> o\.\|o =\|o)\|o,\|o}\|o]\|o|\|o?\|typeof o\|instanceof o\|delete o\|in o\|of o\|return o\.\|await o\.\|catch (o)\|opcao\." | wc -l)

echo "Callbacks com 'o' solto restantes: $RESTANTES_CALLBACKS"
echo "Propriedades 'o.' residuais:       $O_DOT"

echo ""
echo "=========================================="
if [ "$RESTANTES_CALLBACKS" -eq 0 ] && [ "$O_DOT" -eq 0 ]; then
  echo "✅ SUCESSO: Todos os 'o' soltos eliminados!"
  echo "Backup: $BACKUP_DIR"
else
  echo "❌ FALHA: Ainda existem problemas."
  if [ "$RESTANTES_CALLBACKS" -gt 0 ]; then
    echo "   Callbacks:"
    grep -rn "handleCardClick(o)\|handleClick(o)\|setTransporte(o)\|setPlano(o)" "$STEPS_DIR" --include="*.jsx"
  fi
  if [ "$O_DOT" -gt 0 ]; then
    echo "   Propriedades 'o.':"
    grep -rn "\bo\." "$STEPS_DIR" --include="*.jsx" | grep -v "node_modules" | grep -v "OPCOES\|opcao\|onSelect\|onChange\|onClick\|onFocus\|onBlur\|onError\|onUpload\|onRemover\|role\|style\|const o\|let o\|var o\|for (let o\|for (const o\|function o\|=> o\.\|o =\|o)\|o,\|o}\|o]\|o|\|o?\|typeof o\|instanceof o\|delete o\|in o\|of o\|return o\.\|await o\.\|catch (o)\|opcao\." | head -n 20
  fi
  exit 1
fi
echo "=========================================="