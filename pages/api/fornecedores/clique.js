// POST /api/fornecedores/clique
// Registra clique em telefone, email ou site no perfil público
// Body: { fornecedorId, tipo: 'telefone' | 'email' | 'site' }

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fornecedorId, tipo } = req.body;
    if (!fornecedorId || !['telefone', 'email', 'site'].includes(tipo)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: existente } = await supabase
      .from('metricas_fornecedor')
      .select('id, cliques')
      .eq('fornecedor_id', fornecedorId)
      .eq('dia', today)
      .single();

    if (existente) {
      await supabase
        .from('metricas_fornecedor')
        .update({ cliques: existente.cliques + 1 })
        .eq('id', existente.id);
    } else {
      await supabase
        .from('metricas_fornecedor')
        .insert({ fornecedor_id: fornecedorId, dia: today, cliques: 1 });
    }

    await supabase.from('cliques_fornecedor').insert({
      fornecedor_id: fornecedorId,
      tipo
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[API clique] erro:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
