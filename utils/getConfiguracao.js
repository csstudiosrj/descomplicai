import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

function getAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseAdmin;
}

/**
 * Busca uma configuração do sistema pelo nome da chave.
 * Usa cache em memória por 60 segundos para evitar múltiplas queries.
 * 
 * @param {string} chave - Nome da configuração (ex: 'preco_memorial_pdf')
 * @returns {Promise<string|null>} - Valor da configuração ou null
 */
const cache = new Map();
const CACHE_TTL = 60000; // 60 segundos

export async function getConfiguracao(chave) {
  try {
    const cached = cache.get(chave);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.valor;
    }

    const admin = getAdmin();
    const { data, error } = await admin
      .from('configuracoes')
      .select('valor')
      .eq('chave', chave)
      .single();

    if (error || !data) return null;

    cache.set(chave, { valor: data.valor, ts: Date.now() });
    return data.valor;
  } catch (err) {
    console.error(`[getConfiguracao] erro ao buscar ${chave}:`, err);
    return null;
  }
}

/**
 * Busca múltiplas configurações de uma vez.
 * @param {string[]} chaves - Array de nomes de configurações
 * @returns {Promise<Object>} - Objeto { chave: valor }
 */
export async function getConfiguracoes(chaves) {
  try {
    const admin = getAdmin();
    const { data, error } = await admin
      .from('configuracoes')
      .select('chave, valor')
      .in('chave', chaves);

    if (error) throw error;

    const resultado = {};
    (data || []).forEach((cfg) => {
      resultado[cfg.chave] = cfg.valor;
      cache.set(cfg.chave, { valor: cfg.valor, ts: Date.now() });
    });

    return resultado;
  } catch (err) {
    console.error('[getConfiguracoes] erro:', err);
    return {};
  }
}

/**
 * Limpa o cache de configurações.
 */
export function limparCacheConfiguracoes() {
  cache.clear();
}

export default getConfiguracao;
