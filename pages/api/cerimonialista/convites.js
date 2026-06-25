import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuração do Supabase incompleta' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // GET público — dados do convite para a página pública
    if (req.method === 'GET') {
      const { leadId } = req.query;

      if (!leadId) {
        return res.status(400).json({ error: 'leadId é obrigatório' });
      }

      const { data: lead, error: leadError } = await supabase
        .from('cerimonialista_leads')
        .select('id, nome_lead, email, tipo_evento, data_prevista, valor_proposta, cerimonialista_id, estagio, convertido_evento_id')
        .eq('id', leadId)
        .eq('estagio', 'contratado')
        .is('convertido_evento_id', null)
        .single();

      if (leadError || !lead) {
        return res.status(404).json({ error: 'Convite não encontrado ou já convertido' });
      }

      const { data: cerimonialista, error: cerimError } = await supabase
        .from('cerimonialistas')
        .select('id, nome_empresa, nome_completo, cidade, estado')
        .eq('id', lead.cerimonialista_id)
        .single();

      if (cerimError) {
        return res.status(500).json({ error: 'Erro ao buscar cerimonialista' });
      }

      return res.status(200).json({ lead, cerimonialista });
    }

    // POST — aceitar convite (requer autenticação)
    if (req.method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const { leadId } = req.body;

      if (!leadId) {
        return res.status(400).json({ error: 'leadId é obrigatório' });
      }

      // Buscar lead
      const { data: lead, error: leadError } = await supabase
        .from('cerimonialista_leads')
        .select('*')
        .eq('id', leadId)
        .eq('estagio', 'contratado')
        .is('convertido_evento_id', null)
        .single();

      if (leadError || !lead) {
        return res.status(404).json({ error: 'Lead não encontrado ou já convertido' });
      }

      // Verificar se o usuário já tem um evento
      const { data: eventoExistente, error: eventoCheckError } = await supabase
        .from('eventos')
        .select('id')
        .eq('usuario_id', user.id)
        .single();

      if (eventoExistente) {
        // Atualizar evento existente com cerimonialista
        const { error: updError } = await supabase
          .from('eventos')
          .update({
            cerimonialista_id: lead.cerimonialista_id,
            casal_confirmado: true,
            nome_evento: lead.nome_lead,
            data_evento: lead.data_prevista,
            orcamento: lead.valor_proposta || 0,
          })
          .eq('id', eventoExistente.id);

        if (updError) throw updError;

        // Atualizar lead
        await supabase
          .from('cerimonialista_leads')
          .update({ convertido_evento_id: eventoExistente.id })
          .eq('id', leadId);

        return res.status(200).json({ evento: eventoExistente });
      }

      // Criar novo evento
      const { data: novoEvento, error: createError } = await supabase
        .from('eventos')
        .insert({
          usuario_id: user.id,
          cerimonialista_id: lead.cerimonialista_id,
          nome_evento: lead.nome_lead,
          data_evento: lead.data_prevista,
          orcamento: lead.valor_proposta || 0,
          status: 'ativo',
          casal_confirmado: true,
          criado_por: 'cerimonialista',
        })
        .select()
        .single();

      if (createError) throw createError;

      // Atualizar lead
      await supabase
        .from('cerimonialista_leads')
        .update({ convertido_evento_id: novoEvento.id })
        .eq('id', leadId);

      return res.status(201).json({ evento: novoEvento });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  } catch (err) {
    console.error('[API convites]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
