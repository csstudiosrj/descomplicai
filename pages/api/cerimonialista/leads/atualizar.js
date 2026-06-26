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
    if (!id) return res.status(400).json({ error: 'ID do lead e obrigatorio' });
    const { data: existing, error: checkError } = await supabase
      .from('cerimonialista_leads').select('*')
      .eq('id', id).eq('cerimonialista_id', cerimonialista.id).single();
    if (checkError || !existing) {
      return res.status(403).json({ error: 'Lead nao encontrado ou sem permissao' });
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
    const { data, error } = await supabase.from('cerimonialista_leads')
      .update(cleanUpdates).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json({ lead: data });
  } catch (err) {
    console.error('[API leads/atualizar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}