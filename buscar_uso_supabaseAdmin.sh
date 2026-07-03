#!/bin/bash
# ============================================================
# Script: buscar_uso_supabaseAdmin.sh
# Proposito: Verificar TODOS os arquivos que usam supabaseAdmin
#            e global.headers.Authorization no projeto
# ============================================================

echo "=========================================="
echo "BUSCA: supabaseAdmin"
echo "=========================================="
echo ""

# Buscar todos os arquivos que importam ou usam supabaseAdmin
echo "[1] Arquivos que IMPORTAM supabaseAdmin:"
echo "------------------------------------------"
grep -rn "supabaseAdmin" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . | grep -E "(import|from|require)" | sort

echo ""
echo "[2] Arquivos que USAM supabaseAdmin (chamadas .from, .auth, etc):"
echo "-------------------------------------------------------------------"
grep -rn "supabaseAdmin\." --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . | grep -v "import" | grep -v "from" | sort

echo ""
echo "=========================================="
echo "BUSCA: global.headers.Authorization"
echo "=========================================="
echo ""

echo "[3] Arquivos com 'global.headers.Authorization':"
echo "------------------------------------------------"
grep -rn "global.headers.Authorization" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . | sort

echo ""
echo "[4] Arquivos com 'Authorization.*Bearer.*SUPABASE_SERVICE_ROLE_KEY':"
echo "----------------------------------------------------------------------"
grep -rn "Authorization.*Bearer" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . | grep -i "service_role\|supabaseServiceKey" | sort

echo ""
echo "=========================================="
echo "BUSCA: SUPABASE_SERVICE_ROLE_KEY"
echo "=========================================="
echo ""

echo "[5] Arquivos que referenciam SUPABASE_SERVICE_ROLE_KEY:"
echo "--------------------------------------------------------"
grep -rn "SUPABASE_SERVICE_ROLE_KEY" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . | sort

echo ""
echo "=========================================="
echo "RESUMO POR PASTA (supabaseAdmin)"
echo "=========================================="
echo ""
grep -rln "supabaseAdmin" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . | sort | awk -F/ '{print $2}' | sort | uniq -c | sort -rn

echo ""
echo "=========================================="
echo "LISTA COMPLETA DE ARQUIVOS (supabaseAdmin)"
echo "=========================================="
echo ""
grep -rln "supabaseAdmin" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . | sort

echo ""
echo "=========================================="
echo "FIM DA BUSCA"
echo "=========================================="