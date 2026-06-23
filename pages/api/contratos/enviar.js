import { createClient } from '@supabase/supabase-js';
import { enviarEmailContratoParaFornecedor } from '../../../lib/email';

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
    const { data: contrato, error: err1 } = await supabase
      .from('contratos')
      .select('id, evento_id, fornecedor_id, tipo, status, token_assinatura, fornecedores(nome, email)')
      .eq('id', contrato_id)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    if (!contrato.fornecedores?.email) {
      return res.status(400).json({ erro: 'Fornecedor sem email cadastrado' });
    }

    // Gera token se não existir
    let token = contrato.token_assinatura;
    if (!token) {
      const { data: novoToken, error: errToken } = await supabase.rpc('gen_random_uuid');
      if (errToken) throw errToken;
      token = novoToken;
      await supabase.from('contratos').update({ token_assinatura: token }).eq('id', contrato_id);
    }

    // Atualiza status
    const { error: err2 } = await supabase
      .from('contratos')
      .update({
        status: 'enviado',
        fornecedor_email_enviado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', contrato_id);

    if (err2) throw err2;

    // Busca evento para email
    const { data: evento } = await supabase
      .from('eventos')
      .select('nome_evento')
      .eq('id', contrato.evento_id)
      .single();

    // Envia email
    await enviarEmailContratoParaFornecedor({
      to: contrato.fornecedores.email,
      fornecedorNome: contrato.fornecedores.nome || 'Fornecedor',
      noivosNome: evento?.nome_evento || 'os noivos',
      token,
    });

    return res.status(200).json({ sucesso: true, mensagem: 'Contrato enviado', token });
  } catch (err) {
    console.error('Erro ao enviar contrato:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}