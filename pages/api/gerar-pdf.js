import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import QRCode from 'qrcode';
import { gerarTemplateHTML } from '../../utils/pdfTemplate';

// URL do tarball do Chromium v147.0.0 (x64) — confirmada
const TARBALL_URL = 'https://github.com/Sparticuz/chromium/releases/download/v147.0.0/chromium-v147.0.0-pack.x64.tar';

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
    // QR Code
    let qrCodeDataUri = null;
    try {
      qrCodeDataUri = await QRCode.toDataURL('https://arxum.csstudios.site/descomplicai', {
        width: 200, margin: 2, color: { dark: '#1A1714', light: '#FFFFFF' }
      });
    } catch (e) { console.warn('QR code:', e.message); }

    // Gerar HTML editorial
    const html = gerarTemplateHTML({ memorial, dadosEvento, qrCodeDataUri });

    // Inicializar Chromium
    console.log('Baixando Chromium...');
    const executablePath = await chromium.executablePath(TARBALL_URL);
    console.log('Chromium pronto:', executablePath);

    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000); // aguarda fontes e imagens

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    console.log('PDF gerado:', pdf.length, 'bytes');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    return res.send(pdf);

  } catch (erro) {
    console.error('Erro PDF:', erro.message);
    if (browser) await browser.close();
    return res.status(500).json({ erro: 'Erro ao gerar PDF', detalhe: erro.message });
  }
}