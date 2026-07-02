#!/bin/bash
# Script de debug profundo para encontrar a causa do erro "o is not defined"
# Varre todo o projeto procurando por padroes suspeitos

echo "========================================"
echo "DEBUG PROFUNDO - Erro 'o is not defined'"
echo "========================================"

# 1. Procurar todos .map() em dados dinamicos (nao em arrays estaticos como OPCOES)
echo ""
echo ">> 1. .map() EM DADOS DINAMICOS (suspeitos):"
echo "-----------------------------------"
grep -rn "\.map(" components/memorial/steps/ --include="*.jsx" 2>/dev/null | grep -v "OPCOES.map\|opcoes.map\|options.map\|ITEMS.map" | head -n 30

# 2. Procurar uso de variavel 'o' como parametro de map (minificado pode ser isso)
echo ""
echo ">> 2. VARIAVEL 'o' COMO PARAMETRO DE MAP:"
echo "-----------------------------------"
grep -rn "map((o)" components/ pages/ --include="*.jsx" --include="*.js" 2>/dev/null | grep -v node_modules | head -n 20

# 3. Procurar onde dados do Supabase sao usados sem fallback || []
echo ""
echo ">> 3. DADOS DO SUPABASE SEM FALLBACK []:"
echo "-----------------------------------"
grep -rn "data\.\w*\.map\|data\?.\w*\.map\|result\.\w*\.map\|rows\.\w*\.map" components/ pages/ --include="*.jsx" --include="*.js" 2>/dev/null | grep -v node_modules | head -n 20

# 4. Procurar em hooks e contextos
echo ""
echo ">> 4. .map() EM HOOKS E CONTEXTOS:"
echo "-----------------------------------"
grep -rn "\.map(" hooks/ context/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules | head -n 20

# 5. Verificar MemorialOrchestrator - o que ele passa pros steps
echo ""
echo ">> 5. PROPS PASSADAS PELO MEMORIALORCHESTRATOR:"
echo "-----------------------------------"
grep -n "StepComponent\|estado={\|onSelect=\|onConcluir=" components/memorial/MemorialOrchestrator.jsx

# 6. Verificar se algum step recebe 'estado' e faz destructuring que pode falhar
echo ""
echo ">> 6. STEPS COM DESTRUCTURING DE 'estado':"
echo "-----------------------------------"
grep -rn "function Step.*({ estado\|export default function.*({ estado\|({ estado," components/memorial/steps/ --include="*.jsx" 2>/dev/null | head -n 10

# 7. Verificar BreathTransition (renderiza os steps)
echo ""
echo ">> 7. BREATHTRANSITION - RENDERIZACAO:"
echo "-----------------------------------"
grep -n "children\|map\|React.Children" components/memorial/BreathTransition.jsx 2>/dev/null

# 8. Verificar se tem algum arquivo com erro de sintaxe recente
echo ""
echo ">> 8. ARQUIVOS MODIFICADOS RECENTEMENTE (ultimos 3 commits):"
echo "-----------------------------------"
git diff --name-only HEAD~3 2>/dev/null | grep -E "\.jsx$|\.js$" | head -n 20

echo ""
echo "========================================"
echo "FIM DO DEBUG"
echo "========================================"