import { renderToBuffer, Font } from '@react-pdf/renderer';
import { MemorialPDF } from '../../components/pdf/MemorialPDF';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import { getImagem } from '../../utils/pdfUtils';

const BASE_FONTS = path.resolve(process.cwd(), 'public', 'fonts');

const FONTES_DISPONIVEIS = {
  'Cormorant Garamond': 'cormorant-garamond-v21-latin-regular.woff2',
  'Playfair Display': 'playfair-display-v40-latin-regular.woff2',
  'Amatic SC': 'amatic-sc-v28-latin-regular.woff2',
  'Lora': 'lora-v37-latin-regular.woff2',
  'Josefin Sans': 'josefin-sans-v34-latin-regular.woff2',
  'Montserrat': 'montserrat-v31-latin-regular.woff2',
  'Open Sans': 'open-sans-v44-latin-regular.woff2',
  'Inter': 'inter-v20-latin-regular.woff2',
  'Oswald': 'oswald-v57-latin-regular.woff2',
  'Roboto': 'roboto-v51-latin-regular.woff2',
  'Pacifico': 'pacifico-v23-latin-regular.woff2',
  'Nunito': 'nunito-v32-latin-regular.woff2',
  'Great Vibes': 'great-vibes-v21-latin-regular.woff2',
  'Crimson Text': 'crimson-text-v19-latin-regular.woff2',
  'EB Garamond': 'eb-garamond-v32-latin-regular.woff2',
  'DM Sans': 'dm-sans-v17-latin-regular.woff2',
  'Space Mono': 'space-mono-v17-latin-regular.woff2',
};

function registrarFontes() {
  for (const [family, arquivo] of Object.entries(FONTES_DISPONIVEIS)) {
    const caminho = path.join(BASE_FONTS, arquivo);
    if (fs.existsSync(caminho) && fs.statSync(caminho).size > 0) {
      try { Font.register({ family, src: caminho }); } catch (e) { console.warn(`Fonte ${family}:`, e.message); }
    } else {
      console.warn(`Fonte não encontrada: ${caminho}`);
    }
  }
}

registrarFontes();

// Le dimensões de JPEG/PNG sem dependências nativas (sharp)
function getImageDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // JPEG: procura marker FF C0 ou FF C2
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      for (let i = 2; i < buffer.length - 9; i++) {
        if (buffer[i] === 0xFF && (buffer[i+1] === 0xC0 || buffer[i+1] === 0xC2)) {
          return {
            width: buffer.readUInt16BE(i + 7),
            height: buffer.readUInt16BE(i + 5),
          };
        }
      }
    }
    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }
  } catch (e) {
    console.warn('Erro ao ler dimensões:', e.message);
  }
  return { width: 320, height: 240 };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { memorial, dadosEvento } = req.body;
  if (!memorial || !dadosEvento) {
    return res.status(400).json({ erro: 'Dados insuficientes' });
  }

  console.log('=== MEMORIAL (primeiros 300 chars) ===');
  console.log(memorial?.substring(0, 300));
  console.log('=== TAMANHO ===', memorial?.length);
  console.log('=== DADOS EVENTO ===', JSON.stringify(dadosEvento, null, 2)?.substring(0, 300));
  console.log('=== CWD ===', process.cwd());

  const testeImg = path.join(process.cwd(), 'public', 'images', 'flores', 'rosas-1.jpg');
  console.log('=== IMAGEM EXISTE? ===', fs.existsSync(testeImg), testeImg);

  // Detectar dimensões das imagens para proporção correta
  const dimensoesImagens = {};
  const estilo = dadosEvento?.estilo || 'classico';
  const flores = dadosEvento?.flores || '';

  const imagensParaDetectar = [
    { key: 'imagemFlores', src: getImagem('flores', flores) || getImagem('flores', 'default') },
    { key: 'imagemVestido', src: getImagem('vestido', dadosEvento?.estiloVestido) || getImagem('vestido', 'default') },
    { key: 'imagemMesa', src: getImagem('mesaPosta', estilo) || getImagem('mesaPosta', 'default') },
    { key: 'imagemDecoracao', src: getImagem('decoracao', estilo) || getImagem('decoracao', 'default') },
    { key: 'imagemCerimonia', src: getImagem('cerimonia', estilo) || getImagem('cerimonia', 'default') },
    { key: 'imagemAlimentacao', src: getImagem('alimentacao', estilo) || getImagem('alimentacao', 'default') },
    { key: 'imagemEntretenimento', src: getImagem('entretenimento', estilo) || getImagem('entretenimento', 'default') },
    { key: 'imagemLocal', src: getImagem('local', estilo) || getImagem('local', 'default') },
    { key: 'imagemPapelaria', src: getImagem('papelaria', estilo) || getImagem('papelaria', 'default') },
  ];

  for (const { key, src } of imagensParaDetectar) {
    if (src && fs.existsSync(src)) {
      const dims = getImageDimensions(src);
      dimensoesImagens[key] = dims;
      console.log(`=== DIMENSÃO ${key} ===`, dims.width, 'x', dims.height);
    } else {
      console.warn(`Imagem não encontrada: ${src}`);
      dimensoesImagens[key] = { width: 320, height: 240 };
    }
  }

  let qrCodeDataUri = null;
  try {
    qrCodeDataUri = await QRCode.toDataURL('https://arxum.csstudios.site/descomplicai', {
      width: 200, margin: 2, color: { dark: '#1A1714', light: '#FFFFFF' }
    });
  } catch (e) { console.warn('QR code:', e.message); }

  try {
    const buffer = await renderToBuffer(
      <MemorialPDF
        memorial={memorial}
        dadosEvento={dadosEvento}
        usarFontesNativas={false}
        qrCodeDataUri={qrCodeDataUri}
        dimensoesImagens={dimensoesImagens}
      />
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    return res.send(buffer);
  } catch (erro) {
    console.error('Erro PDF:', erro.message);
    try {
      const buffer = await renderToBuffer(
        <MemorialPDF
          memorial={memorial}
          dadosEvento={dadosEvento}
          usarFontesNativas={true}
          qrCodeDataUri={qrCodeDataUri}
          dimensoesImagens={dimensoesImagens}
        />
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