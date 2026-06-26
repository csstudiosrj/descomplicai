import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Configuracao do Supabase incompleta' });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticacao nao fornecido' });
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }
  const { data: cerimonialista, error: cerimError } = await supabase
    .from('cerimonialistas').select('id').eq('usuario_id', user.id).single();
  if (cerimError || !cerimonialista) {
    return res.status(403).json({ error: 'Usuario nao e cerimonialista' });
  }
  try {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'ID do modelo e obrigatorio' });
    const { data: existing, error: checkError } = await supabase
      .from('cerimonialista_modelos').select('id')
      .eq('id', id).eq('cerimonialista_id', cerimonialista.id).single();
    if (checkError || !existing) {
      return res.status(403).json({ error: 'Modelo nao encontrado ou sem permissao' });
    }
    const cleanUpdates = {};
    if (updates.tipo !== undefined) cleanUpdates.tipo = updates.tipo?.trim() || null;
    if (updates.nome !== undefined) cleanUpdates.nome = updates.nome.trim();
    if (updates.conteudo !== undefined) cleanUpdates.conteudo = updates.conteudo?.trim() || null;
    if (updates.variaveis !== undefined) cleanUpdates.variaveis = updates.variaveis || null;
    const { data, error } = await supabase.from('cerimonialista_modelos')
      .update(cleanUpdates).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json({ modelo: data });
  } catch (err) {
    console.error('[API modelos/atualizar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}