import { withRateLimit, pagamentoLimiter } from "../../lib/ratelimit";
import { createClient } from '@supabase/supabase-js';
import { enviarEmailContratoParaFornecedor } from '../../../lib/email';
import { supabase } from '../../../lib/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function _handler(req, res) {
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

    const { contrato_id } = req.body;
    if (!contrato_id) {
      return res.status(400).json({ erro: 'contrato_id obrigatório' });
    }

    const { data: contrato, error: err1 } = await supabaseAdmin
      .from('contratos')
      .select('id, evento_id, fornecedor_id, tipo, status, token_assinatura, assinado_noivos_em, fornecedores(nome, email)')
      .eq('id', contrato_id)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    if (!contrato.fornecedores?.email) {
      return res.status(400).json({ erro: 'Fornecedor sem email cadastrado' });
    }

    if (!contrato.assinado_noivos_em) {
      return res.status(400).json({ erro: 'Assine o contrato antes de enviar ao fornecedor' });
    }

    let tokenAssinatura = contrato.token_assinatura;
    if (!tokenAssinatura) {
      const { data: novoToken, error: errToken } = await supabaseAdmin.rpc('gen_random_uuid');
      if (errToken) throw errToken;
      tokenAssinatura = novoToken;
      await supabaseAdmin.from('contratos').update({ token_assinatura: tokenAssinatura }).eq('id', contrato_id);
    }

    const { error: err2 } = await supabaseAdmin
      .from('contratos')
      .update({
        status: 'enviado',
        fornecedor_email_enviado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', contrato_id);

    if (err2) throw err2;

    const { data: evento } = await supabaseAdmin
      .from('eventos')
      .select('nome_evento')
      .eq('id', contrato.evento_id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://descomplicai.com';

    await enviarEmailContratoParaFornecedor({
      to: contrato.fornecedores.email,
      fornecedorNome: contrato.fornecedores.nome || 'Fornecedor',
      noivosNome: evento?.nome_evento || 'os noivos',
      token: tokenAssinatura,
      baseUrl,
    });

    return res.status(200).json({ sucesso: true, mensagem: 'Contrato enviado', token: tokenAssinatura });
  } catch (error) {
    console.error('Erro em contratos/enviar:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}

// Rate limit: pagamentoLimiter
export default withRateLimit(_handler, pagamentoLimiter);
