#!/bin/bash
# ============================================================
# Instalador — Documentacao + Backup Descomplicaí
# ============================================================
# Uso: bash instalar.sh
# Rode na RAIZ do projeto (mesmo nivel do package.json)
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Verifica se está na raiz do projeto
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo ""
  echo "❌ ERRO: Voce nao esta na raiz do projeto."
  echo "   Este script deve ser executado na pasta onde esta o package.json"
  echo "   (raiz do projeto Descomplicaí)."
  echo ""
  exit 1
fi

echo ""
echo "============================================================"
echo "  Instalador — Descomplicaí"
echo "  Documentacao + Backup Automatizado"
echo "============================================================"
echo ""
echo "  Projeto: $PROJECT_ROOT"
echo ""

# Verifica se o ZIP existe
ZIP_FILE="$PROJECT_ROOT/descomplicai-docs-backup.zip"
if [ ! -f "$ZIP_FILE" ]; then
  echo "❌ ERRO: Arquivo descomplicai-docs-backup.zip nao encontrado."
  echo "   Coloque o arquivo ZIP na raiz do projeto e rode novamente."
  echo ""
  exit 1
fi

# Cria pastas se nao existirem
echo "📁 Criando estrutura de pastas..."
mkdir -p "$PROJECT_ROOT/.github/workflows"
mkdir -p "$PROJECT_ROOT/scripts"
mkdir -p "$PROJECT_ROOT/docs"
mkdir -p "$PROJECT_ROOT/backups"

# Descompacta o ZIP
echo "📦 Descompactando arquivos..."
unzip -o "$ZIP_FILE" -d "$PROJECT_ROOT"

# Ajusta permissoes dos scripts
echo "🔧 Ajustando permissoes..."
chmod +x "$PROJECT_ROOT/scripts/backup.sh" 2>/dev/null || true
chmod +x "$PROJECT_ROOT/scripts/restore.sh" 2>/dev/null || true

# Adiciona backups/ no .gitignore se nao existir
GITIGNORE="$PROJECT_ROOT/.gitignore"
if [ -f "$GITIGNORE" ]; then
  if ! grep -q "^backups/" "$GITIGNORE" 2>/dev/null; then
    echo "" >> "$GITIGNORE"
    echo "# Backups locais do banco de dados" >> "$GITIGNORE"
    echo "backups/" >> "$GITIGNORE"
    echo "✅ Adicionado 'backups/' ao .gitignore"
  fi
else
  echo "backups/" > "$GITIGNORE"
  echo "✅ Criado .gitignore com 'backups/'"
fi

# Verifica se tem as env vars necessarias
echo ""
echo "============================================================"
echo "  ✅ INSTALACAO CONCLUIDA"
echo "============================================================"
echo ""
echo "  Arquivos instalados:"
echo "    • .github/workflows/backup-supabase.yml"
echo "    • scripts/backup.sh"
echo "    • scripts/restore.sh"
echo "    • docs/BACKUP.md"
echo "    • docs/ERD.md"
echo "    • docs/CONTRIBUTING.md"
echo "    • README.md (atualizado)"
echo "    • CHANGELOG.md"
echo ""
echo "  Proximos passos:"
echo ""
echo "  1. Configure as secrets no GitHub:"
echo "     • SUPABASE_URL"
echo "     • SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "  2. Teste o backup manual:"
echo "     bash scripts/backup.sh full"
echo ""
echo "  3. Verifique o workflow no GitHub Actions:"
echo "     Actions > Backup Supabase Database"
echo ""
echo "  4. Leia a documentacao:"
echo "     cat docs/BACKUP.md"
echo ""
echo "============================================================"
