/**
 * utils/fetchAPI.js
 * Helper centralizado para chamadas de API com basePath automático.
 * 
 * O Next.js basePath (/descomplicai) não é aplicado automaticamente
 * em fetch() do cliente. Este helper prefixa o caminho corretamente.
 * 
 * Se o basePath mudar no next.config.js, altere apenas a constante
 * BASE_PATH abaixo.
 */

const BASE_PATH = '/descomplicai';

/**
 * Prefixa um caminho de API com o basePath da aplicação.
 * Funciona tanto em dev quanto em prod.
 * 
 * @param {string} path - Caminho da API (ex: '/api/memorial/salvar')
 * @returns {string} Caminho completo com basePath (ex: '/descomplicai/api/memorial/salvar')
 */
export function apiPath(path) {
  if (!path || typeof path !== 'string') return path;
  // Não prefixa URLs absolutas (http://, https://)
  if (path.startsWith('http')) return path;
  // Não prefixa se já estiver com basePath
  if (BASE_PATH && path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path}`;
}

/**
 * Wrapper de fetch que automaticamente prefixa o basePath.
 * Aceita a mesma assinatura do fetch nativo.
 * 
 * @param {string} path - Caminho da API
 * @param {RequestInit} [options] - Opções do fetch
 * @returns {Promise<Response>}
 */
export default function fetchAPI(path, options) {
  return fetch(apiPath(path), options);
}

export { fetchAPI, apiPath };