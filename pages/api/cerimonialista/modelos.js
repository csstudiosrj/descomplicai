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
          .from('cerimonialista_modelos')
          .select('*')
          .eq('cerimonialista_id', cerimonialistaId)
          .order('criado_em', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ modelos: data || [] });
      }

      case 'POST': {
        const { tipo, nome, conteudo, variaveis } = req.body;

        if (!nome?.trim()) {
          return res.status(400).json({ error: 'Nome do modelo é obrigatório' });
        }

        const { data, error } = await supabase
          .from('cerimonialista_modelos')
          .insert({
            cerimonialista_id: cerimonialistaId,
            tipo: tipo?.trim() || null,
            nome: nome.trim(),
            conteudo: conteudo?.trim() || null,
            variaveis: variaveis || null,
          })
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json({ modelo: data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do modelo é obrigatório' });
        }

        const { data: existing, error: checkError } = await supabase
          .from('cerimonialista_modelos')
          .select('id')
          .eq('id', id)
          .eq('cerimonialista_id', cerimonialistaId)
          .single();

        if (checkError || !existing) {
          return res.status(403).json({ error: 'Modelo não encontrado ou sem permissão' });
        }

        const cleanUpdates = {};
        if (updates.tipo !== undefined) cleanUpdates.tipo = updates.tipo?.trim() || null;
        if (updates.nome !== undefined) cleanUpdates.nome = updates.nome.trim();
        if (updates.conteudo !== undefined) cleanUpdates.conteudo = updates.conteudo?.trim() || null;
        if (updates.variaveis !== undefined) cleanUpdates.variaveis = updates.variaveis || null;

        const { data, error } = await supabase
          .from('cerimonialista_modelos')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ modelo: data });
      }

      case 'DELETE': {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do modelo é obrigatório' });
        }

        const { error } = await supabase
          .from('cerimonialista_modelos')
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
    console.error('[API modelos]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
