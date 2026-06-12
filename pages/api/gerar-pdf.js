// pages/api/gerar-pdf.js
import { renderToBuffer } from '@react-pdf/renderer';
import { MemorialPDF } from '../../components/pdf/MemorialPDF';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { memorial, dadosEvento } = req.body;

  if (!memorial || !dadosEvento) {
    return res.status(400).json({ erro: 'Dados insuficientes para gerar PDF' });
  }

  // 🔧 Verificação de pagamento removida temporariamente.
  // Confiamos no parâmetro da URL até o webhook do Mercado Pago estar ativo.

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