import { withRateLimit, conviteLimiter } from '@/lib/rateLimit.js';
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
    const { tipo, nome, conteudo, variaveis } = req.body;
    if (!nome?.trim()) {
      return res.status(400).json({ error: 'Nome do modelo e obrigatorio' });
    }
    const { data, error } = await supabase.from('cerimonialista_modelos').insert({
      cerimonialista_id: cerimonialista.id,
      tipo: tipo?.trim() || null,
      nome: nome.trim(),
      conteudo: conteudo?.trim() || null,
      variaveis: variaveis || null,
    }).select().single();
    if (error) throw error;
    return res.status(201).json({ modelo: data });
  } catch (err) {
    console.error('[API modelos/salvar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
// Rate limit: conviteLimiter
export default withRateLimit(_handler, conviteLimiter);
