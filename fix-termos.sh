#!/bin/bash
set -e

ARQUIVOS=(
  "components/memorial/steps/Step07dSimbolica.jsx"
  "components/memorial/steps/Step32PadrinhosCriancas.jsx"
  "components/memorial/steps/StepA15TradicaoFamiliar.jsx"
  "components/memorial/steps/StepB16DefiniramEntrada.jsx"
  "components/memorial/steps/StepE9DocumentacaoEstrangeiro.jsx"
)

for f in "${ARQUIVOS[@]}"; do
  [ -f "$f" ] || { echo "⚠️ $f não encontrado"; continue; }
  echo "Corrigindo $f..."

  # Insere a definição de termos após a primeira chave da função
  sed -i '/export default function/{:a; /{/!{N;ba}; s/{/{\n  const perfil = estadoAtual?.perfilCasal || "nao-especificar";\n  const termos = getTermos(perfil);/}' "$f"

  echo "✅ $f corrigido."
done

echo ""
echo "✅ Todos corrigidos!"
