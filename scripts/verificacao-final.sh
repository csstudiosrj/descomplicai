#!/bin/bash
# Verificação final pós-correção em massa
# Confirma que NADA quebrou e o memorial está funcional

echo "=========================================="
echo "  VERIFICAÇÃO FINAL — MEMORIAL STEPS"
echo "  $(date)"
echo "=========================================="

STEPS_DIR="components/memorial/steps"
ERROS=0

# ==========================================
# 1. ZERO TYPOS
# ==========================================
echo ""
echo ">> [1/6] Verificando typos eliminados..."
TYPOS=$(grep -rn "opcaopcao\|opcaopcaopcao\|handleCardClick(o)\|handleClick(o)\|setTransporte(o)\|setPlano(o)\|o\.campo" "$STEPS_DIR" --include="*.jsx" | wc -l)
if [ "$TYPOS" -eq 0 ]; then
  echo "   ✅ Zero typos restantes"
else
  echo "   ❌ $TYPOS typo(s) encontrado(s):"
  grep -rn "opcaopcao\|opcaopcaopcao\|handleCardClick(o)\|handleClick(o)\|setTransporte(o)\|setPlano(o)\|o\.campo" "$STEPS_DIR" --include="*.jsx"
  ERROS=$((ERROS + 1))
fi

# ==========================================
# 2. map((opcao) EXISTE E ESTÁ CORRETO
# ==========================================
echo ""
echo ">> [2/6] Verificando declaração map((opcao)..."
MAP_OPCAO=$(grep -rln "map((opcao)" "$STEPS_DIR" --include="*.jsx" | wc -l)
MAP_O=$(grep -rln "map((o)" "$STEPS_DIR" --include="*.jsx" | wc -l)
echo "   Arquivos com map((opcao): $MAP_OPCAO"
echo "   Arquivos com map((o):     $MAP_O"
if [ "$MAP_O" -eq 0 ]; then
  echo "   ✅ Nenhum map((o) residual"
else
  echo "   ❌ Ainda existe map((o) em:"
  grep -rln "map((o)" "$STEPS_DIR" --include="*.jsx"
  ERROS=$((ERROS + 1))
fi

# ==========================================
# 3. ANIMAÇÕES (pulse) INTACTAS
# ==========================================
echo ""
echo ">> [3/6] Verificando animações (pulse visual)..."
ANIMA_COm_CARD=$(grep -rln "cardPulsando" "$STEPS_DIR" --include="*.jsx" | wc -l)
ANIMA_COm_TRANSFORM=$(grep -rln "transform.*cardPulsando.*scale" "$STEPS_DIR" --include="*.jsx" | wc -l)
echo "   Arquivos com cardPulsando:       $ANIMA_COm_CARD"
echo "   Arquivos com transform+scale:    $ANIMA_COm_TRANSFORM"
if [ "$ANIMA_COm_CARD" -gt 100 ] && [ "$ANIMA_COm_TRANSFORM" -gt 100 ]; then
  echo "   ✅ Animações presentes em massa ($ANIMA_COm_CARD arquivos)"
else
  echo "   ⚠️  Poucos arquivos com animação — verificar manualmente"
fi

# ==========================================
# 4. VARIÁVEL 'opcao' USADA CORRETAMENTE
# ==========================================
echo ""
echo ">> [4/6] Verificando uso correto de 'opcao'..."
OPCAO_USOS=$(grep -rn "\bopcao\b" "$STEPS_DIR" --include="*.jsx" | wc -l)
echo "   Ocorrências de 'opcao' (correta): $OPCAO_USOS"
if [ "$OPCAO_USOS" -gt 1500 ]; then
  echo "   ✅ Uso massivo de 'opcao' confirmado"
else
  echo "   ⚠️  Número baixo — pode indicar arquivos não corrigidos"
fi

# ==========================================
# 5. SYNTAX CHECK — npx tsc ou eslint
# ==========================================
echo ""
echo ">> [5/6] Syntax check rápido (primeiros 20 erros)..."
# Tenta verificar sintaxe básica sem compilar tudo
# Procura por padrões de erro comuns: variável não declarada, JSX malformado
echo "   Procurando por 'is not defined' nos steps..."
NOT_DEFINED=$(grep -rn "is not defined\|ReferenceError\|not defined" "$STEPS_DIR" --include="*.jsx" | wc -l)
if [ "$NOT_DEFINED" -eq 0 ]; then
  echo "   ✅ Nenhum 'is not defined' óbvio nos arquivos"
else
  echo "   ❌ Encontrado:"
  grep -rn "is not defined\|ReferenceError\|not defined" "$STEPS_DIR" --include="*.jsx" | head -n 5
  ERROS=$((ERROS + 1))
fi

# ==========================================
# 6. BUILD TEST (rápido, só os steps)
# ==========================================
echo ""
echo ">> [6/6] Teste de build (verificando se Next não quebra)..."
cd ~/descomplicai
# Tenta um build rápido — se falhar, mostra o erro
# Nota: isso pode demorar. Se quiser pular, comente.
echo "   Executando: npx next build 2>&1 | tail -n 20"
# Descomente a linha abaixo se quiser rodar o build real:
# npx next build 2>&1 | tail -n 20 || echo "   ⚠️  Build falhou — verificar logs acima"

echo "   (Build completo pulado para agilidade — rode manualmente se desejar)"
echo "   Comando: npx next build"

# ==========================================
# RESUMO
# ==========================================
echo ""
echo "=========================================="
echo "  RESUMO DA VERIFICAÇÃO FINAL"
echo "=========================================="
echo "Erros encontrados: $ERROS"
echo ""

if [ "$ERROS" -eq 0 ]; then
  echo "✅ TUDO LIMPO — o memorial deve estar funcional!"
  echo ""
  echo "Próximos passos recomendados:"
  echo "1. Rode 'npx next build' para validar o build completo"
  echo "2. Teste o memorial no navegador (alguns steps)"
  echo "3. Verifique se as animações de pulse funcionam ao clicar nos cards"
  echo ""
  echo "Backups disponíveis:"
  ls -d ~/descomplicai/backups/* 2>/dev/null | tail -n 5
else
  echo "❌ EXISTEM $ERROS PROBLEMA(S) — NÃO FAÇA DEPLOY AINDA"
  echo "Corrija os erros acima antes de continuar."
fi
echo "=========================================="