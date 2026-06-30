#!/bin/bash
set -euo pipefail

# ============================================================
# Backup Local do Supabase — Descomplicaí
# Uso: ./scripts/backup.sh [schema|data|full]
# Requer: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
# ============================================================

BACKUP_TYPE="${1:-full}"
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
  echo "   Adicione-as no .env.local ou exporte como variaveis de ambiente."
  exit 1
fi

# Deriva host do banco a partir da URL do projeto
PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https?://||' | sed -E 's/\.supabase\.co.*//')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Diretorio de backup
DATE_DIR=$(date +%Y-%m-%d-%H%M%S)
BACKUP_DIR="$PROJECT_ROOT/backups/$DATE_DIR"
mkdir -p "$BACKUP_DIR"

echo "============================================================"
echo "  Backup Supabase — Descomplicaí"
echo "  Projeto: $PROJECT_REF"
echo "  Tipo:    $BACKUP_TYPE"
echo "  Destino: $BACKUP_DIR"
echo "============================================================"

# Verifica pg_dump
if ! command -v pg_dump &> /dev/null; then
  echo "Erro: pg_dump nao encontrado. Instale o PostgreSQL client:"
  echo "   macOS: brew install postgresql@16"
  echo "   Ubuntu: sudo apt install postgresql-client-16"
  exit 1
fi

# Backup do schema
if [ "$BACKUP_TYPE" = "schema" ] || [ "$BACKUP_TYPE" = "full" ]; then
  echo "Fazendo backup do SCHEMA..."
  PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --clean \
    --if-exists \
    --quote-all-identifiers \
    --schema-only \
    --no-owner \
    --no-privileges \
    > "$BACKUP_DIR/schema.sql"
  echo "   OK schema.sql ($(wc -l < "$BACKUP_DIR/schema.sql" | xargs) linhas)"
fi

# Backup dos dados
if [ "$BACKUP_TYPE" = "data" ] || [ "$BACKUP_TYPE" = "full" ]; then
  echo "Fazendo backup dos DADOS..."
  PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --clean \
    --if-exists \
    --quote-all-identifiers \
    --data-only \
    --no-owner \
    --no-privileges \
    --disable-triggers \
    > "$BACKUP_DIR/data.sql"
  echo "   OK data.sql ($(wc -l < "$BACKUP_DIR/data.sql" | xargs) linhas)"
fi

# Compacta
if [ "$BACKUP_TYPE" = "full" ]; then
  echo "Compactando..."
  tar -czf "$BACKUP_DIR.tar.gz" -C "$PROJECT_ROOT/backups" "$DATE_DIR"
  rm -rf "$BACKUP_DIR"
  echo "   OK $DATE_DIR.tar.gz"
fi

echo ""
echo "============================================================"
echo "  Backup concluido com sucesso!"
echo "============================================================"
