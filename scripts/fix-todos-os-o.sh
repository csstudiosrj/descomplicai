#!/bin/bash
# Corrige TODOS os steps que usam 'o' como parametro de .map()
# Troca 'o' por 'opcao' em contextos onde é o parametro do map

echo "Corrigindo steps com variavel 'o' trocada..."

# Lista de arquivos que precisam de correcao
ARQUIVOS=(
  "components/memorial/steps/StepB9CursoNoivos.jsx"
  "components/memorial/steps/Step33RituaisSaida.jsx"
  "components/memorial/steps/Step21Backdrop.jsx"
  "components/memorial/steps/StepD16Drone.jsx"
  "components/memorial/steps/StepB17MusicosCerimonia.jsx"
  "components/memorial/steps/StepC13HotelIndicacao.jsx"
  "components/memorial/steps/StepD3MobiliarioQual.jsx"
  "components/memorial/steps/StepD17AnimacaoInfantil.jsx"
  "components/memorial/steps/StepE2EstadoCivilNoiva.jsx"
  "components/memorial/steps/StepB14AgendouCartorio.jsx"
  "components/memorial/steps/StepD20ConvitesEncomendados.jsx"
  "components/memorial/steps/StepB12DefiniuChupa.jsx"
  "components/memorial/steps/StepE1EstadoCivilNoivo.jsx"
  "components/memorial/steps/StepD18VestidoComprado.jsx"
  "components/memorial/steps/StepD19TesteBeleza.jsx"
  "components/memorial/steps/StepE10QuemPaga.jsx"
  "components/memorial/steps/StepD10VestidoContratado.jsx"
  "components/memorial/steps/StepD6BuffetContratado.jsx"
  "components/memorial/steps/StepB8ReservouIgreja.jsx"
  "components/memorial/steps/StepE7NacionalidadeNoivo.jsx"
  "components/memorial/steps/StepE8NacionalidadeNoiva.jsx"
  "components/memorial/steps/StepC10VerificouMare.jsx"
  "components/memorial/steps/Step07bEvangelica.jsx"
  "components/memorial/steps/Step11bTransporte.jsx"
  "components/memorial/steps/Step11PlanoChuva.jsx"
  "components/memorial/steps/Step07aCatolica.jsx"
)

for arquivo in "${ARQUIVOS[@]}"; do
  if [ -f "$arquivo" ]; then
    # Troca 'o.' por 'opcao.' quando 'o' é parametro de map
    # Mas precisamos ter cuidado para nao trocar 'o.' em outros contextos
    
    # Primeiro, verifica se o arquivo tem o padrao suspeito
    if grep -q "map((o)" "$arquivo" 2>/dev/null || grep -q "map(o =>" "$arquivo" 2>/dev/null; then
      echo "Corrigindo: $arquivo"
      
      # Substitui o parametro 'o' por 'opcao' nas funcoes map
      sed -i 's/map((o)/map((opcao)/g' "$arquivo"
      sed -i 's/map(o =>/map(opcao =>/g' "$arquivo"
      
      # Substitui todas as referencias a 'o.' que sobraram (dentro do contexto do map)
      # Isso é arriscado, entao fazemos com cuidado
      sed -i 's/o\.valor/opcao.valor/g' "$arquivo"
      sed -i 's/o\.label/opcao.label/g' "$arquivo"
      sed -i 's/o\.icone/opcao.icone/g' "$arquivo"
      sed -i 's/o\.cor/opcao.cor/g' "$arquivo"
      sed -i 's/o\.subtexto/opcao.subtexto/g' "$arquivo"
      sed -i 's/o\.campo/opcao.campo/g' "$arquivo"
      sed -i 's/o\.v/opcao.v/g' "$arquivo"
      sed -i 's/o\.l/opcao.l/g' "$arquivo"
      
      echo "  ✅ Corrigido"
    fi
  else
    echo "⚠️  Nao encontrado: $arquivo"
  fi
done

echo ""
echo "========================================"
echo "Correcao concluida!"
echo "Verificando se ainda existe 'o.' suspeito:"
echo "========================================"
grep -rn "o\." components/memorial/steps/ --include="*.jsx" | grep -v "OPCOES\|opcao\|onSelect\|onChange\|onClick\|onFocus\|onBlur\|onError\|onUpload\|onRemover\|role\|style\|const o\|let o\|var o\|opcao\." | head -n 10 || echo "Nenhum 'o.' suspeito encontrado ✅"