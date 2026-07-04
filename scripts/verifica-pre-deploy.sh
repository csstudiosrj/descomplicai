#!/bin/bash
# Verificação pré-deploy — impede que typos do memorial passem despercebidos
# Uso: bash scripts/verifica-pre-deploy.sh
# Ideal para rodar antes de git push ou vercel --prod

set -e

STEPS_DIR="components/memorial/steps"
ERROS=0

echo "=========================================="
echo "  VERIFICAÇÃO PRÉ-DEPLOY"
echo "  $(date)"
echo "=========================================="

# 1. TYPOS opcaopcao / opcaopcaopcao
echo ""
echo ">> [1/5] Verificando typos opcaopcao..."
TYPOS=$(grep -rn "opcaopcao\|opcaopcaopcao" "$STEPS_DIR" --include="*.jsx" | wc -l)
if [ "$TYPOS" -gt 0 ]; then
  echo "   ❌ $TYPOS typo(s) encontrado(s):"
  grep -rn "opcaopcao\|opcaopcaopcao" "$STEPS_DIR" --include="*.jsx" | head -n 5
  ERROS=$((ERROS + 1))
else
  echo "   ✅ Zero typos"
fi

# 2. 'o' solto em callbacks
echo ""
echo ">> [2/5] Verificando 'o' solto em callbacks..."
O_SOLTO=$(grep -rn "handleCardClick(o)\|handleClick(o)\|setTransporte(o)\|setPlano(o)\|setOnibus(o)\|setTenda(o)" "$STEPS_DIR" --include="*.jsx" | wc -l)
if [ "$O_SOLTO" -gt 0 ]; then
  echo "   ❌ $O_SOLTO callback(s) com 'o' solto:"
  grep -rn "handleCardClick(o)\|handleClick(o)\|setTransporte(o)\|setPlano(o)\|setOnibus(o)\|setTenda(o)" "$STEPS_DIR" --include="*.jsx" | head -n 5
  ERROS=$((ERROS + 1))
else
  echo "   ✅ Zero callbacks quebrados"
fi

# 3. map((o) residual
echo ""
echo ">> [3/5] Verificando map((o) residual..."
MAP_O=$(grep -rln "map((o)" "$STEPS_DIR" --include="*.jsx" | wc -l)
if [ "$MAP_O" -gt 0 ]; then
  echo "   ❌ $MAP_O arquivo(s) com map((o) em vez de map((opcao):"
  grep -rln "map((o)" "$STEPS_DIR" --include="*.jsx"
  ERROS=$((ERROS + 1))
else
  echo "   ✅ Nenhum map((o) residual"
fi

# 4. Variáveis não declaradas (padrão comum)
echo ""
echo ">> [4/5] Verificando variáveis não declaradas nos steps..."
# Procura por padrões de erro comum: variável usada sem estar no escopo do map
UNDEFINED=$(grep -rn "\bo\.\|o\.campo\|o\.valor\|o\.label\|o\.cor\|o\.icone\|o\.subtexto" "$STEPS_DIR" --include="*.jsx" | grep -v "opcao\." | grep -v "OPCOES" | grep -v "opcoes" | grep -v "node_modules" | wc -l)
if [ "$UNDEFINED" -gt 0 ]; then
  echo "   ⚠️  $UNDEFINED ocorrência(s) de 'o.' isolado (verificar manualmente):"
  grep -rn "\bo\.\|o\.campo\|o\.valor\|o\.label\|o\.cor\|o\.icone\|o\.subtexto" "$STEPS_DIR" --include="*.jsx" | grep -v "opcao\." | grep -v "OPCOES" | grep -v "opcoes" | grep -v "node_modules" | head -n 5
  ERROS=$((ERROS + 1))
else
  echo "   ✅ Nenhum 'o.' isolado"
fi

# 5. Build rápido (opcional — descomente se quiser)
echo ""
echo ">> [5/5] Build check..."
echo "   (Build completo pulado para agilidade — rode 'npx next build' manualmente)"
# npx next build > /dev/null 2>&1 || { echo "   ❌ Build falhou"; ERROS=$((ERROS + 1)); }

# RESUMO
echo ""
echo "=========================================="
if [ "$ERROS" -eq 0 ]; then
  echo "✅ TUDO LIMPO — PODE FAZER DEPLOY"
  echo ""
  echo "Comandos sugeridos:"
  echo "  git add -A && git commit -m '...' && git push origin main"
  echo "  vercel --prod"
  exit 0
else
  echo "❌ $ERROS PROBLEMA(S) ENCONTRADO(S)"
  echo "Corrija antes de fazer deploy."
  exit 1
fi
echo "=========================================="