#!/bin/bash

# Ativa nullglob para evitar erros caso algum padrão não encontre arquivos
shopt -s nullglob

# Cria o diretório de saída
mkdir -p _concatenados

# Função que insere o nome do arquivo antes do conteúdo para facilitar a auditoria
concat_files() {
  local output_file="_concatenados/$1"
  shift
  echo "Gerando $output_file..."
  > "$output_file"
  for file in "$@"; do
    if [ -f "$file" ]; then
      echo -e "\n\n/* ==========================================" >> "$output_file"
      echo " * ARQUIVO: $file" >> "$output_file"
      echo " * ========================================== */\n" >> "$output_file"
      cat "$file" >> "$output_file"
    fi
  done
}

echo "Iniciando concatenação..."

# 1. Configurações
concat_files "01_configs_raiz.txt" package.json next.config.mjs eslint.config.mjs .env.example jsconfig.json vercel.json

# 2. Core (Context, Hooks, Lib, Styles, BD)
concat_files "02_core_libs_hooks.txt" context/*.jsx hooks/*.js lib/*.js styles/* supabase/*.sql sql/*.sql

# 3. Utils
concat_files "03_utils.txt" utils/*.js

# 4. Components - Gerais
concat_files "04_components_gerais.txt" components/painel/*.jsx components/financeiro/*.jsx components/chat/*.jsx components/mesas/*.jsx components/vitrine/*.jsx components/convidados/*.jsx components/checklist/*.jsx components/fornecedores/*.jsx components/colaborador/*.jsx components/layout/*.jsx components/contratos/*.jsx components/pdf/*.jsx components/cronograma/*.jsx

# 5. Components - Cerimonialista
concat_files "05_components_cerimonialista.txt" components/cerimonialista/*.jsx

# 6. Components - UI e SVGs
concat_files "06_components_ui_e_svgs.txt" components/ui/*.jsx components/ui/*.txt components/ui/*.css components/ui/svgs/breath/*.jsx

# 7. Components - Memorial Base
concat_files "07_components_memorial_base.txt" components/memorial/*.jsx components/memorial/*.css

# 8. Components - Memorial Steps (Dividido em 3)
concat_files "08_memorial_steps_numeros.txt" components/memorial/steps/Step[0-9]*.jsx
concat_files "09_memorial_steps_letras_A_D.txt" components/memorial/steps/Step[A-D]*.jsx
concat_files "10_memorial_steps_letras_E_Z.txt" components/memorial/steps/Step[E-Z]*.jsx

# 9. Pages - Base
concat_files "11_pages_base.txt" pages/*.jsx pages/*.js pages/memorial/*.jsx pages/painel/*.jsx pages/admin/*.jsx pages/assinar/*.jsx pages/vitrine/*.jsx pages/colaborador/*.jsx pages/convite/*.jsx pages/convite/lead/*.jsx pages/fornecedor/*.jsx

# 10. Pages - Cerimonialista
concat_files "12_pages_cerimonialista.txt" pages/cerimonialista/*.jsx pages/cerimonialista/espelho/*.jsx pages/cerimonialista/*.patch

# 11. API - Base
concat_files "13_api_base.txt" pages/api/*.js pages/api/memorial/*.js pages/api/financeiro/*.js pages/api/roteiro/*.js pages/api/tarefas/*.js pages/api/mensagens/*.js pages/api/vitrine/*.js pages/api/pagamento/*.js pages/api/ia/*.js pages/api/fornecedores/*.js pages/api/convite/*.js pages/api/fornecedor/*.js pages/api/contratos/*.js

# 12. API - Cerimonialista (Inclui subpastas)
concat_files "14_api_cerimonialista.txt" pages/api/cerimonialista/*.js pages/api/cerimonialista/*/*.js

echo "✅ Concluído! Arquivos gerados na pasta _concatenados/"