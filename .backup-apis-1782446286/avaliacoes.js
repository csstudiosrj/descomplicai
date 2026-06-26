// GET /api/fornecedores/avaliacoes
// Retorna avaliações do fornecedor logado + média da categoria

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: fornecedor } = await supabase
      .from('fornecedores_plataforma')
      .select('id, categoria, avaliacao_media, total_avaliacoes')
      .eq('usuario_id', user.id)
      .single();

    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor not found' });
    }

    const { data: avaliacoes } = await supabase
      .from('avaliacoes')
      .select('id, nota, comentario, nome_casal, criado_em')
      .eq('fornecedor_id', fornecedor.id)
      .order('criado_em', { ascending: false })
      .limit(5);

    const { data: mediaCategoria } = await supabase
      .from('fornecedores_plataforma')
      .select('avaliacao_media')
      .eq('categoria', fornecedor.categoria)
      .gt('total_avaliacoes', 0);

    const mediaCat = mediaCategoria?.length 
      ? (mediaCategoria.reduce((acc, f) => acc + Number(f.avaliacao_media), 0) / mediaCategoria.length).toFixed(1)
      : '0.0';

    res.status(200).json({
      avaliacoes: avaliacoes || [],
      mediaFornecedor: Number(fornecedor.avaliacao_media) || 0,
      totalAvaliacoes: fornecedor.total_avaliacoes,
      mediaCategoria: mediaCat
    });
  } catch (err) {
    console.error('[API avaliacoes] erro:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
