#!/bin/bash
echo "=========================================="
echo "   AUDIT — Portal do Cerimonialista"
echo "   Data: $(date)"
echo "=========================================="
echo ""

echo ">>> 1. GIT STATUS"
echo "Branch atual:"
git branch --show-current
echo ""
echo "Últimos 10 commits:"
git log --oneline -10
echo ""
echo "Arquivos modificados (uncommitted):"
git status --short
echo ""
echo "Arquivos criados recentemente (últimos 7 dias):"
git log --diff-filter=A --summary --name-only --pretty=format: -10 | grep -E '^\s+\S+' | sort | uniq
echo ""

echo ">>> 2. FILE TREE — Portal Cerimonialista"
find . -type f \( \
  -path "*/pages/cerimonialista/*" \
  -o -path "*/pages/api/cerimonialista/*" \
  -o -path "*/hooks/useAuth.js" \
  -o -path "*/pages/login.jsx" \
  -o -path "*/components/ui/Icon.jsx" \
  -o -path "*/context/AuthContext.jsx" \
  -o -path "*/lib/supabase.js" \
  -o -path "*/utils/catalogoFornecedores.js" \
  -o -path "*/styles/*" \
\) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" | sort
echo ""

echo ">>> 3. HEAD DOS ARQUIVOS CHAVE"
for file in \
  "hooks/useAuth.js" \
  "pages/login.jsx" \
  "components/ui/Icon.jsx" \
  "pages/cerimonialista/cadastro.jsx" \
  "pages/cerimonialista/painel.jsx" \
  "pages/api/cerimonialista/cadastro.js" \
  "context/AuthContext.jsx" \
  "lib/supabase.js"
do
  if [ -f "$file" ]; then
    echo "--- $file (primeiras 5 linhas) ---"
    head -n 5 "$file"
    echo "--- $file (últimas 5 linhas) ---"
    tail -n 5 "$file"
    echo "Tamanho: $(wc -l < "$file") linhas"
  else
    echo ">>> ARQUIVO AUSENTE: $file"
  fi
  echo ""
done

echo ">>> 4. ARQUIVOS DE PENDÊNCIAS / FUNIL / CHAT / ROTEIRO"
find . -type f \( \
  -iname "*funil*" \
  -o -iname "*lead*" \
  -o -iname "*chat*" \
  -o -iname "*mensagem*" \
  -o -iname "*roteiro*" \
  -o -iname "*modelo*" \
  -o -iname "*financeiro*" \
  -o -iname "*vitrine*" \
  -o -iname "*assistente*" \
  -o -iname "*convite*" \
  -o -iname "*espelho*" \
  -o -iname "*painel*" \
\) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" | sort
echo ""

echo ">>> 5. CSS VARIABLES"
find . -name "*.css" -o -name "*.scss" -o -name "*.module.css" | head -20
grep -r "var(--color-" . --include="*.css" --include="*.jsx" --include="*.js" -l 2>/dev/null | head -10
echo ""

echo ">>> 6. TABELAS DE MESAS (outro chat)"
find . -type f \( -iname "*mesa*" -o -iname "*table*" \) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" | sort
echo ""

echo ">>> 7. ENV / SUPABASE"
if [ -f ".env.local" ]; then
  echo ".env.local existe (NÃO deve existir no projeto!)"
  grep -E "SUPABASE|NEXT_PUBLIC" .env.local | sed 's/=.*/=***/'
else
  echo ".env.local: NÃO existe (OK)"
fi
echo ""

echo ">>> 8. DEPENDÊNCIAS RELEVANTES"
if [ -f "package.json" ]; then
  grep -E "supabase|@supabase|dnd|drag|kanban|socket|chat|stripe|firebase" package.json | head -20
fi
echo ""

echo "=========================================="
echo "   FIM DO AUDIT"
echo "=========================================="
