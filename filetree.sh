#!/bin/bash
# filetree.sh - Gera árvore de arquivos limpa do projeto Descomplicaí
# Uso: bash filetree.sh

OUTPUT_FILE="descomplicai-filetree.txt"

# Limpa arquivo anterior
> "$OUTPUT_FILE"

# Cabeçalho
echo "Descomplicaí — File Tree" >> "$OUTPUT_FILE"
echo "Gerado em: $(date)" >> "$OUTPUT_FILE"
echo "========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Gera a árvore excluindo arquivos/diretórios do sistema
tree -a -I 'node_modules|.git|.next|dist|build|coverage|.vercel|out|*.log|*.lock|package-lock.json|yarn.lock|pnpm-lock.yaml|.env*|.DS_Store|Thumbs.db|.vscode|.idea|*.swp|*.swo|*~' --dirsfirst >> "$OUTPUT_FILE" 2>/dev/null

# Fallback se tree não estiver instalado
if [ $? -ne 0 ]; then
    echo "'tree' não encontrado. Usando fallback com find..." >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    find . -not -path '*/\.git/*' -not -path '*/node_modules/*' -not -path '*/\.next/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/coverage/*' -not -path '*/\.vercel/*' -not -path '*/out/*' -not -name '*.log' -not -name 'package-lock.json' -not -name 'yarn.lock' -not -name 'pnpm-lock.yaml' -not -name '.env*' -not -name '.DS_Store' -not -name 'Thumbs.db' -not -path '*/\.vscode/*' -not -path '*/\.idea/*' -not -name '*.swp' -not -name '*.swo' -not -name '*~' | sort >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"
echo "========================================" >> "$OUTPUT_FILE"
echo "Total de arquivos listados: $(grep -c '^' "$OUTPUT_FILE")" >> "$OUTPUT_FILE"

echo "✅ File tree salva em: $OUTPUT_FILE"