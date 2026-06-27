import { createClient } from '@supabase/supabase-js';
import { gerarPDFContratoAssinado } from '../../../utils/pdfContrato';
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

    const { contrato_id } = req.body;
    if (!contrato_id) {
      return res.status(400).json({ erro: 'contrato_id obrigatório' });
    }

    const { data: contrato, error: err1 } = await supabaseAdmin
      .from('contratos')
      .select('id, evento_id, tipo, conteudo, token_assinatura, fornecedor_nome_assinatura, fornecedor_email_assinatura, fornecedores(nome, email)')
      .eq('id', contrato_id)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    const { data: evento } = await supabaseAdmin
      .from('eventos')
      .select('nome_evento, data_evento, local_evento, cidade_evento')
      .eq('id', contrato.evento_id)
      .single();

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0').toString();
    const rodape = {
      nome: contrato.fornecedor_nome_assinatura || contrato.fornecedores?.nome || 'Fornecedor',
      email: contrato.fornecedor_email_assinatura || contrato.fornecedores?.email || '',
      dataHora: new Date().toLocaleString('pt-BR'),
      ip: ip.split(',')[0].trim(),
      identificador: contrato.token_assinatura || contrato.id,
    };

    const pdfUrl = await gerarPDFContratoAssinado({ contrato, fornecedor: contrato.fornecedores, evento, rodape });

    const { error: err2 } = await supabaseAdmin
      .from('contratos')
      .update({ pdf_url: pdfUrl, atualizado_em: new Date().toISOString() })
      .eq('id', contrato_id);

    if (err2) throw err2;

    return res.status(200).json({ sucesso: true, pdf_url: pdfUrl });
  } catch (error) {
    console.error('Erro em contratos/pdf:', error.message);
    return res.status(500).json({
      erro: 'Erro interno do servidor. Tente novamente.',
    });
  }
}
