import { createClient } from '@supabase/supabase-js';
import { enviarEmailTemplate } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/fornecedor/lembrete-pagamento
 * Body: { fornecedor_id } ou chamado por cron
 * Envia lembrete 3 dias antes do trial expirar
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Segurança: aceita chamada interna (cron) ou admin
  const apiKey = req.headers['x-api-key'];
  const isCron = apiKey === process.env.CRON_SECRET;

  if (!isCron) {
    // Verifica se é admin
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'Não autorizado' });
    } else {
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }

  const { fornecedor_id } = req.body;

  // Se não passar fornecedor_id, busca todos com trial expirando em 3 dias
  if (!fornecedor_id) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 3);
    const dataLimiteStr = dataLimite.toISOString().split('T')[0];

    const { data: fornecedores } = await supabaseAdmin
      .from('fornecedores')
      .select('id, email, nome_fantasia, trial_expira_em')
      .eq('status', 'trial')
      .lte('trial_expira_em', `${dataLimiteStr}T23:59:59`)
      .gte('trial_expira_em', `${dataLimiteStr}T00:00:00`);

    if (!fornecedores || fornecedores.length === 0) {
      return res.status(200).json({ message: 'Nenhum fornecedor com trial expirando em 3 dias' });
    }

    const resultados = [];
    for (const f of fornecedores) {
      const resultado = await enviarEmailTemplate(
        {
          para: f.email,
          template: 'lembrete_pagamento',
          variaveis: {
            nome_fantasia: f.nome_fantasia,
            data_expiracao: new Date(f.trial_expira_em).toLocaleDateString('pt-BR'),
            link_pagamento: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/pagamento`,
          },
        },
        supabaseAdmin
      );

      await supabaseAdmin.from('email_logs').insert({
        destinatario: f.email,
        template: 'lembrete_pagamento',
        status: resultado.error ? 'erro' : 'enviado',
        erro: resultado.error?.message || null,
        provider_id: resultado.id || null,
      });

      resultados.push({ fornecedor_id: f.id, status: resultado.error ? 'erro' : 'enviado' });
    }

    return res.status(200).json({ success: true, enviados: resultados.length, resultados });
  }

  // Envio individual
  const { data: f } = await supabaseAdmin
    .from('fornecedores')
    .select('email, nome_fantasia, trial_expira_em')
    .eq('id', fornecedor_id)
    .single();

  if (!f) return res.status(404).json({ error: 'Fornecedor não encontrado' });

  const resultado = await enviarEmailTemplate(
    {
      para: f.email,
      template: 'lembrete_pagamento',
      variaveis: {
        nome_fantasia: f.nome_fantasia,
        data_expiracao: new Date(f.trial_expira_em).toLocaleDateString('pt-BR'),
        link_pagamento: `${process.env.NEXT_PUBLIC_SITE_URL}/fornecedor/pagamento`,
      },
    },
    supabaseAdmin
  );

  await supabaseAdmin.from('email_logs').insert({
    destinatario: f.email,
    template: 'lembrete_pagamento',
    status: resultado.error ? 'erro' : 'enviado',
    erro: resultado.error?.message || null,
    provider_id: resultado.id || null,
  });

  if (resultado.error) {
    return res.status(500).json({ error: 'Falha ao enviar lembrete', detalhe: resultado.error.message });
  }

  return res.status(200).json({ success: true, message: 'Lembrete enviado' });
}
