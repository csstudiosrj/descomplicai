#!/bin/bash
set -e
echo "▶️ Corrigindo apenas os arquivos com problemas conhecidos..."

# Lista de arquivos que têm erro de referência no map (callback o, usam opcao)
MAP_FILES="
Step05Convidados
Step06Orcamento
Step13Formalidade
StepA10TemFilhos
StepA11TemAnimais
StepA12GostamDeFazer
StepA13PersonalidadeNoivo
StepA14PersonalidadeNoiva
StepA8MoramJuntos
StepA9ComoSeConheceram
StepB10EscolheuPadre
StepB11ReservouTemplo
StepB12DefiniuChupa
StepB13EscolheuCelebrante
StepB14AgendouCartorio
StepB15PadrinhosEscolhidos
StepB17MusicosCerimonia
StepB18CertidaoBatismo
StepB8ReservouIgreja
StepB9CursoNoivos
StepC10VerificouMare
StepC11ListaPreliminar
StepC13HotelIndicacao
StepC14HorarioFesta
StepC15DuracaoCoquetel
StepC8ReservouLocalCerimonia
StepC9ReservouLocalFesta
StepD10VestidoContratado
StepD12CerimonialistaContratado
StepD13TransporteContratado
StepD14PapelariaContratada
StepD15CabineFotos
StepD16Drone
StepD17AnimacaoInfantil
StepD18VestidoComprado
StepD19TesteBeleza
StepD1TipoFlores
StepD20ConvitesEncomendados
StepD21SaveTheDate
StepD22Lembrancinhas
StepD23KitSaida
StepD2TipoIluminacao
StepD3MobiliarioQual
StepD4FotografoContratado
StepD5FilmagemContratada
StepD6BuffetContratado
StepD7DecoracaoContratada
StepD8MusicaContratada
StepD9EspacoContratado
StepE10QuemPaga
StepE11FormaPagamento
StepE12CronogramaDia
StepE15DestinoLuaDeMel
StepE16LuaDeMelReservada
StepE17PassaporteValido
StepE18Visto
StepE19Vacinas
StepG10MenuInfantil
StepG8MesaFrios
StepG9BebidasPorPessoa
StepH3FogosSparklers
StepH4MesaDocesExposta
StepI6QuantasMadrinhas
StepL1Aliancas
StepL2CivilJunto
StepL3TransporteEspecialNoivos
StepL5TransporteConvidados
StepL6Seguranca
StepM1LuaDeMel
"

# Arquivos que usam termos e precisam de import/getTermos (inclui alguns da lista acima e outros)
TERMOS_FILES="
Step02NomeCasal
Step11bTransporte
Step30Entrada
Step32PadrinhosCriancas
StepB9CursoNoivos
StepB16DefiniramEntrada
StepD11TrajeNoivoContratado
StepD12CerimonialistaContratado
StepE10QuemPaga
StepE13HorarioMakingOfNoiva
StepE14HorarioMakingOfNoivo
StepE1EstadoCivilNoivo
StepE2EstadoCivilNoiva
StepE3CertidaoDivorcioNoivo
StepE4CertidaoDivorcioNoiva
StepE5CertidaoObitoNoivo
StepE6CertidaoObitoNoiva
StepE7NacionalidadeNoivo
StepE8NacionalidadeNoiva
StepE9DocumentacaoEstrangeiro
StepH5AulaDanca
StepI4AulasDanca
StepI5MudancaLook
StepL4CarroNoivos
StepM2FotosLuaDeMel
Step07dSimbolica
"

# Corrigir map: substitui opcao. por o. apenas onde callback é (o) => 
# Vamos fazer de forma segura: substitui opcao.valor, opcao.label, etc. por o.valor, etc.
for f in $MAP_FILES; do
  file="components/memorial/steps/$f.jsx"
  [ -f "$file" ] || continue
  echo "Corrigindo map em $f..."
  # Substitui opcao. por o. mas apenas para propriedades comuns
  sed -i 's/opcao\.valor/o.valor/g' "$file"
  sed -i 's/opcao\.label/o.label/g' "$file"
  sed -i 's/opcao\.desc/o.desc/g' "$file"
  sed -i 's/opcao\.sub/o.sub/g' "$file"
  sed -i 's/opcao\.icone/o.icone/g' "$file"
  sed -i 's/opcao\.cor/o.cor/g' "$file"
  sed -i 's/opcao\.campo/o.campo/g' "$file"
  sed -i 's/opcao\.subtexto/o.subtexto/g' "$file"
  sed -i 's/opcao\.valor/o.valor/g' "$file" # redundante
done

# Corrigir termos: adicionar import e definição se necessário
for f in $TERMOS_FILES; do
  file="components/memorial/steps/$f.jsx"
  [ -f "$file" ] || continue
  if grep -q 'termos\.' "$file" && ! grep -q 'getTermos' "$file"; then
    echo "Adicionando getTermos em $f..."
    # Adiciona import após o último import
    sed -i '1i import { getTermos } from "../../../utils/linguagemCasal";' "$file"
    # Adiciona definição de termos dentro do componente
    # Procura a linha da função e insere depois da abertura da função
    sed -i '/export default function/,/return/ {
      /return/! {
        /{/ {
          /const termos/! {
            s/^{/{\n  const perfil = estadoAtual?.perfilCasal || "nao-especificar";\n  const termos = getTermos(perfil);/
          }
        }
      }
    }' "$file"
  fi
done

echo "✅ Correção concluída!"