import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * GET /api/vitrine
 * Query: ?categoria=xxx&subcategoria=xxx&busca=xxx&page=1&limit=12
 * Lista fornecedores com status = 'aprovado' (público, sem auth)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    categoria,
    subcategoria,
    busca,
    page = 1,
    limit = 12,
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabase
    .from('fornecedores')
    .select(
      'id, nome_fantasia, categoria, subcategoria, descricao, telefone, site, instagram, logo_url, cidade, estado, media_avaliacao, total_avaliacoes',
      { count: 'exact' }
    )
    .eq('status', 'aprovado')
    .order('media_avaliacao', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  if (subcategoria) {
    query = query.eq('subcategoria', subcategoria);
  }

  if (busca) {
    query = query.or(`nome_fantasia.ilike.%${busca}%,descricao.ilike.%${busca}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: 'Erro ao buscar vitrine', detalhe: error.message });
  }

  return res.status(200).json({
    success: true,
    fornecedores: data || [],
    total: count || 0,
    page: parseInt(page),
    limit: parseInt(limit),
  });
}
