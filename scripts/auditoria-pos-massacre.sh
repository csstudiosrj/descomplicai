#!/bin/bash
# Auditoria completa pós-correção em massa
# Varre TODO o projeto procurando por corpos escondidos do fix-todos-os-o.sh

echo "=========================================="
echo "  AUDITORIA PÓS-MASSACRE"
echo "  Data: $(date)"
echo "=========================================="

# ==========================================
# 1. 'o' SOLTO EM CALLBACKS DENTRO DE STEPS
# ==========================================
echo ""
echo "🔴 CRÍTICO 1: 'o' solto como argumento de função em steps"
echo "------------------------------------------"
grep -rn "handleCardClick(o)\|handleClick(o)\|onClick={() => \w*(o)}\|onClick={() => \w*(o) }\|onKeyDown.*handleCardClick(o)" components/memorial/steps/ --include="*.jsx" | grep -v "node_modules" | while read line; do
  echo "   $line"
done
TOTAL_O_CALLBACKS=$(grep -rn "handleCardClick(o)\|handleClick(o)\|onClick={() => \w*(o)}\|onClick={() => \w*(o) }\|onKeyDown.*handleCardClick(o)" components/memorial/steps/ --include="*.jsx" | wc -l)
echo "   Total: $TOTAL_O_CALLBACKS ocorrência(s)"

# ==========================================
# 2. 'o' COMO PARÂMETRO DE MAP EM TODO O PROJETO
# ==========================================
echo ""
echo "🔴 CRÍTICO 2: 'map((o)' ou 'map(o =>' em todo o projeto (deveria ser 'opcao')"
echo "------------------------------------------"
grep -rn "map((o)\|map(o =>" components/ pages/ hooks/ context/ lib/ --include="*.jsx" --include="*.js" | grep -v "node_modules" | while read line; do
  echo "   $line"
done
TOTAL_MAP_O=$(grep -rn "map((o)\|map(o =>" components/ pages/ hooks/ context/ lib/ --include="*.jsx" --include="*.js" | grep -v "node_modules" | wc -l)
echo "   Total: $TOTAL_MAP_O arquivo(s) com map((o))"

# ==========================================
# 3. 'o.' SOLTO (referência a propriedade de 'o' que escapou do sed)
# ==========================================
echo ""
echo "🟡 ALERTA 3: 'o.' que pode ser referência a propriedade da variável de map"
echo "------------------------------------------"
grep -rn "\bo\." components/memorial/steps/ --include="*.jsx" | grep -v "node_modules" | grep -v "OPCOES\|opcao\|onSelect\|onChange\|onClick\|onFocus\|onBlur\|onError\|onUpload\|onRemover\|role\|style\|const o\|let o\|var o\|opcao\." | head -n 30 | while read line; do
  echo "   $line"
done
TOTAL_O_DOT=$(grep -rn "\bo\." components/memorial/steps/ --include="*.jsx" | grep -v "node_modules" | grep -v "OPCOES\|opcao\|onSelect\|onChange\|onClick\|onFocus\|onBlur\|onError\|onUpload\|onRemover\|role\|style\|const o\|let o\|var o\|opcao\." | wc -l)
echo "   Total: $TOTAL_O_DOT ocorrência(s) suspeita(s)"

# ==========================================
# 4. ANIMAÇÕES — Verificar se pulse visual está intacto
# ==========================================
echo ""
echo "🟡 ALERTA 4: Animações (pulse visual) — verificando sintaxe"
echo "------------------------------------------"
echo "   Arquivos com cardPulsando + transform/boxShadow:"
grep -rln "cardPulsando" components/memorial/steps/ --include="*.jsx" | wc -l | xargs echo "   "
echo "   Amostra de verificação (primeiros 5 arquivos):"
grep -rn "cardPulsando.*scale\|boxShadow.*cardPulsando\|transform.*scale.*cardPulsando" components/memorial/steps/ --include="*.jsx" | head -n 5 | while read line; do
  echo "   $line"
done

# Verificar se há 'setCardPulsando' sem 'useState' ou com typo
echo ""
echo "   Verificando se 'setCardPulsando' existe sem declaração:"
grep -rn "setCardPulsando" components/memorial/steps/ --include="*.jsx" | grep -v "useState" | grep -v "const \[cardPulsando" | head -n 10 | while read line; do
  echo "   $line"
done

# ==========================================
# 5. STRINGS/COMENTÁRIOS CORROMPIDOS
# ==========================================
echo ""
echo "🟡 ALERTA 5: Strings e comentários possivelmente corrompidos"
echo "------------------------------------------"
echo "   Procurando 'opcao' dentro de strings/comentários (pode indicar sed que pegou texto):"
grep -rn '"opcao\|// opcao\|/* opcao' components/memorial/steps/ --include="*.jsx" | head -n 10 | while read line; do
  echo "   $line"
done

# ==========================================
# 6. VARIÁVEIS 'o' EM OUTROS DIRETÓRIOS
# ==========================================
echo ""
echo "🟡 ALERTA 6: 'o' como variável em outros diretórios (fora de steps)"
echo "------------------------------------------"
echo "   components/ (fora de memorial/steps):"
grep -rn "map((o)\|map(o =>" components/ --include="*.jsx" --include="*.js" | grep -v "memorial/steps" | grep -v "node_modules" | head -n 10 | while read line; do
  echo "   $line"
done
echo "   hooks/:"
grep -rn "map((o)\|map(o =>" hooks/ --include="*.js" --include="*.jsx" | grep -v "node_modules" | head -n 5 | while read line; do
  echo "   $line"
done
echo "   context/:"
grep -rn "map((o)\|map(o =>" context/ --include="*.js" --include="*.jsx" | grep -v "node_modules" | head -n 5 | while read line; do
  echo "   $line"
done
echo "   pages/:"
grep -rn "map((o)\|map(o =>" pages/ --include="*.jsx" --include="*.js" | grep -v "node_modules" | head -n 5 | while read line; do
  echo "   $line"
done

# ==========================================
# 7. RESUMO
# ==========================================
echo ""
echo "=========================================="
echo "  RESUMO DA AUDITORIA"
echo "=========================================="
echo "1. 'o' solto em callbacks nos steps:     $TOTAL_O_CALLBACKS"
echo "2. 'map((o)' em todo o projeto:          $TOTAL_MAP_O"
echo "3. 'o.' suspeito em steps:               $TOTAL_O_DOT"
echo ""
echo "Se qualquer número acima for > 0, precisa de correção."
echo "=========================================="