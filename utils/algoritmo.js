/**
 * Algoritmo de ramificação do fluxo do questionário do memorial
 * @module utils/algoritmo
 */

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
  
    { id: 'E1', componente: 'Step17Flores', bloco: 'E', titulo: 'Flores', condicao: () => true },
    { id: 'E1a', componente: 'Step17aLocaisFlores', bloco: 'E', titulo: 'Localização das flores', condicao: (e) => e.flores !== false && e.flores !== null },
    { id: 'E1b', componente: 'Step17bFloricultura', bloco: 'E', titulo: 'Floricultura em mente?', condicao: (e) => e.flores !== false && e.flores !== null },
    { id: 'E2', componente: 'Step18Iluminacao', bloco: 'E', titulo: 'Iluminação', condicao: () => true },
    { id: 'E3', componente: 'Step19Velas', bloco: 'E', titulo: 'Velas', condicao: (e) => ['classico','romantico','rustico','boho','gotico'].includes(e.estilo) },
    { id: 'E4', componente: 'Step20Mobiliario', bloco: 'E', titulo: 'Mobiliário especial', condicao: () => true },
    { id: 'E5', componente: 'Step21Backdrop', bloco: 'E', titulo: 'Backdrop', condicao: () => true },
    { id: 'E6', componente: 'Step22Tecidos', bloco: 'E', titulo: 'Confirmação de têxteis', condicao: () => true },
  
    { id: 'F1', componente: 'Step23Toalha', bloco: 'F', titulo: 'Confirmação de toalha', condicao: () => true },
    { id: 'F2', componente: 'Step24Loucas', bloco: 'F', titulo: 'Confirmação de louças', condicao: () => true },
    { id: 'F3', componente: 'Step25Talheres', bloco: 'F', titulo: 'Confirmação de talheres', condicao: () => true },
    { id: 'F4', componente: 'Step26Tacas', bloco: 'F', titulo: 'Confirmação de taças', condicao: () => true },
    { id: 'F5', componente: 'Step27CentroMesa', bloco: 'F', titulo: 'Confirmação de centro de mesa', condicao: () => true },
    { id: 'F6', componente: 'Step28Guardanapo', bloco: 'F', titulo: 'Confirmação de guardanapo', condicao: () => true },
    { id: 'F7', componente: 'Step29CartaoLugar', bloco: 'F', titulo: 'Cartão de lugar', condicao: (e) => ['medio','grande','mega'].includes(e.totalConvidados) || e.tipoJantar === 'empatado' },
  
    { id: 'G1', componente: 'Step30Entrada', bloco: 'G', titulo: 'Entrada dos noivos', condicao: () => true },
    { id: 'G2', componente: 'Step31Acompanhamento', bloco: 'G', titulo: 'Quem acompanha na entrada?', condicao: () => true },
    { id: 'G3', componente: 'Step32MusicaCerimonia', bloco: 'G', titulo: 'Música da cerimônia', condicao: () => true },
    { id: 'G4', componente: 'Step33Elementos', bloco: 'G', titulo: 'Elementos da cerimônia', condicao: () => true },
    { id: 'G5', componente: 'Step34Padrinhos', bloco: 'G', titulo: 'Padrinhos e madrinhas', condicao: () => true },
    { id: 'G6', componente: 'Step35Criancas', bloco: 'G', titulo: 'Crianças na cerimônia', condicao: () => true },
    { id: 'G6a', componente: 'Step35aPapeisCriancas', bloco: 'G', titulo: 'Papéis das crianças', condicao: (e) => e.criancasCerimonia === true },
    { id: 'G7', componente: 'Step36Rituais', bloco: 'G', titulo: 'Rituais simbólicos', condicao: (e) => e.tipoCerimonia !== 'catolica' && e.tipoCerimonia !== 'evangelica' },
    { id: 'G8', componente: 'Step37Saida', bloco: 'G', titulo: 'Saída dos noivos', condicao: () => true },
  
    { id: 'H1', componente: 'Step38Coquetel', bloco: 'H', titulo: 'Coquetel de entrada?', condicao: () => true },
    { id: 'H1a', componente: 'Step38aDuracaoCoquetel', bloco: 'H', titulo: 'Duração e tipo de coquetel', condicao: (e) => e.coquetel === true },
    { id: 'H2', componente: 'Step39TipoJantar', bloco: 'H', titulo: 'Tipo de jantar', condicao: () => true },
    { id: 'H3', componente: 'Step40Restricoes', bloco: 'H', titulo: 'Restrições alimentares', condicao: () => true },
    { id: 'H4', componente: 'Step41Bolo', bloco: 'H', titulo: 'Bolo', condicao: () => true },
    { id: 'H5', componente: 'Step42Doces', bloco: 'H', titulo: 'Mesa de doces e bem-casados', condicao: () => true },
    { id: 'H6', componente: 'Step43Bar', bloco: 'H', titulo: 'Bar', condicao: () => true },
    { id: 'H7', componente: 'Step44Bartender', bloco: 'H', titulo: 'Bartender', condicao: (e) => e.tipoBar !== 'so-espumante' && e.tipoBar !== null },
    { id: 'H8', componente: 'Step45MusicaFesta', bloco: 'H', titulo: 'Música da festa', condicao: () => true },
    { id: 'H9', componente: 'Step46Atividades', bloco: 'H', titulo: 'Atividades e entretenimento', condicao: () => true },
    { id: 'H10', componente: 'Step47Lembrancinhas', bloco: 'H', titulo: 'Lembrancinhas', condicao: () => true },
    { id: 'H11', componente: 'Step48KitSaida', bloco: 'H', titulo: 'Kit saída?', condicao: () => true },
    { id: 'H11a', componente: 'Step48aItensKit', bloco: 'H', titulo: 'Itens do kit', condicao: (e) => e.kitSaida === true },
  
    { id: 'I1', componente: 'Step49Convites', bloco: 'I', titulo: 'Convites', condicao: () => true },
    { id: 'I2', componente: 'Step50SaveTheDate', bloco: 'I', titulo: 'Save the date', condicao: () => true },
    { id: 'I3', componente: 'Step51Sinalizacao', bloco: 'I', titulo: 'Sinalização no evento', condicao: () => true },
    { id: 'I4', componente: 'Step52Monograma', bloco: 'I', titulo: 'Monograma/brasão', condicao: () => true },
    { id: 'I5', componente: 'Step53ItensDigitais', bloco: 'I', titulo: 'Itens digitais', condicao: () => true },
  
    { id: 'J1', componente: 'Step54Vestido', bloco: 'J', titulo: 'Estilo do traje principal', condicao: () => true },
    { id: 'J2', componente: 'Step55Atelier', bloco: 'J', titulo: 'Atelier em mente?', condicao: () => true },
    { id: 'J3', componente: 'Step56Acessorios', bloco: 'J', titulo: 'Acessórios', condicao: () => true },
    { id: 'J4', componente: 'Step57Beleza', bloco: 'J', titulo: 'Estilo de maquiagem e cabelo', condicao: (e) => e.perfilCasal !== 'dois-noivos' },
    { id: 'J5', componente: 'Step58Profissional', bloco: 'J', titulo: 'Profissional de beleza contratado?', condicao: () => true },
    { id: 'J6', componente: 'Step59Padronizar', bloco: 'J', titulo: 'Padronização de madrinhas/padrinhos', condicao: () => true },
  
    { id: 'K1', componente: 'Step60Fornecedores', bloco: 'K', titulo: 'Confirmação da lista automática de fornecedores', condicao: () => true },
  ];
  
  /**
   * Calcula o índice da próxima etapa visível a partir do estado atual
   * @param {Object} estadoAtual
   * @param {number} etapaAtualIndex
   * @returns {number}
   */
  export function calcularProximaEtapa(estadoAtual, etapaAtualIndex) {
    for (let i = etapaAtualIndex + 1; i < ETAPAS.length; i++) {
      if (ETAPAS[i].condicao(estadoAtual)) {
        return i;
      }
    }
    return ETAPAS.length;
  }
  
  /**
   * Retorna o número total de etapas visíveis dado o estado atual
   * @param {Object} estadoAtual
   * @returns {number}
   */
  export function calcularEtapasTotais(estadoAtual) {
    return ETAPAS.filter((e) => e.condicao(estadoAtual)).length;
  }
  
  /**
   * Determina se é hora de exibir o login
   * @param {Object} estadoAtual
   * @param {string} etapaAtualId
   * @returns {boolean}
   */
  export function deveExibirLoginAgora(estadoAtual, etapaAtualId) {
    return etapaAtualId === 'C4b' || (etapaAtualId === 'C4' && estadoAtual.ceremoniaFestaMesmoLocal !== false);
  }
  
  /**
   * Retorna a definição completa de uma etapa pelo índice
   * @param {number} index
   * @returns {Object|null}
   */
  export function getEtapaPorIndice(index) {
    return ETAPAS[index] || null;
  }
  
  /**
   * Retorna a definição completa de uma etapa pelo id
   * @param {string} id
   * @returns {Object|null}
   */
  export function getEtapaPorId(id) {
    return ETAPAS.find((e) => e.id === id) || null;
  }
  
  export { ETAPAS };