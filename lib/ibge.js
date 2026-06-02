/**
 * Cliente para API de localidades do IBGE — cidades, estados, regiões
 * @module lib/ibge
 */

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1';

/**
 * Busca todos os estados brasileiros
 * @returns {Promise<Array<{id: number, sigla: string, nome: string}>>}
 */
export async function listarEstados() {
  const res = await fetch(`${IBGE_BASE}/localidades/estados?orderBy=nome`);
  if (!res.ok) throw new Error('Erro ao buscar estados');
  return res.json();
}

/**
 * Busca cidades de um estado
 * @param {string|number} uf — sigla ou ID do estado
 * @returns {Promise<Array<{id: number, nome: string}>>}
 */
export async function listarCidadesPorEstado(uf) {
  const res = await fetch(`${IBGE_BASE}/localidades/estados/${uf}/municipios`);
  if (!res.ok) throw new Error('Erro ao buscar cidades');
  return res.json();
}

/**
 * Busca detalhes de uma cidade
 * @param {number} id — ID do município
 * @returns {Promise<Object>}
 */
export async function buscarCidade(id) {
  const res = await fetch(`${IBGE_BASE}/localidades/municipios/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar cidade');
  return res.json();
}

/**
 * Inferir região brasileira pelo estado
 * @param {string} sigla — sigla do estado (ex: 'RJ')
 * @returns {string}
 */
export function inferirRegiao(sigla) {
  const regioes = {
    norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    centroOeste: ['DF', 'GO', 'MT', 'MS'],
    sudeste: ['ES', 'MG', 'RJ', 'SP'],
    sul: ['PR', 'RS', 'SC'],
  };
  for (const [regiao, estados] of Object.entries(regioes)) {
    if (estados.includes(sigla?.toUpperCase())) return regiao;
  }
  return '';
}