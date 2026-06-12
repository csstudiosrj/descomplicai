import { renderToBuffer, Font } from '@react-pdf/renderer';
import { MemorialPDF } from '../../components/pdf/MemorialPDF';
import path from 'path';
import fs from 'fs';

// ========== REGISTRO DE FONTES (nível de módulo, servidor) ==========
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
      try {
        Font.register({ family, src: caminho });
      } catch (e) {
        console.warn(`Falha ao registrar fonte ${family}:`, e.message);
      }
    } else {
      console.warn(`Fonte não encontrada ou vazia: ${caminho}`);
    }
  }
}

// Registra uma vez no carregamento do módulo
registrarFontes();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { memorial, dadosEvento } = req.body;

  if (!memorial || !dadosEvento) {
    return res.status(400).json({ erro: 'Dados insuficientes para gerar PDF' });
  }

  try {
    // Tenta renderizar com fontes personalizadas
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