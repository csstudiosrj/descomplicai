/**
 * Funções utilitárias de validação
 * @module utils/validators
 */

/**
 * Valida e-mail
 * @param {string} email
 * @returns {boolean}
 */
export function validarEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  /**
   * Valida senha (mínimo 6 caracteres)
   * @param {string} senha
   * @returns {boolean}
   */
  export function validarSenha(senha) {
    return typeof senha === 'string' && senha.length >= 6;
  }
  
  /**
   * Valida CPF (dígitos verificadores)
   * @param {string} cpf
   * @returns {boolean}
   */
  export function validarCPF(cpf) {
    if (!cpf) return false;
    const nums = cpf.replace(/\D/g, '');
    if (nums.length !== 11 || /^(\d)\1{10}$/.test(nums)) return false;
  
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(nums[9])) return false;
  
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(nums[10]);
  }
  
  /**
   * Valida CNPJ (dígitos verificadores)
   * @param {string} cnpj
   * @returns {boolean}
   */
  export function validarCNPJ(cnpj) {
    if (!cnpj) return false;
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length !== 14 || /^(\d)\1{13}$/.test(nums)) return false;
  
    let tamanho = nums.length - 2;
    let numeros = nums.substring(0, tamanho);
    const digitos = nums.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
  
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
  
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
  
    tamanho += 1;
    numeros = nums.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
  
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
  
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  }
  
  /**
   * Valida telefone brasileiro
   * @param {string} telefone
   * @returns {boolean}
   */
  export function validarTelefone(telefone) {
    if (!telefone) return false;
    const nums = telefone.replace(/\D/g, '');
    return nums.length >= 10 && nums.length <= 11;
  }
  
  /**
   * Valida data futura
   * @param {string|Date} data
   * @returns {boolean}
   */
  export function validarDataFutura(data) {
    if (!data) return false;
    const d = typeof data === 'string' ? new Date(data) : data;
    return d instanceof Date && !isNaN(d) && d > new Date();
  }
  
  /**
   * Valida URL
   * @param {string} url
   * @returns {boolean}
   */
  export function validarURL(url) {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Valida se valor está dentro de um array de opções permitidas
   * @param {*} valor
   * @param {Array} opcoes
   * @returns {boolean}
   */
  export function validarEnum(valor, opcoes) {
    return opcoes.includes(valor);
  }
  
  /**
   * Valida se array não está vazio
   * @param {Array} arr
   * @returns {boolean}
   */
  export function validarNaoVazio(arr) {
    return Array.isArray(arr) && arr.length > 0;
  }