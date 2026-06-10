// utils/algoritmo.js
// Algoritmo de ramificação do fluxo do questionário do memorial
// Blocos agrupados em componentes únicos têm as sub-etapas removidas da lista

const ETAPAS = [
  { id: 'A1', componente: 'Step00Casal', bloco: 'A', titulo: 'Quem está se casando?', condicao: () => true },
  { id: 'A2', componente: 'Step01Modo', bloco: 'A', titulo: 'Como preferem planejar?', condicao: () => true },

  { id: 'B1', componente: 'Step02NomeCasal', bloco: 'B', titulo: 'Nome do casal', condicao: () => true },
  { id: 'B2', componente: 'Step03Data', bloco: 'B', titulo: 'Data do casamento', condicao: () => true },
  { id: 'B3', componente: 'Step04Cidade', bloco: 'B', titulo: 'Cidade do casamento', condicao: () => true },
  { id: 'B4', componente: 'Step05Convidados', bloco: 'B', titulo: 'Número de convidados', condicao: () => true },
  { id: 'B5', componente: 'Step06Orcamento', bloco: 'B', titulo: 'Orçamento', condicao: () => true },
  { id: 'B6', componente: 'Step07Cerimonia', bloco: 'B', titulo: 'Tipo de cerimônia', condicao: () => true },
  { id: 'B6a', componente: 'Step07aCatolica', bloco: 'B', titulo: 'Detalhes cerimônia católica', condicao: (e) => e.tipoCerimonia === 'catolica' },
  { id: 'B6b', componente: 'Step07bEvangelica', bloco: 'B', titulo: 'Detalhes cerimônia evangélica', condicao: (e) => e.tipoCerimonia === 'evangelica' },
  { id: 'B6c', componente: 'Step07cJudaica', bloco: 'B', titulo: 'Detalhes cerimônia judaica', condicao: (e) => e.tipoCerimonia === 'judaica' },
  { id: 'B6d', componente: 'Step07dSimbolica', bloco: 'B', titulo: 'Rituais simbólicos livres', condicao: (e) => e.tipoCerimonia === 'simbolica' },

  { id: 'C1', componente: 'Step08Local', bloco: 'C', titulo: 'Tipo de local', condicao: () => true },
  { id: 'C2', componente: 'Step09MesmoLocal', bloco: 'C', titulo: 'Cerimônia e festa no mesmo local?', condicao: () => true },
  { id: 'C3', componente: 'Step10Horario', bloco: 'C', titulo: 'Horário', condicao: () => true },
  { id: 'C4', componente: 'Step11PlanoChuva', bloco: 'C', titulo: 'Plano de contingência', condicao: (e) => ['praia','sitio','jardim','rooftop','haras'].includes(e.tipoLocal) },
  { id: 'C4b', componente: 'Step11bTransporte', bloco: 'C', titulo: 'Transporte entre locais', condicao: (e) => e.ceremoniaFestaMesmoLocal === false },

  { id: 'D1', componente: 'Step12Estilo', bloco: 'D', titulo: 'Estilo', condicao: () => true },
  { id: 'D2', componente: 'Step13Formalidade', bloco: 'D', titulo: 'Formalidade', condicao: () => true },
  { id: 'D3', componente: 'Step14Paleta', bloco: 'D', titulo: 'Paleta de cores', condicao: () => true },
  { id: 'D4', componente: 'Step15Tom', bloco: 'D', titulo: 'Tom da identidade', condicao: () => true },
  { id: 'D5', componente: 'Step16Referencias', bloco: 'D', titulo: 'Upload de referências', condicao: (e) => e.modoPlanejamento === 'ativo' },

  // Bloco E — Decoração (unificado em Step17Flores)
  { id: 'E1', componente: 'Step17Flores', bloco: 'E', titulo: 'Decoração', condicao: () => true },
  // (etapas E1a, E1b, E2, E3, E4, E5, E6 removidas — consolidadas no Step17Flores)

  // Bloco F — Mesa Posta (unificado em Step23Toalha)
  { id: 'F1', componente: 'Step23Toalha', bloco: 'F', titulo: 'Mesa posta', condicao: () => true },
  // (etapas F2–F7 removidas)

  // Bloco G — Cerimônia detalhada (unificado em Step30Entrada)
  { id: 'G1', componente: 'Step30Entrada', bloco: 'G', titulo: 'Cerimônia detalhada', condicao: () => true },
  // (etapas G2–G8 removidas)

  // Bloco H — Recepção (unificado em Step38Coquetel)
  { id: 'H1', componente: 'Step38Coquetel', bloco: 'H', titulo: 'Recepção', condicao: () => true },
  // (etapas H1a–H11a removidas)

  // Bloco I — Papelaria (unificado em Step49Convites)
  { id: 'I1', componente: 'Step49Convites', bloco: 'I', titulo: 'Papelaria e identidade', condicao: () => true },
  // (etapas I2–I5 removidas)

  // Bloco J — Vestuário e beleza (unificado em Step54Vestido)
  { id: 'J1', componente: 'Step54Vestido', bloco: 'J', titulo: 'Vestuário e beleza', condicao: () => true },
  // (etapas J2–J6 removidas)

  // Bloco K — Fornecedores
  { id: 'K1', componente: 'Step60Fornecedores', bloco: 'K', titulo: 'Confirmação da lista automática de fornecedores', condicao: () => true },
];

/**
 * Calcula o índice da próxima etapa visível a partir do estado atual
 */
export function calcularProximaEtapa(estadoAtual, etapaAtualIndex) {
  for (let i = etapaAtualIndex + 1; i < ETAPAS.length; i++) {
    if (ETAPAS[i].condicao(estadoAtual)) {
      return i;
    }
  }
  return ETAPAS.length; // fim do questionário
}

/**
 * Retorna o número total de etapas visíveis dado o estado atual
 */
export function calcularEtapasTotais(estadoAtual) {
  return ETAPAS.filter((e) => e.condicao(estadoAtual)).length;
}

/**
 * Determina se é hora de exibir o login
 */
export function deveExibirLoginAgora(estadoAtual, etapaAtualId) {
  // O login deve ser exibido após o último passo do Bloco C (ou seja, após C4b ou C4, dependendo do fluxo)
  return etapaAtualId === 'C4b' || (etapaAtualId === 'C4' && estadoAtual.ceremoniaFestaMesmoLocal !== false);
}

/**
 * Retorna a definição completa de uma etapa pelo índice
 */
export function getEtapaPorIndice(index) {
  return ETAPAS[index] || null;
}

/**
 * Retorna a definição completa de uma etapa pelo id
 */
export function getEtapaPorId(id) {
  return ETAPAS.find((e) => e.id === id) || null;
}

export { ETAPAS };