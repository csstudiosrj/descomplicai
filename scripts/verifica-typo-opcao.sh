#!/bin/bash

echo "=========================================="
echo "  DIAGNÓSTICO: TYPOS 'opcao' NO MEMORIAL"
echo "=========================================="
echo ""

STEPS_DIR="components/memorial/steps"
BACKUP_DIR="backups/typo-opcao-$(date +%Y%m%d-%H%M%S)"

# Cria pasta de backup
mkdir -p "$BACKUP_DIR"
echo "📁 Backup será salvo em: $BACKUP_DIR"
echo ""

# 1. Lista todos os arquivos .jsx no diretório
TOTAL_ARQUIVOS=$(find "$STEPS_DIR" -maxdepth 1 -name "*.jsx" | wc -l)
echo "📄 Total de arquivos .jsx em $STEPS_DIR: $TOTAL_ARQUIVOS"
echo ""

# 2. Verifica variações do typo
echo "🔍 Buscando variações do typo..."
echo "------------------------------------------"

for PADRAO in "opcaopcao" "opcaopcaopcao" "opcaopcaopcaopcao"; do
    OCORRENCIAS=$(grep -rn "$PADRAO" "$STEPS_DIR" | wc -l)
    if [ "$OCORRENCIAS" -gt 0 ]; then
        echo "❌ '$PADRAO' encontrado: $OCORRENCIAS ocorrência(s)"
        echo "   Arquivos afetados:"
        grep -rln "$PADRAO" "$STEPS_DIR" | while read -r f; do
            echo "     - $f"
        done
        echo ""
    else
        echo "✅ '$PADRAO' não encontrado."
    fi
done

echo "------------------------------------------"

# 3. Mostra linhas exatas com contexto (primeiras 20 ocorrências)
echo ""
echo "📋 Primeiras 20 ocorrências com contexto:"
echo "------------------------------------------"
grep -rn "opcaopcao" "$STEPS_DIR" | head -n 20
echo ""

# 4. Verifica se a variável correta 'opcao' ainda existe (isolada, não como parte do typo)
echo "🔍 Verificando se 'opcao' (correta) ainda existe isoladamente..."
OPCAO_CORRETA=$(grep -rn "\bopcao\b" "$STEPS_DIR" | grep -v "opcaopcao" | grep -v "opcaopcaopcao" | wc -l)
echo "   Ocorrências de 'opcao' isolada (excluindo typos): $OPCAO_CORRETA"
echo ""

# 5. Verifica se há 'opcaopcao' dentro de strings/objetos vs variáveis
echo "🔍 Amostra de contexto (mostrando como o typo aparece):"
echo "------------------------------------------"
grep -rn "opcaopcao" "$STEPS_DIR" | head -n 10 | while read -r line; do
    echo "   $line"
done
echo ""

# 6. Contagem final
TOTAL_TYPO=$(grep -rn "opcaopcao\|opcaopcaopcao" "$STEPS_DIR" | wc -l)
echo "=========================================="
echo "  RESUMO"
echo "=========================================="
echo "Total de arquivos .jsx:        $TOTAL_ARQUIVOS"
echo "Total de ocorrências de typo:  $TOTAL_TYPO"
echo "Arquivos com typo:             $(grep -rln 'opcaopcao' '$STEPS_DIR' 2>/dev/null | wc -l)"
echo ""
echo "✅ Diagnóstico concluído."
echo "💾 Backup dos arquivos originais será feito ANTES de qualquer correção."
echo "=========================================="