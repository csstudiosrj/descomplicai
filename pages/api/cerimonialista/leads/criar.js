import { withRateLimit, conviteLimiter } from "../../../lib/ratelimit";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function _handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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
    const { nome_lead, email, telefone, tipo_evento, data_prevista, valor_proposta, estagio = 'contato_inicial', fonte, notas } = req.body;
    if (!nome_lead?.trim()) {
      return res.status(400).json({ error: 'Nome do lead e obrigatorio' });
    }
    const { data, error } = await supabase.from('cerimonialista_leads').insert({
      cerimonialista_id: cerimonialista.id,
      nome_lead: nome_lead.trim(),
      email: email?.trim() || null,
      telefone: telefone?.trim() || null,
      tipo_evento: tipo_evento?.trim() || null,
      data_prevista: data_prevista || null,
      valor_proposta: valor_proposta ? parseFloat(valor_proposta) : null,
      estagio,
      fonte: fonte?.trim() || null,
      notas: notas?.trim() || null,
    }).select().single();
    if (error) throw error;
    return res.status(201).json({ lead: data });
  } catch (err) {
    console.error('[API leads/criar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
// Rate limit: conviteLimiter
export default withRateLimit(_handler, conviteLimiter);
