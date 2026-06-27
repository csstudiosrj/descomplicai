#!/bin/bash
# ============================================================
# FILE TREE LIMPA — Projeto Descomplicaí
# ============================================================

OUTPUT="filetree.txt"

echo "Gerando file tree limpa..."

tree -I 'node_modules|.git|.next|out|dist|.vercel|coverage|.cache|*.log|*.lock|package-lock.json|yarn.lock|pnpm-lock.yaml' --dirsfirst -a > "$OUTPUT" 2>/dev/null

if [ $? -ne 0 ]; then
  echo "tree não encontrado. Usando find + sort..."
  find . \
    -not -path '*/node_modules/*' \
    -not -path '*/.git/*' \
    -not -path '*/.next/*' \
    -not -path '*/out/*' \
    -not -path '*/dist/*' \
    -not -path '*/.vercel/*' \
    -not -path '*/coverage/*' \
    -not -path '*/.cache/*' \
    -not -name '*.log' \
    -not -name 'package-lock.json' \
    -not -name 'yarn.lock' \
    -not -name 'pnpm-lock.yaml' \
    | sort > "$OUTPUT"
fi

echo ""
echo "✅ File tree salva em: $OUTPUT"
echo "   Total de linhas: $(wc -l < $OUTPUT)"
echo ""
echo "Cole o conteúdo de $OUTPUT aqui no chat."
