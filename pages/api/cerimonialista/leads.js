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

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Buscar cerimonialista do usuário autenticado
  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuário não é cerimonialista' });
  }

  const cerimonialistaId = cerimonialista.id;

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('cerimonialista_leads')
          .select('*')
          .eq('cerimonialista_id', cerimonialistaId)
          .order('criado_em', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ leads: data || [] });
      }

      case 'POST': {
        const {
          nome_lead,
          email,
          telefone,
          tipo_evento,
          data_prevista,
          valor_proposta,
          estagio = 'contato_inicial',
          fonte,
          notas,
        } = req.body;

        if (!nome_lead?.trim()) {
          return res.status(400).json({ error: 'Nome do lead é obrigatório' });
        }

        const { data, error } = await supabase
          .from('cerimonialista_leads')
          .insert({
            cerimonialista_id: cerimonialistaId,
            nome_lead: nome_lead.trim(),
            email: email?.trim() || null,
            telefone: telefone?.trim() || null,
            tipo_evento: tipo_evento?.trim() || null,
            data_prevista: data_prevista || null,
            valor_proposta: valor_proposta ? parseFloat(valor_proposta) : null,
            estagio,
            fonte: fonte?.trim() || null,
            notas: notas?.trim() || null,
          })
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json({ lead: data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do lead é obrigatório' });
        }

        // Verificar se o lead pertence ao cerimonialista
        const { data: existing, error: checkError } = await supabase
          .from('cerimonialista_leads')
          .select('id')
          .eq('id', id)
          .eq('cerimonialista_id', cerimonialistaId)
          .single();

        if (checkError || !existing) {
          return res.status(403).json({ error: 'Lead não encontrado ou sem permissão' });
        }

        const cleanUpdates = {};
        if (updates.nome_lead !== undefined) cleanUpdates.nome_lead = updates.nome_lead.trim();
        if (updates.email !== undefined) cleanUpdates.email = updates.email?.trim() || null;
        if (updates.telefone !== undefined) cleanUpdates.telefone = updates.telefone?.trim() || null;
        if (updates.tipo_evento !== undefined) cleanUpdates.tipo_evento = updates.tipo_evento?.trim() || null;
        if (updates.data_prevista !== undefined) cleanUpdates.data_prevista = updates.data_prevista || null;
        if (updates.valor_proposta !== undefined) cleanUpdates.valor_proposta = updates.valor_proposta ? parseFloat(updates.valor_proposta) : null;
        if (updates.estagio !== undefined) cleanUpdates.estagio = updates.estagio;
        if (updates.fonte !== undefined) cleanUpdates.fonte = updates.fonte?.trim() || null;
        if (updates.notas !== undefined) cleanUpdates.notas = updates.notas?.trim() || null;
        cleanUpdates.atualizado_em = new Date().toISOString();

        const { data, error } = await supabase
          .from('cerimonialista_leads')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ lead: data });
      }

      case 'DELETE': {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do lead é obrigatório' });
        }

        const { error } = await supabase
          .from('cerimonialista_leads')
          .delete()
          .eq('id', id)
          .eq('cerimonialista_id', cerimonialistaId);

        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido` });
    }
  } catch (err) {
    console.error('[API leads]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
