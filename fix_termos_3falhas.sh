#!/bin/bash

DIR="components/memorial/steps"
ARQUIVOS=("StepH5AulaDanca.jsx" "StepI4AulasDanca.jsx" "StepM2FotosLuaDeMel.jsx")
IMPORT_LINE='import { getTermos } from '\''../../../utils/linguagemCasal'\'';'
TERMOS_LINE='  const termos = getTermos(perfil);'

echo "🔧 Corrigindo 3 arquivos com termos órfão..."

for fname in "${ARQUIVOS[@]}"; do
    fpath="$DIR/$fname"
    
    if [ ! -f "$fpath" ]; then
        echo "⚠️  $fname não encontrado. Pulando."
        continue
    fi

    # Backup
    cp "$fpath" "$fpath.bak"
    
    # 1. Adiciona import se não existir
    if ! grep -q "import.*getTermos" "$fpath"; then
        # Insere após a última linha que começa com "import"
        sed -i '/^import /a\'"$IMPORT_LINE" "$fpath"
        echo "  ✅ $fname: import getTermos adicionado"
    else
        echo "  ➖ $fname: import getTermos já existe"
    fi

    # 2. Adiciona const termos = getTermos(perfil); se não existir
    if ! grep -q "const termos = getTermos" "$fpath"; then
        # Insere antes da primeira linha que tenha "return (" ou "return <"
        sed -i '/return (\\|return </i\'"$TERMOS_LINE" "$fpath"
        echo "  ✅ $fname: const termos adicionado antes do return"
    else
        echo "  ➖ $fname: const termos já existe"
    fi

    # 3. Verificação rápida
    tem_termos=$(grep -c "termos\." "$fpath")
    tem_declaracao=$(grep -c "const termos = getTermos" "$fpath")
    tem_import=$(grep -c "import.*getTermos" "$fpath")

    if [ "$tem_import" -gt 0 ] && [ "$tem_declaracao" -gt 0 ]; then
        echo "  🎉 $fname: OK"
    else
        echo "  ❌ $fname: AINDA COM PROBLEMA — revise manualmente"
    fi
done

echo ""
echo "🚀 Rode a auditoria novamente para confirmar:"
echo "   bash auditoria_step_correcao.sh"