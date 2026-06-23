import { createClient } from '@supabase/supabase-js';
import { enviarEmailRecusaNoivos } from '../../../lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { token, justificativa } = req.body;
  if (!token) {
    return res.status(400).json({ erro: 'Token obrigatório' });
  }

  try {
    const { data: contrato, error: err1 } = await supabase
      .from('contratos')
      .select('id, evento_id, fornecedor_id, status, fornecedores(nome, email)')
      .eq('token_assinatura', token)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    if (contrato.status === 'assinado' || contrato.status === 'recusado') {
      return res.status(400).json({ erro: 'Contrato já finalizado' });
    }

    const { error: err2 } = await supabase
      .from('contratos')
      .update({
        status: 'recusado',
        recusado_em: new Date().toISOString(),
        justificativa_recusa: justificativa?.trim() || null,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', contrato.id);

    if (err2) throw err2;

    // Notifica noivos
    const { data: evento } = await supabase
      .from('eventos')
      .select('nome_evento, usuario_id')
      .eq('id', contrato.evento_id)
      .single();

    let emailNoivos = null;
    try {
      const { data: user } = await supabase.auth.admin.getUserById(evento?.usuario_id);
      emailNoivos = user?.user?.email;
    } catch (e) { /* ignora erro de auth */ }

    if (emailNoivos) {
      await enviarEmailRecusaNoivos({
        to: emailNoivos,
        fornecedorNome: contrato.fornecedores?.nome || 'Fornecedor',
        noivosNome: evento?.nome_evento || 'os noivos',
        justificativa: justificativa?.trim(),
      });
    }

    return res.status(200).json({ sucesso: true, mensagem: 'Contrato recusado' });
  } catch (err) {
    console.error('Erro ao recusar contrato:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}