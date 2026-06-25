// pages/api/vitrine/[id].js
// API pública para buscar dados do cerimonialista na vitrine
// Usa service_role para bypassar RLS (página pública, sem autenticação obrigatória)

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ erro: 'ID do cerimonialista é obrigatório' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('cerimonialistas')
      .select(`
        id,
        nome_empresa,
        bio,
        cidade,
        estado,
        regiao_atuacao,
        telefone,
        instagram,
        site,
        portfolio_urls,
        avaliacao_media,
        total_avaliacoes,
        total_eventos,
        plano,
        ativo,
        criado_em
      `)
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ erro: 'Cerimonialista não encontrado ou inativo' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[API Vitrine] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno ao buscar cerimonialista' });
  }
}
