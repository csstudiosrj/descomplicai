// pages/api/gerar-pdf.js
import { renderToBuffer } from '@react-pdf/renderer';
import { MemorialPDF } from '../../components/pdf/MemorialPDF';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { memorial, dadosEvento, userId } = req.body;

  if (!memorial || !dadosEvento || !userId) {
    return res.status(400).json({ erro: 'Dados insuficientes para gerar PDF' });
  }

  // Verifica pagamento no banco (ex: ao menos um pagamento 'aprovado' para este usuário)
  const { data: pagamentos, error: errPag } = await supabase
    .from('pagamentos')
    .select('id')
    .eq('usuario_id', userId)
    .eq('status', 'aprovado')
    .limit(1);

  if (errPag || !pagamentos || pagamentos.length === 0) {
    return res.status(402).json({ erro: 'Pagamento não confirmado. Adquira o PDF primeiro.' });
  }

  try {
    const buffer = await renderToBuffer(<MemorialPDF memorial={memorial} dadosEvento={dadosEvento} />);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    res.send(buffer);
  } catch (erro) {
    console.error('Erro ao gerar PDF:', erro);
    res.status(500).json({ erro: 'Erro ao gerar PDF', detalhe: erro.message });
  }
}