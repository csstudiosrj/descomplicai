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
          .from('cerimonialista_financeiro')
          .select('*')
          .eq('cerimonialista_id', cerimonialistaId)
          .order('data_vencimento', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ lancamentos: data || [] });
      }

      case 'POST': {
        const { evento_id, tipo, categoria, descricao, valor, data_vencimento, pago } = req.body;

        if (!tipo || !valor) {
          return res.status(400).json({ error: 'Tipo e valor são obrigatórios' });
        }

        const { data, error } = await supabase
          .from('cerimonialista_financeiro')
          .insert({
            cerimonialista_id: cerimonialistaId,
            evento_id: evento_id || null,
            tipo,
            categoria: categoria?.trim() || null,
            descricao: descricao?.trim() || null,
            valor: parseFloat(valor),
            data_vencimento: data_vencimento || null,
            pago: pago || false,
          })
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json({ lancamento: data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do lançamento é obrigatório' });
        }

        const { data: existing, error: checkError } = await supabase
          .from('cerimonialista_financeiro')
          .select('id')
          .eq('id', id)
          .eq('cerimonialista_id', cerimonialistaId)
          .single();

        if (checkError || !existing) {
          return res.status(403).json({ error: 'Lançamento não encontrado ou sem permissão' });
        }

        const cleanUpdates = {};
        if (updates.evento_id !== undefined) cleanUpdates.evento_id = updates.evento_id || null;
        if (updates.tipo !== undefined) cleanUpdates.tipo = updates.tipo;
        if (updates.categoria !== undefined) cleanUpdates.categoria = updates.categoria?.trim() || null;
        if (updates.descricao !== undefined) cleanUpdates.descricao = updates.descricao?.trim() || null;
        if (updates.valor !== undefined) cleanUpdates.valor = parseFloat(updates.valor);
        if (updates.data_vencimento !== undefined) cleanUpdates.data_vencimento = updates.data_vencimento || null;
        if (updates.pago !== undefined) cleanUpdates.pago = updates.pago;

        const { data, error } = await supabase
          .from('cerimonialista_financeiro')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ lancamento: data });
      }

      case 'DELETE': {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do lançamento é obrigatório' });
        }

        const { error } = await supabase
          .from('cerimonialista_financeiro')
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
    console.error('[API financeiro]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
