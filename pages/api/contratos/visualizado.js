import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ erro: 'Método não permitido' });
    }

    const { token: tokenBody } = req.body;
    if (!tokenBody) {
      return res.status(400).json({ erro: 'Token obrigatório' });
    }

    const { data: contrato, error: err1 } = await supabaseAdmin
      .from('contratos')
      .select('id, status')
      .eq('token_assinatura', tokenBody)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    // Só marca visualizado se estiver enviado (não sobrescreve assinado/recusado)
    if (contrato.status === 'enviado') {
      const { error: err2 } = await supabaseAdmin
        .from('contratos')
        .update({
          status: 'visualizado',
          visualizado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', contrato.id);

      if (err2) throw err2;
    }

    return res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error('Erro em contratos/visualizado:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}
