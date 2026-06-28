#!/bin/bash
# fix-v4.sh — correcoes cirurgicas nas causas raiz
# bash fix-v4.sh

set -e

echo ">>> 1/2 BreathTransition.module.css — wrapper precisa de height: 100%"
# O wrapper sem height faz o orchestrator (height:100%) colapsar
# gerando a barra branca embaixo no memorial
awk '
/.wrapper \{/ { 
  print ".wrapper {"
  print "  position: relative;"
  print "  height: 100%;"
  print "}"
  found=1
  skip=1
  next
}
skip && /\}/ { skip=0; next }
skip { next }
{ print }
' components/memorial/BreathTransition.module.css > /tmp/bt.css \
  && mv /tmp/bt.css components/memorial/BreathTransition.module.css
echo "    height: 100% adicionado ao .wrapper"

echo ""
echo ">>> 2/2 styles/globals.css — footer fora do fluxo de scroll"
# O problema: #main-content tem min-height:100vh e flex column
# O footer tem margin-top:auto — mas se a página tem height fixa ou overflow,
# o footer some. Removemos min-height:100vh e deixamos o layout crescer naturalmente.
awk '
/#main-content \{/ { in_main=1 }
in_main && /min-height/ { next }
in_main && /\}/ { in_main=0 }
{ print }
' styles/globals.css > /tmp/globals.css \
  && mv /tmp/globals.css styles/globals.css
echo "    min-height removido do #main-content"

echo ""
echo "Verificando resultados:"
grep -A5 "\.wrapper" components/memorial/BreathTransition.module.css
echo "---"
grep -A6 "#main-content" styles/globals.css

echo ""
echo "Pronto. Commit e push:"
echo "  git add -A && git commit -m 'fix: breath wrapper height, remove main min-height' && git push"