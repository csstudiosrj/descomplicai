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
          .from('cerimonialista_assistentes')
          .select('*')
          .eq('cerimonialista_id', cerimonialistaId)
          .order('criado_em', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ assistentes: data || [] });
      }

      case 'POST': {
        const { nome, email, acesso = 'operacional' } = req.body;

        if (!nome?.trim() || !email?.trim()) {
          return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
        }

        // Verificar se o usuário existe no Auth
        const { data: authUsers, error: authListError } = await supabase.auth.admin.listUsers();
        if (authListError) {
          return res.status(500).json({ error: 'Erro ao verificar usuário' });
        }

        const usuarioExistente = authUsers?.users?.find((u) => u.email === email.trim());
        let usuarioId = usuarioExistente?.id;

        // Se não existir, criar usuário
        if (!usuarioExistente) {
          const { data: novoUser, error: createError } = await supabase.auth.admin.createUser({
            email: email.trim(),
            password: Math.random().toString(36).slice(-8),
            email_confirm: true,
          });

          if (createError) {
            return res.status(400).json({ error: 'Erro ao criar usuário: ' + createError.message });
          }
          usuarioId = novoUser.user.id;
        }

        // Verificar se já é assistente deste cerimonialista
        const { data: existente, error: checkError } = await supabase
          .from('cerimonialista_assistentes')
          .select('id')
          .eq('cerimonialista_id', cerimonialistaId)
          .eq('usuario_id', usuarioId)
          .single();

        if (existente) {
          return res.status(409).json({ error: 'Este usuário já é assistente' });
        }

        const { data, error } = await supabase
          .from('cerimonialista_assistentes')
          .insert({
            cerimonialista_id: cerimonialistaId,
            usuario_id: usuarioId,
            nome: nome.trim(),
            email: email.trim(),
            acesso,
            ativo: true,
          })
          .select()
          .single();

        if (error) throw error;
        return res.status(201).json({ assistente: data });
      }

      case 'PUT': {
        const { id, ...updates } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do assistente é obrigatório' });
        }

        const { data: existing, error: checkError } = await supabase
          .from('cerimonialista_assistentes')
          .select('id')
          .eq('id', id)
          .eq('cerimonialista_id', cerimonialistaId)
          .single();

        if (checkError || !existing) {
          return res.status(403).json({ error: 'Assistente não encontrado ou sem permissão' });
        }

        const cleanUpdates = {};
        if (updates.nome !== undefined) cleanUpdates.nome = updates.nome.trim();
        if (updates.email !== undefined) cleanUpdates.email = updates.email.trim();
        if (updates.acesso !== undefined) cleanUpdates.acesso = updates.acesso;
        if (updates.ativo !== undefined) cleanUpdates.ativo = updates.ativo;

        const { data, error } = await supabase
          .from('cerimonialista_assistentes')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ assistente: data });
      }

      case 'DELETE': {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do assistente é obrigatório' });
        }

        const { error } = await supabase
          .from('cerimonialista_assistentes')
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
    console.error('[API assistentes]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
