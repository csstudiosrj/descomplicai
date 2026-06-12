// pages/api/gerar-pdf.js
import { renderToBuffer } from '@react-pdf/renderer';
import { MemorialPDF } from '../../components/pdf/MemorialPDF';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { memorial, dadosEvento } = req.body;

  if (!memorial || !dadosEvento) {
    return res.status(400).json({ erro: 'Dados insuficientes para gerar PDF' });
  }

  try {
    const buffer = await renderToBuffer(<MemorialPDF memorial={memorial} dadosEvento={dadosEvento} />);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    res.send(buffer);
  } catch (erro) {
    console.error('Erro completo:', erro);
    console.error('Stack:', erro.stack);
    res.status(500).json({
      erro: 'Erro ao gerar PDF',
      detalhe: erro.message,
      stack: process.env.NODE_ENV === 'development' ? erro.stack : undefined,
    });
  }
}