import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ erro: 'Token obrigatório' });
  }

  try {
    const { data: contrato, error: err1 } = await supabase
      .from('contratos')
      .select('id, status')
      .eq('token_assinatura', token)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    // Só marca visualizado se estiver enviado (não sobrescreve assinado/recusado)
    if (contrato.status === 'enviado') {
      const { error: err2 } = await supabase
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
  } catch (err) {
    console.error('Erro ao marcar visualizado:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}