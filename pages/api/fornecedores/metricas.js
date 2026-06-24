// GET /api/fornecedores/metricas
// Retorna métricas dos últimos 30 dias + gráfico + status da assinatura

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
      .select('id, nome_empresa, visualizacoes, avaliacao_media, total_avaliacoes, plano, ativo, cidade, categoria')
      .eq('usuario_id', user.id)
      .single();

    if (!fornecedor) {
      return res.status(404).json({ error: 'Fornecedor not found' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgoDate = thirtyDaysAgo.split('T')[0];

    const { data: cliques } = await supabase
      .from('cliques_fornecedor')
      .select('tipo')
      .eq('fornecedor_id', fornecedor.id)
      .gte('criado_em', thirtyDaysAgo);

    const { data: metricasDiarias } = await supabase
      .from('metricas_fornecedor')
      .select('dia, visualizacoes, cliques')
      .eq('fornecedor_id', fornecedor.id)
      .gte('dia', thirtyDaysAgoDate)
      .order('dia', { ascending: true });

    const dadosGrafico = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const diaStr = d.toISOString().split('T')[0];
      const metrica = metricasDiarias?.find(m => m.dia === diaStr);
      dadosGrafico.push({
        dia: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        valor: metrica?.visualizacoes || 0
      });
    }

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const { count: oportunidadesCount } = await supabase
      .from('eventos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rascunho')
      .gte('data_evento', new Date().toISOString().split('T')[0])
      .lte('data_evento', sixMonthsFromNow.toISOString().split('T')[0]);

    res.status(200).json({
      fornecedor: {
        nomeEmpresa: fornecedor.nome_empresa,
        plano: fornecedor.plano,
        ativo: fornecedor.ativo,
        cidade: fornecedor.cidade,
        categoria: fornecedor.categoria
      },
      metricas: {
        visualizacoes: fornecedor.visualizacoes,
        cliques: cliques?.length || 0,
        avaliacaoMedia: Number(fornecedor.avaliacao_media) || 0,
        totalAvaliacoes: fornecedor.total_avaliacoes
      },
      grafico: dadosGrafico,
      oportunidades: oportunidadesCount || 0
    });
  } catch (err) {
    console.error('[API metricas] erro:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
