import { renderToBuffer } from '@react-pdf/renderer';
import { MemorialPDF } from '../../components/pdf/MemorialPDF';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import { getImagem } from '../../utils/pdfUtils';

// Le dimensões de JPEG/PNG sem sharp
function getImageDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      for (let i = 2; i < buffer.length - 9; i++) {
        if (buffer[i] === 0xFF && (buffer[i+1] === 0xC0 || buffer[i+1] === 0xC2)) {
          return { width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) };
        }
      }
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
  } catch (e) {}
  return { width: 320, height: 240 };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { memorial, dadosEvento } = req.body;
  if (!memorial || !dadosEvento) return res.status(400).json({ erro: 'Dados insuficientes' });

  console.log('=== GERANDO PDF COM REACT-PDF ===');
  console.log('Memorial length:', memorial.length);
  console.log('Casal:', dadosEvento.nomePessoa1, '&', dadosEvento.nomePessoa2);

  const dimensoesImagens = {};
  const estilo = dadosEvento?.estilo || 'classico';
  const flores = dadosEvento?.flores || '';

  const imagensParaDetectar = [
    { key: 'imagemDecoracao', src: getImagem('decoracao', estilo) },
    { key: 'imagemCerimonia', src: getImagem('cerimonia', estilo) },
    { key: 'imagemFlores', src: getImagem('flores', flores) || getImagem('flores', 'default') },
    { key: 'imagemMesa', src: getImagem('mesaPosta', estilo) },
    { key: 'imagemAlimentacao', src: getImagem('alimentacao', estilo) },
    { key: 'imagemEntretenimento', src: getImagem('entretenimento', estilo) },
    { key: 'imagemVestido', src: getImagem('vestido', dadosEvento?.estiloVestido) || getImagem('vestido', 'default') },
    { key: 'imagemPapelaria', src: getImagem('papelaria', estilo) },
  ];

  for (const { key, src } of imagensParaDetectar) {
    if (src && fs.existsSync(src)) {
      dimensoesImagens[key] = getImageDimensions(src);
      console.log(`Dimensão ${key}:`, dimensoesImagens[key]);
    } else {
      dimensoesImagens[key] = { width: 320, height: 240 };
    }
  }

  let qrCodeDataUri = null;
  try {
    qrCodeDataUri = await QRCode.toDataURL('https://arxum.csstudios.site/descomplicai', { width: 200, margin: 2, color: { dark: '#1A1714', light: '#FFFFFF' } });
  } catch (e) { console.warn('QR code:', e.message); }

  try {
    const buffer = await renderToBuffer(
      <MemorialPDF memorial={memorial} dadosEvento={dadosEvento} usarFontesNativas={false} qrCodeDataUri={qrCodeDataUri} dimensoesImagens={dimensoesImagens} />
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    return res.send(buffer);
  } catch (erro) {
    console.error('Erro PDF:', erro.message);
    try {
      const buffer = await renderToBuffer(
        <MemorialPDF memorial={memorial} dadosEvento={dadosEvento} usarFontesNativas={true} qrCodeDataUri={qrCodeDataUri} dimensoesImagens={dimensoesImagens} />
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
      return res.send(buffer);
    } catch (erroFallback) {
      console.error('Erro fallback:', erroFallback.message);
      return res.status(500).json({ erro: 'Erro ao gerar PDF', detalhe: erroFallback.message });
    }
  }
}