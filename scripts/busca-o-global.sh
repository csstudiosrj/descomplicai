#!/bin/bash
# Busca global por 'o.' suspeito em todo o projeto

echo "Buscando 'o.' em todo o projeto..."
echo "========================================"

# Busca em todos os arquivos JSX e JS
grep -rn "\bo\." components/ pages/ hooks/ context/ lib/ --include="*.jsx" --include="*.js" 2>/dev/null | \
grep -v "node_modules" | \
grep -v "OPCOES\|opcao\|onSelect\|onChange\|onClick\|onFocus\|onBlur\|onError\|onUpload\|onRemover\|role\|style\|const o\|let o\|var o\|opcao\." | \
grep -v "for (let o\|for (const o\|function o\|=> o\.\|o =\|o)\|o,\|o}\|o]\|o|\|o?\|typeof o\|instanceof o\|delete o\|in o\|of o\|return o\.\|await o\.\|catch (o)" | \
head -n 40

echo "========================================"
echo "Fim da busca"