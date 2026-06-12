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
    // Tenta renderizar com as fontes personalizadas
    const buffer = await renderToBuffer(
      <MemorialPDF memorial={memorial} dadosEvento={dadosEvento} usarFontesNativas={false} />
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    res.send(buffer);
  } catch (erro) {
    console.error('Erro ao gerar PDF com fontes personalizadas:', erro.message);
    console.error('Stack:', erro.stack);
    console.error('Estilo tentado:', dadosEvento?.estilo);

    try {
      // Fallback: renderiza com fontes nativas
      const buffer = await renderToBuffer(
        <MemorialPDF memorial={memorial} dadosEvento={dadosEvento} usarFontesNativas={true} />
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
      res.send(buffer);
    } catch (erroFallback) {
      console.error('Erro também no fallback:', erroFallback.message);
      res.status(500).json({
        erro: 'Erro ao gerar PDF',
        detalhe: erroFallback.message,
        stack: process.env.NODE_ENV === 'development' ? erroFallback.stack : undefined,
      });
    }
  }
}