// utils/algoritmo.js
// Algoritmo de navegação do memorial — fluxo completo com expansão

const ETAPAS = [
  // === BLOCO A: Perfil do Casal ===
  { id: 'step00', bloco: 'A', componente: 'Step00Casal', titulo: 'Perfil do casal' },
  { id: 'step01', bloco: 'A', componente: 'Step01Modo', titulo: 'Modo de planejamento' },
  { id: 'step02', bloco: 'A', componente: 'Step02NomeCasal', titulo: 'Nomes do casal' },
  { id: 'step03', bloco: 'A', componente: 'Step03Data', titulo: 'Data do casamento' },
  { id: 'step04', bloco: 'A', componente: 'Step04Cidade', titulo: 'Cidade' },
  { id: 'step05', bloco: 'A', componente: 'Step05Convidados', titulo: 'Número de convidados' },
  { id: 'step06', bloco: 'A', componente: 'Step06Orcamento', titulo: 'Orçamento estimado' },
  // Expansão A
  { id: 'stepA4', bloco: 'A', componente: 'StepA4Criancas', titulo: 'Crianças na festa' },
  { id: 'stepA5', bloco: 'A', componente: 'StepA5Padrinhos', titulo: 'Padrinhos' },
  { id: 'stepA6', bloco: 'A', componente: 'StepA6DataPrevista', titulo: 'Data prevista' },

  // === BLOCO B: Cerimônia ===
  { id: 'step07', bloco: 'B', componente: 'Step07Cerimonia', titulo: 'Tipo de cerimônia' },
  // Ramificações B (condicionais)
  { id: 'step07a', bloco: 'B', componente: 'Step07aCatolica', titulo: 'Detalhes católicos' },
  { id: 'step07b', bloco: 'B', componente: 'Step07bEvangelica', titulo: 'Detalhes evangélicos' },
  { id: 'step07c', bloco: 'B', componente: 'Step07cJudaica', titulo: 'Detalhes judaicos' },
  { id: 'step07d', bloco: 'B', componente: 'Step07dSimbolica', titulo: 'Detalhes simbólicos' },
  { id: 'step09', bloco: 'B', componente: 'Step09MesmoLocal', titulo: 'Mesmo local para cerimônia e festa' },
  // Expansão B
  { id: 'stepB5', bloco: 'B', componente: 'StepB5CriancasCerimonia', titulo: 'Crianças na cerimônia' },
  { id: 'stepB6', bloco: 'B', componente: 'StepB6DuracaoCerimonia', titulo: 'Duração da cerimônia' },
  { id: 'stepB7', bloco: 'B', componente: 'StepB7MusicaCerimoniaViva', titulo: 'Música ao vivo na cerimônia' },

  // === BLOCO C: Local e Estrutura ===
  { id: 'step08', bloco: 'C', componente: 'Step08Local', titulo: 'Tipo de local' },
  { id: 'step10', bloco: 'C', componente: 'Step10Horario', titulo: 'Horário do casamento' },
  { id: 'step11', bloco: 'C', componente: 'Step11PlanoChuva', titulo: 'Plano B chuva' },
  { id: 'step11b', bloco: 'C', componente: 'Step11bTransporte', titulo: 'Transporte dos noivos' },
  // Expansão C
  { id: 'stepC4', bloco: 'C', componente: 'StepC4Estacionamento', titulo: 'Estacionamento' },
  { id: 'stepC5', bloco: 'C', componente: 'StepC5CozinhaApoio', titulo: 'Cozinha de apoio' },
  { id: 'stepC6', bloco: 'C', componente: 'StepC6CapacidadeLocal', titulo: 'Capacidade do local' },
  { id: 'stepC7', bloco: 'C', componente: 'StepC7GeradorLocal', titulo: 'Gerador no local' },

  // === BLOCO D: Identidade Visual ===
  { id: 'step12', bloco: 'D', componente: 'Step12Estilo', titulo: 'Estilo do casamento' },
  { id: 'step13', bloco: 'D', componente: 'Step13Formalidade', titulo: 'Formalidade' },
  { id: 'step14', bloco: 'D', componente: 'Step14Paleta', titulo: 'Paleta de cores' },
  { id: 'step15', bloco: 'D', componente: 'Step15Tom', titulo: 'Tom do evento' },
  { id: 'step16', bloco: 'D', componente: 'Step16Referencias', titulo: 'Referências visuais' },

  // === BLOCO E: Decoração (desmembrado) ===
  { id: 'step17', bloco: 'E', componente: 'Step17Flores', titulo: 'Flores' },
  { id: 'step18', bloco: 'E', componente: 'Step18Iluminacao', titulo: 'Iluminação' },
  { id: 'step19', bloco: 'E', componente: 'Step19Velas', titulo: 'Velas' },
  { id: 'step20', bloco: 'E', componente: 'Step20Mobiliario', titulo: 'Mobiliário especial' },
  { id: 'step21', bloco: 'E', componente: 'Step21Backdrop', titulo: 'Backdrop' },
  { id: 'step22', bloco: 'E', componente: 'Step22Tecidos', titulo: 'Tecidos' },

  // === BLOCO F: Mesa Posta (desmembrado) ===
  { id: 'step23', bloco: 'F', componente: 'Step23Toalha', titulo: 'Toalha de mesa' },
  { id: 'step24', bloco: 'F', componente: 'Step24Loucas', titulo: 'Louças' },
  { id: 'step25', bloco: 'F', componente: 'Step25Talheres', titulo: 'Talheres' },
  { id: 'step26', bloco: 'F', componente: 'Step26Tacas', titulo: 'Taças' },
  { id: 'step27', bloco: 'F', componente: 'Step27CentroMesa', titulo: 'Centro de mesa' },
  { id: 'step28', bloco: 'F', componente: 'Step28Guardanapo', titulo: 'Guardanapo' },
  { id: 'step29', bloco: 'F', componente: 'Step29CartaoLugar', titulo: 'Cartão de lugar' },

  // === BLOCO G: Cerimônia Detalhada (desmembrado) ===
  { id: 'step30', bloco: 'G', componente: 'Step30Entrada', titulo: 'Entrada dos noivos' },
  { id: 'step31', bloco: 'G', componente: 'Step31MusicaCerimonia', titulo: 'Música da cerimônia' },
  { id: 'step32', bloco: 'G', componente: 'Step32PadrinhosCriancas', titulo: 'Padrinhos e crianças' },
  { id: 'step33', bloco: 'G', componente: 'Step33RituaisSaida', titulo: 'Rituais e saída' },

  // === BLOCO H: Recepção (desmembrado) ===
  { id: 'step38', bloco: 'H', componente: 'Step38Coquetel', titulo: 'Coquetel e jantar' },
  { id: 'step39', bloco: 'H', componente: 'Step39BoloDocesBar', titulo: 'Bolo, doces e bar' },
  { id: 'step40', bloco: 'H', componente: 'Step40MusicaEntretenimento', titulo: 'Música e entretenimento' },
  // Expansão G/H
  { id: 'stepG8', bloco: 'H', componente: 'StepG8MesaFrios', titulo: 'Mesa de frios' },
  { id: 'stepG9', bloco: 'H', componente: 'StepG9BebidasPorPessoa', titulo: 'Bebidas por pessoa' },
  { id: 'stepG10', bloco: 'H', componente: 'StepG10MenuInfantil', titulo: 'Menu infantil' },
  { id: 'stepH3', bloco: 'H', componente: 'StepH3FogosSparklers', titulo: 'Fogos e sparklers' },
  { id: 'stepH4', bloco: 'H', componente: 'StepH4MesaDocesExposta', titulo: 'Mesa de doces exposta' },
  { id: 'stepH5', bloco: 'H', componente: 'StepH5AulaDanca', titulo: 'Aula de dança' },

  // === BLOCO I: Papelaria e Identidade (desmembrado) ===
  { id: 'step49', bloco: 'I', componente: 'Step49Convites', titulo: 'Convites' },
  { id: 'step50', bloco: 'I', componente: 'Step50IdentidadeVisual', titulo: 'Identidade visual' },

  // === BLOCO J: Vestuário e Beleza (desmembrado) ===
  { id: 'step54', bloco: 'J', componente: 'Step54Vestido', titulo: 'Vestido e acessórios' },
  { id: 'step55', bloco: 'J', componente: 'Step55BelezaPadronizacao', titulo: 'Beleza e padronização' },
  // Expansão I
  { id: 'stepI4', bloco: 'J', componente: 'StepI4AulasDanca', titulo: 'Aulas de dança' },
  { id: 'stepI5', bloco: 'J', componente: 'StepI5MudancaLook', titulo: 'Mudança de look' },
  { id: 'stepI6', bloco: 'J', componente: 'StepI6QuantasMadrinhas', titulo: 'Quantas madrinhas' },

  // === BLOCO K: Fornecedores ===
  { id: 'step60', bloco: 'K', componente: 'Step60Fornecedores', titulo: 'Fornecedores' },

  // === BLOCO L: Logística e Documentação (NOVO) ===
  { id: 'stepL1', bloco: 'L', componente: 'StepL1Aliancas', titulo: 'Alianças' },
  { id: 'stepL2', bloco: 'L', componente: 'StepL2CivilJunto', titulo: 'Casamento civil' },
  { id: 'stepL3', bloco: 'L', componente: 'StepL3TransporteEspecialNoivos', titulo: 'Transporte especial dos noivos' },
  { id: 'stepL4', bloco: 'L', componente: 'StepL4CarroNoivos', titulo: 'Carro dos noivos' },
  { id: 'stepL5', bloco: 'L', componente: 'StepL5TransporteConvidados', titulo: 'Transporte de convidados' },
  { id: 'stepL6', bloco: 'L', componente: 'StepL6Seguranca', titulo: 'Segurança' },

  // === BLOCO M: Pós-casamento (NOVO) ===
  { id: 'stepM1', bloco: 'M', componente: 'StepM1LuaDeMel', titulo: 'Lua de mel' },
  { id: 'stepM2', bloco: 'M', componente: 'StepM2FotosLuaDeMel', titulo: 'Fotos na lua de mel' },
];

const INDICE_POR_ID = {};
ETAPAS.forEach((etapa, idx) => {
  INDICE_POR_ID[etapa.id] = idx;
});

/**
 * Retorna a etapa pelo índice
 */
export function getEtapaPorIndice(indice) {
  if (indice < 0 || indice >= ETAPAS.length) return null;
  return ETAPAS[indice];
}

/**
 * Calcula a próxima etapa baseada no estado atual
 */
export function calcularProximaEtapa(estado, indiceAtual) {
  const proximo = indiceAtual + 1;
  if (proximo >= ETAPAS.length) return ETAPAS.length; // fim

  const etapa = ETAPAS[proximo];

  // === RAMIFICAÇÕES CONDICIONAIS ===

  // Step07 ramificações: pular as que não aplicam
  if (etapa.id === 'step07a' && estado.tipoCerimonia !== 'catolica') {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'step07b' && estado.tipoCerimonia !== 'evangelica') {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'step07c' && estado.tipoCerimonia !== 'judaica') {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'step07d' && estado.tipoCerimonia !== 'simbolica') {
    return calcularProximaEtapa(estado, proximo);
  }

  // Step09 (mesmo local) só aparece se cerimônia e festa são no mesmo local
  // Ou seja, se tipoCerimonia é civil ou simbolica e não tem local definido ainda
  // Na prática, step09 sempre aparece — a lógica de "mesmo local" é decidida lá

  // Expansão A: pular se não aplicável
  if (etapa.id === 'stepA4' && estado.criancas === false) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepA5' && estado.padrinhosEscolhidos === false) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepA6' && !!estado.dataCasamento) {
    return calcularProximaEtapa(estado, proximo); // pula se já tem data exata
  }

  // Expansão B
  if (etapa.id === 'stepB5' && (estado.criancas === false || estado.criancasCerimonia === false)) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepB6' && estado.tipoCerimonia === 'civil') {
    return calcularProximaEtapa(estado, proximo); // civil não tem duração variável
  }
  if (etapa.id === 'stepB7' && estado.tipoCerimonia === 'civil') {
    return calcularProximaEtapa(estado, proximo);
  }

  // Expansão C
  if (etapa.id === 'stepC4' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) {
    return calcularProximaEtapa(estado, proximo); // locais fechados já têm estacionamento
  }
  if (etapa.id === 'stepC5' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepC6' && !estado.tipoLocal) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepC7' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) {
    return calcularProximaEtapa(estado, proximo);
  }

  // Expansão G/H
  if (etapa.id === 'stepG8' && estado.coquetel !== true) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepG9' && !estado.tipoBar) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepG10' && (estado.criancas === false || estado.criancas === 'nao')) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepH3' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('fogos')) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepH4' && estado.mesaDoces !== true) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepH5' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) {
    return calcularProximaEtapa(estado, proximo);
  }

  // Expansão I
  if (etapa.id === 'stepI4' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepI5' && estado.estiloVestido !== 'jumpsuit' && !estado.tem_noiva) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepI6' && estado.padrinhosEscolhidos !== true) {
    return calcularProximaEtapa(estado, proximo);
  }

  // Bloco L
  if (etapa.id === 'stepL3' && estado.transporteEspecialNoivos !== true) {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepL4' && estado.carroNoivos === 'nao') {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepL5' && estado.transporteConvidados === 'nao') {
    return calcularProximaEtapa(estado, proximo);
  }
  if (etapa.id === 'stepL6' && !['grande', 'mega'].includes(estado.totalConvidados) && estado.seguranca !== true) {
    return calcularProximaEtapa(estado, proximo);
  }

  // Bloco M
  if (etapa.id === 'stepM2' && (estado.luaDeMel === false || estado.luaDeMel === 'nao')) {
    return calcularProximaEtapa(estado, proximo);
  }

  return proximo;
}

/**
 * Calcula total de etapas visíveis para o progresso
 * Simplificado: retorna total de etapas (a barra de progresso pode ser ajustada depois)
 */
export function calcularEtapasTotais(estado) {
  // Conta etapas que NÃO seriam puladas
  let count = 0;
  for (let i = 0; i < ETAPAS.length; i++) {
    const etapa = ETAPAS[i];
    // Verifica condições de pulo (simplificado)
    if (etapa.id === 'step07a' && estado.tipoCerimonia !== 'catolica') continue;
    if (etapa.id === 'step07b' && estado.tipoCerimonia !== 'evangelica') continue;
    if (etapa.id === 'step07c' && estado.tipoCerimonia !== 'judaica') continue;
    if (etapa.id === 'step07d' && estado.tipoCerimonia !== 'simbolica') continue;
    if (etapa.id === 'stepA4' && estado.criancas === false) continue;
    if (etapa.id === 'stepA5' && estado.padrinhosEscolhidos === false) continue;
    if (etapa.id === 'stepA6' && !!estado.dataCasamento) continue;
    if (etapa.id === 'stepB5' && (estado.criancas === false || estado.criancasCerimonia === false)) continue;
    if (etapa.id === 'stepB6' && estado.tipoCerimonia === 'civil') continue;
    if (etapa.id === 'stepB7' && estado.tipoCerimonia === 'civil') continue;
    if (etapa.id === 'stepC4' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) continue;
    if (etapa.id === 'stepC5' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) continue;
    if (etapa.id === 'stepC7' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) continue;
    if (etapa.id === 'stepG8' && estado.coquetel !== true) continue;
    if (etapa.id === 'stepG9' && !estado.tipoBar) continue;
    if (etapa.id === 'stepG10' && (estado.criancas === false || estado.criancas === 'nao')) continue;
    if (etapa.id === 'stepH3' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('fogos')) continue;
    if (etapa.id === 'stepH4' && estado.mesaDoces !== true) continue;
    if (etapa.id === 'stepH5' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) continue;
    if (etapa.id === 'stepI4' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) continue;
    if (etapa.id === 'stepI5' && estado.estiloVestido !== 'jumpsuit' && !estado.tem_noiva) continue;
    if (etapa.id === 'stepI6' && estado.padrinhosEscolhidos !== true) continue;
    if (etapa.id === 'stepL3' && estado.transporteEspecialNoivos !== true) continue;
    if (etapa.id === 'stepL4' && estado.carroNoivos === 'nao') continue;
    if (etapa.id === 'stepL5' && estado.transporteConvidados === 'nao') continue;
    if (etapa.id === 'stepL6' && !['grande', 'mega'].includes(estado.totalConvidados) && estado.seguranca !== true) continue;
    if (etapa.id === 'stepM2' && (estado.luaDeMel === false || estado.luaDeMel === 'nao')) continue;
    count++;
  }
  return count;
}

/**
 * Decide se deve exibir tela de login antes de continuar
 */
export function deveExibirLoginAgora(estado, etapaId) {
  // Exibe login após o bloco A (perfil básico completo)
  // Ou seja, quando o usuário está saindo do bloco A
  const etapasBlocoA = ETAPAS.filter(e => e.bloco === 'A').map(e => e.id);
  const etapaAtualIdx = ETAPAS.findIndex(e => e.id === etapaId);
  const ultimoBlocoA = ETAPAS.findIndex(e => e.id === etapasBlocoA[etapasBlocoA.length - 1]);

  return etapaAtualIdx > ultimoBlocoA && !estado.user_id;
}

export { ETAPAS, INDICE_POR_ID };
