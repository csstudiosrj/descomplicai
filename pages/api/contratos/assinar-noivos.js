import { withRateLimit, pagamentoLimiter } from '@/lib/rateLimit.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function _handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { contrato_id } = req.body;
  if (!contrato_id) {
    return res.status(400).json({ erro: 'contrato_id obrigatório' });
  }

  try {
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) userId = user.id;
    }

    if (!userId) {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (!sessionError && user) userId = user.id;
    }

    if (!userId) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    const { data: contrato, error: err1 } = await supabase
      .from('contratos')
      .select('id, evento_id, status, assinado_noivos_em')
      .eq('id', contrato_id)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    const { data: evento, error: errEvento } = await supabase
      .from('eventos')
      .select('usuario_id')
      .eq('id', contrato.evento_id)
      .single();

    if (errEvento || !evento || evento.usuario_id !== userId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    if (contrato.assinado_noivos_em) {
      return res.status(400).json({ erro: 'Contrato já assinado pelos noivos' });
    }

    if (contrato.status !== 'rascunho') {
      return res.status(400).json({ erro: 'Só é possível assinar contratos em rascunho' });
    }

    const { error: err2 } = await supabase
      .from('contratos')
      .update({
        assinado_noivos_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', contrato_id);

    if (err2) throw err2;

    return res.status(200).json({ sucesso: true, mensagem: 'Contrato assinado pelos noivos' });
  } catch (err) {
    console.error('Erro ao assinar contrato (noivos):', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}

// Rate limit: pagamentoLimiter
export default withRateLimit(_handler, pagamentoLimiter);
