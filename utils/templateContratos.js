/**
 * Biblioteca de templates de contrato por categoria de fornecedor.
 * Cada template retorna uma string com placeholders para substituição.
 *
 * Placeholders padrão:
 *   {{noivo}} — nome do noivo
 *   {{noiva}} — nome da noiva
 *   {{data_evento}} — data do casamento
 *   {{fornecedor_nome}} — nome do fornecedor
 *   {{fornecedor_empresa}} — nome da empresa
 *   {{servico}} — descrição do serviço contratado
 *   {{valor_total}} — valor total do contrato
 *   {{valor_entrada}} — valor do sinal/adiantamento
 *   {{valor_saldo}} — valor restante
 *   {{data_contrato}} — data de emissão do contrato
 */

const templates = {
    // Alimentação e Bebidas
    buffet: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — BUFFET
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Prestação de serviços de buffet para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    bar: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — BAR
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Prestação de serviços de bar para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Decoração e Flores
    decoracao: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — DECORAÇÃO
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Decoração floral e cenográfica para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    flores: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — FLORICULTURA
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Fornecimento de arranjos florais para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Música e Entretenimento
    banda: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — BANDA
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Apresentação musical ao vivo para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    dj: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — DJ
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Serviços de discotecagem e sonorização para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Foto e Vídeo
    fotografia: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — FOTOGRAFIA
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Cobertura fotográfica do evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    filmagem: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — FILMAGEM
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Cobertura em vídeo do evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Cerimônia e Assessoria
    celebrante: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — CELEBRANTE
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Celebração da cerimônia de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Local
    local: `CONTRATO DE LOCAÇÃO DE ESPAÇO
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Locação do espaço para realização do evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Transporte
    transporte: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — TRANSPORTE
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Serviços de transporte para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Papelaria
    papelaria: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — PAPELARIA
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Confecção de papelaria personalizada para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Segurança
    seguranca: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — SEGURANÇA
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Serviços de segurança para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Beleza
    beleza: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — BELEZA
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Serviços de beleza (maquiagem, cabelo, etc.) para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Vestuário
    vestuario: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — VESTUÁRIO
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Fornecimento/confeção de vestuário para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  
    // Fallback
    default: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS
  
  CONTRATANTE: {{noivo}} e {{noiva}}
  CONTRATADO: {{fornecedor_empresa}}, representado por {{fornecedor_nome}}
  
  OBJETO: Prestação de serviços de {{servico}} para o evento de casamento no dia {{data_evento}}.
  
  VALOR: R$ {{valor_total}} (total), sendo R$ {{valor_entrada}} de entrada e R$ {{valor_saldo}} de saldo.
  
  ...`,
  };
  
  /**
   * Retorna o template de contrato para uma categoria.
   * @param {string} categoria — id da categoria (ex: 'buffet', 'fotografia', 'banda')
   * @returns {string} template com placeholders
   */
  export function getTemplate(categoria) {
    return templates[categoria] || templates.default;
  }
  
  /**
   * Substitui placeholders no template pelos dados reais.
   * @param {string} template — texto com placeholders
   * @param {Object} dados — objeto com os valores
   * @returns {string} texto final
   */
  export function renderTemplate(template, dados) {
    return template.replace(/{{\w+}}/g, (match) => {
      const key = match.slice(2, -2);
      return dados[key] !== undefined ? String(dados[key]) : match;
    });
  }
  
  /**
   * Lista todas as categorias disponíveis.
   */
  export function getCategoriasComTemplate() {
    return Object.keys(templates).filter(k => k !== 'default');
  }
  
  export default templates;