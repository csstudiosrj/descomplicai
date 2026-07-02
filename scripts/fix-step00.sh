#!/bin/bash
# Corrige o erro de variavel trocada no Step00Casal.jsx

sed -i 's/setCardPulsando(o\.valor)/setCardPulsando(opcao.valor)/g' components/memorial/steps/Step00Casal.jsx
sed -i 's/onSelect(o\.campo || o\.valor, o\.valor, o\.cor)/onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor)/g' components/memorial/steps/Step00Casal.jsx

echo "✅ Corrigido Step00Casal.jsx"
echo "Verificando:"
grep -n "setCardPulsando\|onSelect" components/memorial/steps/Step00Casal.jsx | head -n 5