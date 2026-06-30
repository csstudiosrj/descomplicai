#!/bin/bash
set -euo pipefail

# ============================================================
# Restore do Supabase — Descomplicaí
# Uso: ./scripts/restore.sh <schema.sql> [data.sql]
# ATENCAO: Operacao destrutiva. Sempre faca backup antes.
# ============================================================

SCHEMA_FILE="${1:-}"
DATA_FILE="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Carrega variaveis do .env.local se existir
if [ -f "$PROJECT_ROOT/.env.local" ]; then
  set -a
  source "$PROJECT_ROOT/.env.local"
  set +a
fi

# Validacao
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados."
  exit 1
fi

if [ -z "$SCHEMA_FILE" ] || [ ! -f "$SCHEMA_FILE" ]; then
  echo "Uso: $0 <schema.sql> [data.sql]"
  echo "   O arquivo schema.sql e obrigatorio."
  exit 1
fi

PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https?://||' | sed -E 's/\.supabase\.co.*//')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo ""
echo "============================================================"
echo "  RESTORE DO BANCO DE DADOS — DESCOMPLICAÍ"
echo "  Operacao DESTRUTIVA. Todos os dados serao sobrescritos."
echo "============================================================"
echo ""
echo "  Projeto: $PROJECT_REF"
echo "  Host:    $DB_HOST"
echo "  Schema:  $SCHEMA_FILE"
[ -n "$DATA_FILE" ] && echo "  Data:    $DATA_FILE"
echo ""

read -p "Tem certeza que deseja continuar? Digite 'RESTAURAR' para confirmar: " CONFIRM
if [ "$CONFIRM" != "RESTAURAR" ]; then
  echo "Operacao cancelada."
  exit 0
fi

echo ""
echo "Restaurando schema..."
PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --file="$SCHEMA_FILE" \
  --set ON_ERROR_STOP=on

echo "   OK Schema restaurado."

if [ -n "$DATA_FILE" ] && [ -f "$DATA_FILE" ]; then
  echo "Restaurando dados..."
  PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --file="$DATA_FILE" \
    --set ON_ERROR_STOP=on
  echo "   OK Dados restaurados."
fi

echo ""
echo "============================================================"
echo "  IMPORTANTE — Verifique manualmente:"
echo "============================================================"
echo ""
echo "  1. RLS (Row Level Security):"
echo "     pg_dump NAO restaura policies/RLS automaticamente"
echo "     em todos os casos. Verifique no painel do Supabase"
echo "     se as politicas de acesso estao ativas."
echo ""
echo "  2. Triggers e Functions:"
echo "     Confirme se funcoes do PostgreSQL e triggers"
echo "     estao presentes e funcionando."
echo ""
echo "  3. Storage Buckets:"
echo "     Buckets do Supabase Storage NAO sao incluidos"
echo "     no pg_dump. Recrie-os manualmente se necessario."
echo ""
echo "  4. Auth Users:"
echo "     Usuarios do auth.users SAO incluidos no backup"
echo "     de dados, mas confirme se as senhas/hashes"
echo "     foram preservados corretamente."
echo ""
echo "  OK Restore concluido."
echo "============================================================"
