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
    const { nome, email, acesso = 'operacional' } = req.body;
    if (!nome?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Nome e e-mail sao obrigatorios' });
    }
    const { data: authUsers, error: authListError } = await supabase.auth.admin.listUsers();
    if (authListError) {
      return res.status(500).json({ error: 'Erro ao verificar usuario' });
    }
    const usuarioExistente = authUsers?.users?.find((u) => u.email === email.trim());
    let usuarioId = usuarioExistente?.id;
    if (!usuarioExistente) {
      const { data: novoUser, error: createError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password: Math.random().toString(36).slice(-8),
        email_confirm: true,
      });
      if (createError) {
        return res.status(400).json({ error: 'Erro ao criar usuario: ' + createError.message });
      }
      usuarioId = novoUser.user.id;
    }
    const { data: existente, error: checkError } = await supabase
      .from('cerimonialista_assistentes').select('id')
      .eq('cerimonialista_id', cerimonialista.id).eq('usuario_id', usuarioId).single();
    if (existente) {
      return res.status(409).json({ error: 'Este usuario ja e assistente' });
    }
    const { data, error } = await supabase.from('cerimonialista_assistentes').insert({
      cerimonialista_id: cerimonialista.id,
      usuario_id: usuarioId,
      nome: nome.trim(),
      email: email.trim(),
      acesso,
      ativo: true,
    }).select().single();
    if (error) throw error;
    return res.status(201).json({ assistente: data });
  } catch (err) {
    console.error('[API assistentes/convidar]', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
// Rate limit: conviteLimiter
export default withRateLimit(_handler, conviteLimiter);
