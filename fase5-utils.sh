#!/bin/bash
# ============================================================
# FASE 5: Utils — tarefasPadrao + gerador-financeiro
# ============================================================

PROJECT_DIR="."
BACKUP_DIR="$PROJECT_DIR/.backup-fase5-$(date +%s)"
mkdir -p "$BACKUP_DIR"

cp "$PROJECT_DIR/utils/tarefasPadrao.js" "$BACKUP_DIR/"
cp "$PROJECT_DIR/utils/gerador-financeiro.js" "$BACKUP_DIR/"

echo "Backup em: $BACKUP_DIR"

# ============================================================
# 1. utils/tarefasPadrao.js — mapear categorias para IDs do catálogo
# ============================================================
cat > "$PROJECT_DIR/utils/tarefasPadrao.js" << 'EOF_TAREFAS'
import { SUBCATEGORIAS_FLAT } from './catalogoFornecedores';

// Mapeamento de categorias legadas para IDs do catálogo
const MAPEAMENTO_CATEGORIAS_TAREFAS = {
  'Financeiro': 'outro',
  'Outros': 'outro',
  'Fornecedores': 'outro',
  'Vestuário': 'vestido_atelier',
  'Convidados': 'outro',
  'Decoração': 'decoracao',
  'Documentação': 'outro',
};

function normalizarCategoriaTarefa(categoria) {
  if (!categoria) return 'outro';
  const limpa = categoria.trim();
  if (MAPEAMENTO_CATEGORIAS_TAREFAS[limpa]) return MAPEAMENTO_CATEGORIAS_TAREFAS[limpa];
  // Se já for um ID válido do catálogo, retorna ele
  const valido = SUBCATEGORIAS_FLAT.find(s => s.id === limpa);
  if (valido) return limpa;
  return 'outro';
}

export const TAREFAS_PADRAO = [
  // 12 meses
  { titulo: 'Definir orcamento total', descricao: 'Estabeleca o valor maximo a ser gasto no casamento e divida por categoria.', categoria: normalizarCategoriaTarefa('Financeiro'), diasAntes: 365 },
  { titulo: 'Reservar data do casamento', descricao: 'Escolha a data e verifique disponibilidade com familiares proximos.', categoria: normalizarCategoriaTarefa('Outros'), diasAntes: 365 },
  { titulo: 'Listar fornecedores desejados', descricao: 'Monte uma lista de 2 a 3 opcoes para cada categoria de servico.', categoria: normalizarCategoriaTarefa('Fornecedores'), diasAntes: 365 },
  { titulo: 'Visitar locais de cerimonia', descricao: 'Agende visitas presenciais e compare o ambiente, acesso e capacidade.', categoria: normalizarCategoriaTarefa('Fornecedores'), diasAntes: 360 },
  { titulo: 'Visitar locais de festa', descricao: 'Verifique infraestrutura, estacionamento, acessibilidade e catering.', categoria: normalizarCategoriaTarefa('Fornecedores'), diasAntes: 360 },

  // 9 meses
  { titulo: 'Contratar fotografo', descricao: 'Feche contrato, defina pacote e pagamento.', categoria: 'fotografia', diasAntes: 270 },
  { titulo: 'Contratar filmagem', descricao: 'Escolha estilo (documental, cinematografico) e equipe.', categoria: 'filmagem', diasAntes: 270 },
  { titulo: 'Contratar buffet', descricao: 'Realize degustacao, defina cardapio e formas de servico.', categoria: 'buffet', diasAntes: 270 },
  { titulo: 'Contratar decoracao', descricao: 'Alinhe paleta de cores, estilo e materiais.', categoria: 'decoracao', diasAntes: 270 },
  { titulo: 'Contratar DJ ou banda', descricao: 'Defina repertorio, equipamentos e horarios.', categoria: 'musica_festa', diasAntes: 270 },
  { titulo: 'Reservar espaco da cerimonia', descricao: 'Assine contrato e pague reserva.', categoria: 'espaco_recepcao', diasAntes: 270 },
  { titulo: 'Reservar espaco da festa', descricao: 'Confirme data, capacidade e regras do local.', categoria: 'espaco_recepcao', diasAntes: 270 },
  { titulo: 'Escolher vestido de noiva', descricao: 'Inicie provas em atelies ou lojas. Considere prazo de confeccao.', categoria: 'vestido_atelier', diasAntes: 270 },
  { titulo: 'Escolher traje do noivo', descricao: 'Defina estilo, cor e acessorios. Considere aluguel ou compra.', categoria: 'traje_masculino', diasAntes: 270 },

  // 6 meses
  { titulo: 'Definir lista de convidados', descricao: 'Liste todos os nomes e organize por prioridade (familia, amigos, trabalho).', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 180 },
  { titulo: 'Encomendar convites', descricao: 'Escolha design, papel e acabamentos. Confirme prazo de entrega.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 180 },
  { titulo: 'Contratar celebrante', descricao: 'Padre, pastor, juiz ou mestre de cerimonias. Alinhe roteiro.', categoria: 'celebrante', diasAntes: 180 },
  { titulo: 'Contratar transporte', descricao: 'Carro dos noivos, transfer para convidados e estacionamento.', categoria: 'transporte_noivos', diasAntes: 180 },
  { titulo: 'Definir menu com buffet', descricao: 'Escolha entradas, pratos principais, acompanhamentos e bebidas.', categoria: 'buffet', diasAntes: 180 },
  { titulo: 'Escolher buque e flores', descricao: 'Alinhe com decorador as flores da cerimonia, mesas e buque.', categoria: 'floricultura', diasAntes: 180 },
  { titulo: 'Contratar equipe de beleza', descricao: 'Cabelo, maquiagem, manicure e possiveis testes.', categoria: 'beleza_noiva', diasAntes: 180 },
  { titulo: 'Definir lista de presentes', descricao: 'Crie lista em lojas fisicas ou sites de casamento.', categoria: normalizarCategoriaTarefa('Outros'), diasAntes: 180 },

  // 4 meses
  { titulo: 'Enviar save the date', descricao: 'Envie digital ou impresso para reservar a data na agenda dos convidados.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 120 },
  { titulo: 'Confirmar fornecedores', descricao: 'Ligue ou envie e-mail confirmando data, servico e valores.', categoria: normalizarCategoriaTarefa('Fornecedores'), diasAntes: 120 },
  { titulo: 'Pagar entrada dos fornecedores', descricao: 'Organize os sinais e depositos iniciais. Guarde comprovantes.', categoria: normalizarCategoriaTarefa('Financeiro'), diasAntes: 120 },
  { titulo: 'Escolher acessorios da noiva', descricao: 'Veu, joias, tiara, grinalda e lingerie.', categoria: 'vestido_atelier', diasAntes: 120 },
  { titulo: 'Escolher sapatos', descricao: 'Noiva, noivo, damas e pajens. Faca testes de conforto.', categoria: 'vestido_atelier', diasAntes: 120 },
  { titulo: 'Definir cronograma do dia', descricao: 'Horarios de making of, cerimonia, coquetel, jantar e festa.', categoria: normalizarCategoriaTarefa('Outros'), diasAntes: 120 },

  // 3 meses
  { titulo: 'Enviar convites oficiais', descricao: 'Envie com pelo menos 2 meses de antecedencia. Inclua RSVP.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 90 },
  { titulo: 'Confirmar RSVP dos convidados', descricao: 'Acompanhe respostas e liste quem nao confirmou.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 90 },
  { titulo: 'Definir layout das mesas', descricao: 'Organize mesas redondas, familiares e mesa dos noivos.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 90 },
  { titulo: 'Contratar papelaria', descricao: 'Menu, lugar marcado, placas de boas-vindas e monograma.', categoria: 'papelaria', diasAntes: 90 },
  { titulo: 'Definir musica da cerimonia', descricao: 'Entrada da noiva, saida, comunhao e momentos especiais.', categoria: 'musica_cerimonia', diasAntes: 90 },
  { titulo: 'Escolher lembrancinhas', descricao: 'Defina item, embalagem e quantidade exata.', categoria: 'bem_casados', diasAntes: 90 },

  // 2 meses
  { titulo: 'Prova de vestido', descricao: 'Verifique ajustes finos, comprimento e conforto.', categoria: 'vestido_atelier', diasAntes: 60 },
  { titulo: 'Prova de traje', descricao: 'Ajuste de camisa, colete, calca e sapato.', categoria: 'traje_masculino', diasAntes: 60 },
  { titulo: 'Reuniao com fotografo', descricao: 'Alinhe lista de fotos obrigatorias, locais e horarios.', categoria: 'fotografia', diasAntes: 60 },
  { titulo: 'Reuniao com decorador', descricao: 'Reveja projeto 3D, materiais e cronograma de montagem.', categoria: 'decoracao', diasAntes: 60 },
  { titulo: 'Definir cardapio final', descricao: 'Confirme opcoes vegetarianas, alergicos e bebidas.', categoria: 'buffet', diasAntes: 60 },
  { titulo: 'Verificar documentacao civil', descricao: 'Certidoes de nascimento, RG, CPF e comprovante de residencia.', categoria: normalizarCategoriaTarefa('Documentacao'), diasAntes: 60 },

  // 1 mes
  { titulo: 'Reuniao final com buffet', descricao: 'Confirme numero de convidados, cardapio e horarios.', categoria: 'buffet', diasAntes: 30 },
  { titulo: 'Reuniao final com decoracao', descricao: 'Ultima conferencia de flores, moveis e montagem.', categoria: 'decoracao', diasAntes: 30 },
  { titulo: 'Confirmar transporte', descricao: 'Rotas, horarios de chegada e contato do motorista.', categoria: 'transporte_noivos', diasAntes: 30 },
  { titulo: 'Teste de cabelo e maquiagem', descricao: 'Agende no mesmo horario do casamento para testar durabilidade.', categoria: 'beleza_noiva', diasAntes: 30 },
  { titulo: 'Confirmar numeros finais', descricao: 'Feche lista definitiva de convidados para buffet e mesas.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 30 },
  { titulo: 'Definir seating chart', descricao: 'Organize lugares por mesa e imprima ou envie para o cerimonial.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 30 },
  { titulo: 'Pagar saldos dos fornecedores', descricao: 'Organize pagamentos finais e guarde notas fiscais.', categoria: normalizarCategoriaTarefa('Financeiro'), diasAntes: 30 },
  { titulo: 'Separar dinheiro para gorjetas', descricao: 'Prepare envelopes com valores definidos para equipe.', categoria: normalizarCategoriaTarefa('Financeiro'), diasAntes: 30 },
  { titulo: 'Revisar contratos', descricao: 'Leia todos os contratos e confirme clausulas de cancelamento.', categoria: normalizarCategoriaTarefa('Documentacao'), diasAntes: 30 },

  // 2 semanas
  { titulo: 'Confirmar todos os fornecedores', descricao: 'Ligacao final de confirmacao com todos.', categoria: normalizarCategoriaTarefa('Fornecedores'), diasAntes: 14 },
  { titulo: 'Revisar cronograma final', descricao: 'Compartilhe versao final com cerimonial e fotografo.', categoria: normalizarCategoriaTarefa('Outros'), diasAntes: 14 },
  { titulo: 'Preparar kit de emergencia', descricao: 'Alfinetes, fita adesiva, remedios, costura e carregador.', categoria: 'vestido_atelier', diasAntes: 14 },
  { titulo: 'Confirmar playlist e musicas', descricao: 'Envie lista para DJ/banda com musicas proibidas e obrigatorias.', categoria: 'musica_festa', diasAntes: 14 },

  // 1 semana
  { titulo: 'Ultima prova de vestido', descricao: 'Ajuste final e confirme que esta perfeito.', categoria: 'vestido_atelier', diasAntes: 7 },
  { titulo: 'Reuniao com cerimonialista', descricao: 'Alinhe entrada, cerimonia, brinde, primeira danca e saida.', categoria: 'cerimonialista', diasAntes: 7 },
  { titulo: 'Confirmar convites pendentes', descricao: 'Ligue para quem nao respondeu ao RSVP.', categoria: normalizarCategoriaTarefa('Convidados'), diasAntes: 7 },
  { titulo: 'Preparar documentos para cartorio', descricao: 'Organize pasta com certidoes e identidades.', categoria: normalizarCategoriaTarefa('Documentacao'), diasAntes: 7 },
  { titulo: 'Definir rota de transporte', descricao: 'Confirme enderecos, horarios e pontos de parada.', categoria: 'transporte_noivos', diasAntes: 7 },

  // 3 dias
  { titulo: 'Reconfirmar fornecedores', descricao: 'Mensagem rapida de confirmacao final.', categoria: normalizarCategoriaTarefa('Fornecedores'), diasAntes: 3 },
  { titulo: 'Preparar roupas da lua de mel', descricao: 'Separe mala com antecedencia e verifique documentos.', categoria: 'agencia_viagem', diasAntes: 3 },

  // 1 dia
  { titulo: 'Reuniao final com noivos', descricao: 'Momento de calma. Revisem juntos o cronograma e relaxem.', categoria: normalizarCategoriaTarefa('Outros'), diasAntes: 1 },
  { titulo: 'Preparar caixa para envelopes', descricao: 'Caixa decorada e segura para receber presentes em dinheiro.', categoria: normalizarCategoriaTarefa('Outros'), diasAntes: 1 },

  // Dia do evento
  { titulo: 'Verificar chegada dos fornecedores', descricao: 'Cerimonial confirma horario de montagem de cada equipe.', categoria: normalizarCategoriaTarefa('Fornecedores'), diasAntes: 0 },
  { titulo: 'Revisar cronograma do dia', descricao: 'Ultima leitura do timeline com cerimonial.', categoria: normalizarCategoriaTarefa('Outros'), diasAntes: 0 },
];
EOF_TAREFAS

echo "[1/2] tarefasPadrao.js atualizado"

# ============================================================
# 2. utils/gerador-financeiro.js — 'Outros' → 'outro'
# ============================================================
sed -i "s/return mapa\[subcategoria\] || 'Outros';/return mapa[subcategoria] || 'outro';/" "$PROJECT_DIR/utils/gerador-financeiro.js"

echo "[2/2] gerador-financeiro.js atualizado ('Outros' → 'outro')"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  FASE 5 CONCLUIDA"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Mudancas:"
echo "  - tarefasPadrao.js: categorias legadas → IDs do catalogo (fallback 'outro')"
echo "  - gerador-financeiro.js: 'Outros' → 'outro' (padrao lowercase)"
echo ""
echo "Backup em: $BACKUP_DIR"
echo ""
echo "PROXIMO PASSO: commit/push para Vercel"