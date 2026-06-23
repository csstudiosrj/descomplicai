import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { contrato_id } = req.body;
  if (!contrato_id) {
    return res.status(400).json({ erro: 'contrato_id obrigatório' });
  }

  try {
    const { error } = await supabase
      .from('contratos')
      .update({ status: 'enviado', atualizado_em: new Date().toISOString() })
      .eq('id', contrato_id);

    if (error) throw error;

    return res.status(200).json({ sucesso: true, mensagem: 'Status atualizado para enviado' });
  } catch (err) {
    console.error('Erro ao enviar contrato:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}