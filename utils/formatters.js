/**
 * Funções utilitárias de formatação
 * @module utils/formatters
 */

/**
 * Formata valor em reais brasileiros
 * @param {number} valor
 * @returns {string}
 */
export function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }
  
  /**
   * Formata data para padrão brasileiro
   * @param {string|Date} data
   * @returns {string}
   */
  export function formatarData(data) {
    if (!data) return '';
    const d = typeof data === 'string' ? new Date(data) : data;
    return new Intl.DateTimeFormat('pt-BR').format(d);
  }
  
  /**
   * Formata data com hora
   * @param {string|Date} data
   * @returns {string}
   */
  export function formatarDataHora(data) {
    if (!data) return '';
    const d = typeof data === 'string' ? new Date(data) : data;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
  
  /**
   * Formata número de telefone brasileiro
   * @param {string} telefone
   * @returns {string}
   */
  export function formatarTelefone(telefone) {
    if (!telefone) return '';
    const nums = telefone.replace(/\D/g, '');
    if (nums.length === 11) return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (nums.length === 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return telefone;
  }
  
  /**
   * Formata CPF com máscara
   * @param {string} cpf
   * @returns {string}
   */
  export function formatarCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  /**
   * Formata CNPJ com máscara
   * @param {string} cnpj
   * @returns {string}
   */
  export function formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    return cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  /**
   * Converte faixa de orçamento para valor mínimo
   * @param {string} faixa
   * @returns {number|null}
   */
  export function orcamentoParaValor(faixa) {
    const mapa = {
      'ate-20k': 20000,
      '20k-50k': 20000,
      '50k-90k': 50000,
      '90k-150k': 90000,
      '150k-300k': 150000,
      'acima-300k': 300000,
    };
    return mapa[faixa] || null;
  }
  
  /**
   * Capitaliza primeira letra de cada palavra
   * @param {string} str
   * @returns {string}
   */
  export function capitalizar(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }
  
  /**
   * Trunca texto com ellipsis
   * @param {string} str
   * @param {number} max
   * @returns {string}
   */
  export function truncar(str, max = 100) {
    if (!str || str.length <= max) return str;
    return str.slice(0, max).trim() + '...';
  }