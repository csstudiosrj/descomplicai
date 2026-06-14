import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import QRCode from 'qrcode';
import { gerarTemplateHTML } from '../../utils/pdfTemplate';
import { montarPayloadParaAPI } from '../../utils/gerador-memorial'; // se precisar

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

  let qrCodeDataUri = null;
  try {
    qrCodeDataUri = await QRCode.toDataURL('https://arxum.csstudios.site/descomplicai', {
      width: 200, margin: 2, color: { dark: '#1A1714', light: '#FFFFFF' }
    });
  } catch (e) { console.warn('QR code:', e.message); }

  let browser = null;
  try {
    // Gera o HTML editorial
    const html = gerarTemplateHTML({ memorial, dadosEvento, qrCodeDataUri });

    // Lança Puppeteer com Chromium compacto para serverless
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    // Aguarda fontes e imagens carregarem
    await page.waitForTimeout(2000);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="memorial-descomplicai.pdf"');
    return res.send(pdf);

  } catch (erro) {
    console.error('Erro Puppeteer:', erro.message);
    if (browser) await browser.close();
    return res.status(500).json({ erro: 'Erro ao gerar PDF', detalhe: erro.message });
  }
}