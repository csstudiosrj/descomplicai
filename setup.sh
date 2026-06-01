#!/bin/bash

# Script de setup para projeto Next.js (Pages Router + JavaScript)
# Cria toda a estrutura de pastas e arquivos com comentários de responsabilidade

set -e

echo "🚀 Criando estrutura do projeto..."

# Cria diretórios
mkdir -p pages/memorial
mkdir -p pages/painel
mkdir -p pages/colaborador
mkdir -p pages/fornecedor
mkdir -p components/memorial/steps
mkdir -p components/ui
mkdir -p lib
mkdir -p hooks
mkdir -p utils
mkdir -p styles

# --- Pages ---

cat > pages/memorial/index.jsx << 'EOF'
// Página principal do memorial — fluxo de criação do álbum de casamento
EOF

cat > pages/painel/index.jsx << 'EOF'
// Dashboard principal do casal — visão geral do planejamento
EOF

cat > pages/painel/fornecedores.jsx << 'EOF'
// Gestão de fornecedores contratados e em negociação
EOF

cat > pages/painel/financeiro.jsx << 'EOF'
// Controle financeiro — orçamento, pagamentos e saldo
EOF

cat > pages/painel/convidados.jsx << 'EOF'
// Lista de convidados — confirmações, mesas e contatos
EOF

cat > pages/painel/checklist.jsx << 'EOF'
// Checklist de tarefas — acompanhamento de pendências do casamento
EOF

cat > pages/painel/cronograma.jsx << 'EOF'
// Cronograma do evento — timeline do grande dia
EOF

cat > 'pages/colaborador/[token].jsx' << 'EOF'
// Página de acesso do colaborador via token único — área restrita
EOF

cat > pages/fornecedor/cadastro.jsx << 'EOF'
// Cadastro de novo fornecedor no sistema
EOF

cat > pages/fornecedor/perfil.jsx << 'EOF'
// Perfil público do fornecedor — dados e portfólio
EOF

cat > pages/fornecedor/painel.jsx << 'EOF'
// Painel administrativo do fornecedor — leads e configurações
EOF

# --- Components: Memorial ---

cat > components/memorial/steps/Step00Casal.jsx << 'EOF'
// Etapa 0 do memorial — coleta dos dados do casal
EOF

cat > components/memorial/steps/Step01Modo.jsx << 'EOF'
// Etapa 1 do memorial — escolha do modo de criação (guiado ou livre)
EOF

cat > components/memorial/MemorialOrchestrator.jsx << 'EOF'
// Orquestrador do fluxo do memorial — controla navegação entre etapas
EOF

cat > components/memorial/MemorialPreview.jsx << 'EOF'
// Pré-visualização ao vivo do memorial durante a edição
EOF

cat > components/memorial/ProgressBar.jsx << 'EOF'
// Barra de progresso indicando etapa atual do memorial
EOF

cat > components/memorial/BackButton.jsx << 'EOF'
// Botão de voltar com animação e controle de histórico
EOF

cat > components/memorial/BreathTransition.jsx << 'EOF'
// Transição suave estilo "respiração" entre etapas do memorial
EOF

# --- Components: UI ---

cat > components/ui/Button.jsx << 'EOF'
// Componente de botão reutilizável — variantes e estados
EOF

cat > components/ui/Card.jsx << 'EOF'
// Componente de card/container reutilizável
EOF

cat > components/ui/Icon.jsx << 'EOF'
// Componente de ícone — wrapper com suporte a biblioteca de ícones
EOF

cat > components/ui/Input.jsx << 'EOF'
// Componente de input reutilizável — text, number, textarea, etc.
EOF

cat > components/ui/Modal.jsx << 'EOF'
// Componente de modal/diálogo — overlay e foco trap
EOF

# --- Lib ---

cat > lib/supabase.js << 'EOF'
// Cliente e configuração do Supabase — autenticação e banco de dados
EOF

# --- Hooks ---

cat > hooks/useMemorial.js << 'EOF'
// Hook customizado — lógica de estado e navegação do memorial
EOF

cat > hooks/useAutoSave.js << 'EOF'
// Hook customizado — persistência automática com debounce
EOF

# --- Utils ---

cat > utils/algoritmo.js << 'EOF'
// Funções utilitárias e algoritmos auxiliares do projeto
EOF

cat > utils/sugestoes.js << 'EOF'
// Motor de sugestões e recomendações personalizadas
EOF

# --- Styles ---

cat > styles/tokens.css << 'EOF'
/* Tokens de design — cores, espaçamentos, tipografia e sombras */
EOF

echo "✅ Estrutura criada com sucesso!"
echo ""
echo "📁 Arquivos criados:"
find . -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.css" \) | sort