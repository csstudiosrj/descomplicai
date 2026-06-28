#!/bin/bash
# fix-v6.sh — footer aparece só no step00, dentro do memorial
# bash fix-v6.sh

set -e

echo ">>> 1/2 pages/memorial/index.jsx — sem mudança no layout externo"
cat > pages/memorial/index.jsx << 'EOF'
import Header from '../../components/ui/Header';
import MemorialOrchestrator from '../../components/memorial/MemorialOrchestrator';

export default function MemorialPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '52px', height: '100dvh', boxSizing: 'border-box', overflow: 'hidden' }}>
        <MemorialOrchestrator />
      </main>
    </>
  );
}
EOF
echo "    memorial/index.jsx ok"

echo ""
echo ">>> 2/2 MemorialOrchestrator.jsx — footer condicional no step 0"
# Adiciona import do Footer e renderiza condicionalmente quando etapaAtual === 0
# A estrutura do orchestrator é:
#   <BreathTransition>
#     <div> (flex column, height 100%)
#       <ProgressBar />
#       <main> (flex 1, overflow auto) — conteúdo do step
#       <BackButton />
#       [modais...]
#     </div>
#   </BreathTransition>
#
# Adicionamos o Footer DENTRO do <div> flex, após o <main>, antes do BackButton
# Ele só aparece quando estado.etapaAtual === 0

# Inserir import do Footer após os outros imports
sed -i "s|import BackButton from './BackButton';|import BackButton from './BackButton';\nimport Footer from '../ui/Footer';|" \
  components/memorial/MemorialOrchestrator.jsx

# Substituir a linha do BackButton para incluir o footer condicional antes dele
sed -i "s|        <BackButton onClick={handleBack} disabled={!estado\.historicoEtapas?\.length} />|        {estado.etapaAtual === 0 \&\& <Footer />}\n        <BackButton onClick={handleBack} disabled={!estado.historicoEtapas?.length} />|" \
  components/memorial/MemorialOrchestrator.jsx

echo "    Footer condicional adicionado ao Orchestrator"

echo ""
echo "Verificando:"
grep -n "Footer\|etapaAtual === 0" components/memorial/MemorialOrchestrator.jsx | head -10

echo ""
echo "Commit e push:"
echo "  git add -A && git commit -m 'fix: footer no step00 do memorial, some nas demais etapas' && git push"