#!/bin/bash
# fix_o_desc.sh — Correção cirúrgica de o.desc → opcao.desc
# Só muda quando 'o.desc' é palavra isolada, NÃO toca em 'opcao.desc'

echo "🔧 Corrigindo o.desc → opcao.desc em todos os steps..."

# Lista todos os arquivos .jsx na pasta steps (exceto backup)
files=$(find components/memorial/steps/ -maxdepth 1 -name "*.jsx" -type f)

count=0
for file in $files; do
  # Verifica se tem o.desc como palavra isolada (usando regex de word boundary)
  if grep -q '\bo\.desc\b' "$file"; then
    # Substitui o.desc → opcao.desc apenas quando é palavra isolada
    sed -i 's/\bo\.desc\b/opcao.desc/g' "$file"
    echo "   ✅ Corrigido: $(basename "$file")"
    count=$((count + 1))
  fi
done

echo ""
echo "=========================================="
echo "✅ $count arquivos corrigidos"
echo "=========================================="