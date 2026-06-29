#!/bin/bash

# ============================================
# AUDITORIA FORENSE - Step*.jsx Correções
# Verifica: 1) opcao. fantasma  2) termos órfão
# ============================================

DIR="components/memorial/steps"
REPORT="/tmp/auditoria_steps.txt"
FAIL=0

echo "🔍 INICIANDO AUDITORIA DOS Step*.jsx"
echo "====================================" > $REPORT
echo "Data: $(date)" >> $REPORT
echo "" >> $REPORT

# -------------------------------------------------
# CHECK 1: Arquivos que ainda usam 'opcao.' dentro de .map()
# -------------------------------------------------
echo "📋 CHECK 1: Referência fantasma 'opcao.' em loops .map()" >> $REPORT
echo "------------------------------------------------" >> $REPORT

for file in $DIR/Step*.jsx; do
    if [ ! -f "$file" ]; then
        echo "⚠️  Nenhum arquivo encontrado em $DIR/Step*.jsx" >> $REPORT
        break
    fi

    # Pega o nome do arquivo
    fname=$(basename "$file")
    
    # Verifica se existe 'opcao.' no arquivo
    if grep -q "opcao\." "$file"; then
        # Verifica se existe uma declaração legítima de 'opcao' (const opcao, ou parâmetro de map)
        # Se NÃO existe const/opcao como parâmetro, é fantasma
        tem_declaracao=$(grep -c "\bopcao\b" "$file")
        tem_map_opcao=$(grep -c "\.map.*opcao" "$file")
        
        if [ "$tem_map_opcao" -eq 0 ]; then
            echo "❌ FAIL: $fname -> 'opcao.' encontrado, mas 'opcao' NÃO é parâmetro de .map() nem const" >> $REPORT
            FAIL=$((FAIL+1))
        else
            echo "✅ PASS: $fname -> 'opcao.' é parâmetro legítimo de .map()" >> $REPORT
        fi
    else
        echo "✅ PASS: $fname -> nenhum 'opcao.' encontrado" >> $REPORT
    fi
done

echo "" >> $REPORT

# -------------------------------------------------
# CHECK 2: Arquivos que usam 'termos.' sem import/getTermos
# -------------------------------------------------
echo "📋 CHECK 2: Variável 'termos' órfã (usada sem getTermos)" >> $REPORT
echo "------------------------------------------------" >> $REPORT

for file in $DIR/Step*.jsx; do
    if [ ! -f "$file" ]; then
        break
    fi
    
    fname=$(basename "$file")
    
    if grep -q "termos\." "$file"; then
        tem_import=$(grep -c "import.*getTermos" "$file")
        tem_declaracao=$(grep -c "const termos = getTermos" "$file")
        
        if [ "$tem_import" -eq 0 ] || [ "$tem_declaracao" -eq 0 ]; then
            echo "❌ FAIL: $fname" >> $REPORT
            if [ "$tem_import" -eq 0 ]; then
                echo "   └─ Falta: import { getTermos } from '../../../utils/linguagemCasal'" >> $REPORT
            fi
            if [ "$tem_declaracao" -eq 0 ]; then
                echo "   └─ Falta: const termos = getTermos(...)" >> $REPORT
            fi
            FAIL=$((FAIL+1))
        else
            echo "✅ PASS: $fname -> termos. está corretamente importado e declarado" >> $REPORT
        fi
    else
        echo "➖ SKIP: $fname -> não usa termos." >> $REPORT
    fi
done

echo "" >> $REPORT

# -------------------------------------------------
# CHECK 3: Erros de padrão comum em .map() (o. vs opcao.)
# -------------------------------------------------
echo "📋 CHECK 3: Consistência de variáveis em .map() (heurística)" >> $REPORT
echo "------------------------------------------------" >> $REPORT

for file in $DIR/Step*.jsx; do
    if [ ! -f "$file" ]; then
        break
    fi
    
    fname=$(basename "$file")
    
    # Procura por .map((o) => ... e depois verifica se há uso de 'opcao.' no mesmo arquivo (já coberto no check 1)
    # Mas vamos verificar se há .map((op) => ... usando 'o.' (erro inverso)
    tem_map_op=$(grep -c "\.map((op)" "$file")
    tem_o_ponto=$(grep -c "\bo\." "$file")
    
    # Se tem .map((op) e usa o. em vez de op., pode ser erro
    if [ "$tem_map_op" -gt 0 ] && [ "$tem_o_ponto" -gt 0 ]; then
        # Verifica se 'o.' aparece dentro do contexto do .map((op) - heurística simples
        # Se o arquivo tem ambos, sinaliza para revisão manual
        echo "⚠️  WARN: $fname -> tem .map((op) e também usa 'o.' no arquivo. Revisar manualmente." >> $REPORT
    fi
done

echo "" >> $REPORT
echo "====================================" >> $REPORT
echo "RESUMO: $FAIL falhas encontradas" >> $REPORT
echo "====================================" >> $REPORT

if [ $FAIL -eq 0 ]; then
    echo ""
    echo "🎉 AUDITORIA CONCLUÍDA: ZERO FALHAS. Pode commitar com segurança."
    echo "   Relatório completo salvo em: $REPORT"
    echo ""
    cat $REPORT
    exit 0
else
    echo ""
    echo "🚨 AUDITORIA CONCLUÍDA: $FAIL FALHAS ENCONTRADAS. NÃO COMMITE AINDA."
    echo "   Relatório completo salvo em: $REPORT"
    echo ""
    cat $REPORT
    exit 1
fi