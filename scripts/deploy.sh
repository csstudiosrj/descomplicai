#!/bin/bash
# Script de deploy na Vercel - Tarefa 1
set -e

echo "=== DEPLOY DESCOMPLICAÍ v1.0 ==="

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "ERRO: Não é um repositório git. Inicializando..."
    git init
    git branch -M main
fi

# Adicionar todos os arquivos
echo "[1/4] Adicionando arquivos..."
git add -A

# Commit
echo "[2/4] Criando commit..."
git commit -m "feat: dashboard admin + analytics + configurações — lançamento v1.0"

# Push
echo "[3/4] Enviando para origin main..."
git push origin main

# Verificar build na Vercel
echo "[4/4] Verificando build na Vercel..."
echo "Acesse: https://vercel.com/dashboard"
echo "Verifique os logs de build do projeto Descomplicaí"

echo "=== DEPLOY CONCLUÍDO ==="
