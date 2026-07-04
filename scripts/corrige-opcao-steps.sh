#!/bin/bash
# Corrige o typo sistêmico opcaopcao/opcaopcaopcao → opcao
# Causado por sed mal executado em fix-todos-os-o.sh
# ORDEM OBRIGATÓRIA: duplas primeiro, simples depois

set -e

STEPS_DIR="components/memorial/steps"
BACKUP_DIR="backups/typo-opcao-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "  CORREÇÃO: opcaopcao → opcao"
echo "  Backup: $BACKUP_DIR"
echo "=========================================="

# 1. BACKUP
echo ""
echo ">> [1/3] Criando backup de TODOS os .jsx em $STEPS_DIR..."
mkdir -p "$BACKUP_DIR"
find "$STEPS_DIR" -maxdepth 1 -name "*.jsx" -exec cp {} "$BACKUP_DIR/" \;
ARQUIVOS_BACKUP=$(ls "$BACKUP_DIR" | wc -l)
echo "   ✅ $ARQUIVOS_BACKUP arquivos copiados para $BACKUP_DIR"

# 2. PASSADA 1: corrige as duplas (opcaopcaopcao → opcao)
echo ""
echo ">> [2/3] Passada 1: corrigindo opcaopcaopcao → opcao..."
CONTADOR_DUPLAS=0
for arquivo in "$STEPS_DIR"/*.jsx; do
    if grep -q "opcaopcaopcao" "$arquivo" 2>/dev/null; then
        sed -i 's/opcaopcaopcao/opcao/g' "$arquivo"
        CONTADOR_DUPLAS=$((CONTADOR_DUPLAS + 1))
    fi
done
echo "   ✅ $CONTADOR_DUPLAS arquivo(s) com dupla correção aplicada"

# 3. PASSADA 2: corrige as simples (opcaopcao → opcao)
echo ""
echo ">> [3/3] Passada 2: corrigindo opcaopcao → opcao..."
CONTADOR_SIMPLES=0
for arquivo in "$STEPS_DIR"/*.jsx; do
    if grep -q "opcaopcao" "$arquivo" 2>/dev/null; then
        sed -i 's/opcaopcao/opcao/g' "$arquivo"
        CONTADOR_SIMPLES=$((CONTADOR_SIMPLES + 1))
    fi
done
echo "   ✅ $CONTADOR_SIMPLES arquivo(s) com simples correção aplicada"

# 4. VERIFICAÇÃO
echo ""
echo "=========================================="
echo "  VERIFICAÇÃO FINAL"
echo "=========================================="
RESTANTES=$(grep -rn "opcaopcaopcao\|opcaopcao" "$STEPS_DIR" | wc -l)
echo "Ocorrências restantes de typo: $RESTANTES"
echo ""

if [ "$RESTANTES" -eq 0 ]; then
    echo "✅ SUCESSO: Nenhum typo restante!"
    echo ""
    echo "Backup salvo em: $BACKUP_DIR"
    echo "Para reverter se necessário: cp $BACKUP_DIR/* $STEPS_DIR/"
else
    echo "❌ FALHA: Ainda existem $RESTANTES ocorrências de typo."
    echo "Arquivos com typo restante:"
    grep -rln "opcaopcaopcao\|opcaopcao" "$STEPS_DIR"
    echo ""
    echo "Verifique manualmente ou rode o script novamente."
    exit 1
fi

echo ""
echo "=========================================="
echo "  CORREÇÃO CONCLUÍDA"
echo "=========================================="