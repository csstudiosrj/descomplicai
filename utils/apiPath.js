/**
 * Helper para prefixar chamadas de API com o basePath do Next.js.
 * Usar SEMPRE em vez de hardcode de '/api/...' no frontend.
 *
 * Exemplo:
 *   fetch(apiPath('/admin/dashboard'))
 *   // Com basePath '/descomplicai' -> '/descomplicai/api/admin/dashboard'
 *   // Sem basePath -> '/api/admin/dashboard'
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Retorna o path completo da API com basePath aplicado.
 * @param {string} endpoint - path da API sem prefixo (ex: '/admin/dashboard')
 * @returns {string} path completo (ex: '/descomplicai/api/admin/dashboard')
 */
export function apiPath(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_PATH}/api${cleanEndpoint}`;
}

/**
 * Retorna o path completo de qualquer rota interna com basePath.
 * @param {string} path - path sem prefixo (ex: '/admin')
 * @returns {string} path completo (ex: '/descomplicai/admin')
 */
export function appPath(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${cleanPath}`;
}
