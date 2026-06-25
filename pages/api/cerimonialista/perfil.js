import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CAMPOS_EDITAVEIS = [
  'nome_empresa', 'cnpj', 'bio', 'portfolio_urls',
  'instagram', 'site', 'telefone', 'cidade', 'estado', 'regiao_atuacao',
];

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

  try {
    if (req.method === 'GET') {
      const { data: cerimonialista, error } = await supabase
        .from('cerimonialistas')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (error || !cerimonialista) {
        return res.status(404).json({ error: 'Perfil não encontrado' });
      }

      const { data: assistentes, error: assistError } = await supabase
        .from('cerimonialista_assistentes')
        .select('id, nome, email, acesso, ativo, criado_em')
        .eq('cerimonialista_id', cerimonialista.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      return res.status(200).json({
        perfil: cerimonialista,
        assistentes: assistentes || [],
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const updates = req.body;

      const cleanUpdates = {};
      for (const key of Object.keys(updates)) {
        if (CAMPOS_EDITAVEIS.includes(key)) {
          if (key === 'portfolio_urls') {
            cleanUpdates[key] = Array.isArray(updates[key]) ? updates[key] : [];
          } else if (updates[key] !== undefined) {
            cleanUpdates[key] = typeof updates[key] === 'string' ? updates[key].trim() : updates[key];
          }
        }
      }

      if (Object.keys(cleanUpdates).length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
      }

      cleanUpdates.atualizado_em = new Date().toISOString();

      const { data, error } = await supabase
        .from('cerimonialistas')
        .update(cleanUpdates)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Perfil não encontrado' });
      }

      return res.status(200).json({ perfil: data });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'PATCH']);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  } catch (err) {
    console.error('[API perfil]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
