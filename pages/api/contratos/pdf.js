import { createClient } from '@supabase/supabase-js';
import { gerarPDFContratoAssinado } from '../../../utils/pdfContrato';

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
      .select('id, evento_id, tipo, conteudo, token_assinatura, fornecedor_nome_assinatura, fornecedor_email_assinatura, fornecedores(nome, email)')
      .eq('id', contrato_id)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    const { data: evento } = await supabase
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

    const { error: err2 } = await supabase
      .from('contratos')
      .update({ pdf_url: pdfUrl, atualizado_em: new Date().toISOString() })
      .eq('id', contrato_id);

    if (err2) throw err2;

    return res.status(200).json({ sucesso: true, pdf_url: pdfUrl });
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}
