#!/bin/bash
# fix-v8.sh
# bash fix-v8.sh

set -e

echo ">>> MemorialOrchestrator.jsx — container height:100%, footer fora do BreathTransition"

# 1. Trocar minHeight: '100vh' por height: '100%' no container externo
sed -i "s/position: 'relative', minHeight: '100vh'/position: 'relative', height: '100%', display: 'flex', flexDirection: 'column'/" \
  components/memorial/MemorialOrchestrator.jsx

# 2. Mover o Footer: tirar de dentro do BreathTransition e colocar depois dele
# Remover {estado.etapaAtual === 0 && <Footer />} de dentro do BreathTransition
sed -i "/{estado\.etapaAtual === 0 && <Footer \/>}/d" \
  components/memorial/MemorialOrchestrator.jsx

# 3. Inserir Footer após o fechamento do BreathTransition, ainda dentro do bloco principal
sed -i "s|              </BreathTransition>|              </BreathTransition>\n              {estado.etapaAtual === 0 \&\& <Footer />}|" \
  components/memorial/MemorialOrchestrator.jsx

echo "    Orchestrator corrigido"

echo ""
echo "Verificando:"
grep -n "Footer\|minHeight\|100vh\|height.*100" components/memorial/MemorialOrchestrator.jsx | head -10

echo ""
echo "Commit e push:"
echo "  git add -A && git commit -m 'fix: footer fora do BreathTransition, container height 100%' && git push"