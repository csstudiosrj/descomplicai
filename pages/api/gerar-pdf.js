import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import QRCode from 'qrcode';
import { gerarTemplateHTML } from '../../utils/pdfTemplate';

const TARBALL_URL = 'https://github.com/Sparticuz/chromium/releases/download/v147.0.2/chromium-v147.0.2-pack.x64.tar';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { memorial, dadosEvento } = req.body;
  if (!memorial || !dadosEvento) {
    return res.status(400).json({ erro: 'Dados insuficientes' });
  }

  console.log('=== GERANDO PDF COM PUPPETEER ===');
  console.log('Memorial length:', memorial.length);
  console.log('Casal:', dadosEvento.nomePessoa1, '&', dadosEvento.nomePessoa2);

  let browser = null;
  try {
    let qrCodeDataUri = null;
    try {
      qrCodeDataUri = await QRCode.toDataURL('https://arxum.csstudios.site/descomplicai', {
        width: 200, margin: 2, color: { dark: '#1A1714', light: '#FFFFFF' }
      });
    } catch (e) { console.warn('QR code falhou:', e.message); }

    const html = gerarTemplateHTML({ memorial, dadosEvento, qrCodeDataUri });

    console.log('Baixando Chromium...');
    const executablePath = await chromium.executablePath(TARBALL_URL);
    console.log('Chromium pronto:', executablePath);

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',   // ESSENCIAL para Vercel
        '--disable-gpu',
        '--disable-software-rasterizer',
      ],
      executablePath,
      headless: 'shell',               // ← CORREÇÃO: v147+ exige "shell"
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForTimeout(2000);  // espera fonts e imagens

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    console.log('PDF gerado:', pdfBuffer.length, 'bytes');

    // ← CORREÇÃO: res.end() em vez de res.send()
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    
    return res.end(pdfBuffer);

  } catch (erro) {
    console.error('Erro PDF:', erro);
    if (browser) { try { await browser.close(); } catch (e) {} }
    return res.status(500).json({ erro: 'Erro ao gerar PDF', detalhe: erro.message });
  }
}