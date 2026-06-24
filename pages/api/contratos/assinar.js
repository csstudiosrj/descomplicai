import { createClient } from '@supabase/supabase-js';
import { enviarEmailAssinaturaNoivos } from '../../../lib/email';
import { gerarPDFContratoAssinado } from '../../../utils/pdfContrato';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { token, nome, email } = req.body;
  if (!token) {
    return res.status(400).json({ erro: 'Token obrigatório' });
  }
  if (!nome?.trim()) {
    return res.status(400).json({ erro: 'Nome obrigatório' });
  }

  try {
    const { data: contrato, error: err1 } = await supabase
      .from('contratos')
      .select('id, evento_id, fornecedor_id, tipo, status, conteudo, token_assinatura, fornecedores(nome, email)')
      .eq('token_assinatura', token)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    if (contrato.status === 'assinado') {
      return res.status(400).json({ erro: 'Contrato já assinado' });
    }

    const { error: err2 } = await supabase
      .from('contratos')
      .update({
        assinado_fornecedor_em: new Date().toISOString(),
        fornecedor_nome_assinatura: nome.trim(),
        fornecedor_email_assinatura: email?.trim() || null,
        status: 'assinado',
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', contrato.id);

    if (err2) throw err2;

    let pdfUrl = null;
    try {
      const { data: evento } = await supabase
        .from('eventos')
        .select('nome_evento, data_evento, local_evento, cidade_evento')
        .eq('id', contrato.evento_id)
        .single();

      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0').toString();

      pdfUrl = await gerarPDFContratoAssinado({
        contrato,
        fornecedor: contrato.fornecedores,
        evento,
        rodape: {
          nome: nome.trim(),
          email: email?.trim() || contrato.fornecedores?.email || '',
          dataHora: new Date().toLocaleString('pt-BR'),
          ip: ip.split(',')[0].trim(),
          identificador: contrato.token_assinatura || contrato.id,
        }
      });

      if (pdfUrl) {
        await supabase
          .from('contratos')
          .update({ pdf_url: pdfUrl, atualizado_em: new Date().toISOString() })
          .eq('id', contrato.id);
      }
    } catch (pdfErr) {
      console.error('Erro ao gerar PDF automaticamente:', pdfErr);
    }

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
      await enviarEmailAssinaturaNoivos({
        to: emailNoivos,
        fornecedorNome: nome.trim(),
        noivosNome: evento?.nome_evento || 'os noivos',
        contratoTipo: contrato.tipo === 'upload_fornecedor' ? 'Upload do fornecedor' : (contrato.tipo || 'Prestação de serviços'),
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Contrato assinado com sucesso!',
      contrato_id: contrato.id,
      pdf_url: pdfUrl,
    });
  } catch (err) {
    console.error('Erro ao assinar contrato:', err);
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}
