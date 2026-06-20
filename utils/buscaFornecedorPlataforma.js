// utils/buscaFornecedorPlataforma.js
// Autocomplete de fornecedores da plataforma com debounce.
// Uso: const buscar = debounceBuscarFornecedor(supabase, categoria, callback)

function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
  
  /**
   * Busca fornecedores da plataforma por nome (ILIKE) e categoria.
   * @param {Object} supabase — cliente supabase
   * @param {string} termo — texto digitado pelo usuário
   * @param {string} categoriaPrincipal — id da categoria principal (opcional, filtra se informado)
   * @param {number} limite — max resultados (default 5)
   * @returns {Promise<Array>} — lista de fornecedores sugeridos
   */
  export async function buscarFornecedoresPlataforma(supabase, termo, categoriaPrincipal = '', limite = 5) {
    if (!termo || termo.trim().length < 2) return [];
  
    let query = supabase
      .from('fornecedores_plataforma')
      .select('id, nome, telefone, email, instagram, site, categoria_principal')
      .ilike('nome', `%${termo.trim()}%`)
      .limit(limite);
  
    if (categoriaPrincipal) {
      query = query.eq('categoria_principal', categoriaPrincipal);
    }
  
    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar fornecedores_plataforma:', error);
      return [];
    }
    return data || [];
  }
  
  /**
   * Retorna versão debounced (300ms) da busca.
   * Uso no React:
   *   const buscarDebounced = useMemo(() => debounceBuscarFornecedor(supabase), [supabase]);
   *   buscarDebounced(termo, categoria, (resultados) => setSugestoes(resultados));
   *
   * @param {Object} supabase — cliente supabase
   * @returns {Function} — (termo, categoriaPrincipal, callback) => void
   */
  export function debounceBuscarFornecedor(supabase) {
    return debounce(async (termo, categoriaPrincipal, callback) => {
      const resultados = await buscarFornecedoresPlataforma(supabase, termo, categoriaPrincipal);
      if (callback) callback(resultados);
    }, 300);
  }
  
  export default { buscarFornecedoresPlataforma, debounceBuscarFornecedor };