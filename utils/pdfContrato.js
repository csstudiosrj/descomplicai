import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { uploadBuffer } from '../lib/uploadthing';

const TARBALL_URL = 'https://github.com/Sparticuz/chromium/releases/download/v147.0.2/chromium-v147.0.2-pack.x64.tar';

function gerarHTMLContrato({ contrato, fornecedor, evento, rodape }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page { margin: 60px; }
        body { font-family: Georgia, serif; color: #1A1714; line-height: 1.7; padding: 0; max-width: 800px; margin: 0 auto; }
        h1 { font-family: Georgia, serif; color: #8B6F5E; font-weight: 400; font-size: 22px; text-align: center; margin-bottom: 32px; }
        pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 13px; line-height: 1.8; }
        .rodape { margin-top: 60px; padding-top: 20px; border-top: 1px solid #D4C8C0; font-size: 11px; color: #A89B91; font-family: monospace; }
        .rodape p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <h1>Contrato de Prestação de Serviços</h1>
      <pre>${contrato.conteudo || ''}</pre>
      <div class="rodape">
        <p><strong>Assinado digitalmente por:</strong> ${rodape.nome}</p>
        <p><strong>Email:</strong> ${rodape.email || 'Não informado'}</p>
        <p><strong>Data/hora:</strong> ${rodape.dataHora}</p>
        <p><strong>IP:</strong> ${rodape.ip}</p>
        <p><strong>ID:</strong> ${rodape.identificador}</p>
      </div>
    </body>
    </html>
  `;
}

export async function gerarPDFContratoAssinado({ contrato, fornecedor, evento, rodape }) {
  let browser = null;
  try {
    const html = gerarHTMLContrato({ contrato, fornecedor, evento, rodape });

    const executablePath = await chromium.executablePath(TARBALL_URL);
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
      ],
      executablePath,
      headless: 'shell',
      defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    const fileName = `contrato-${contrato.id}-${Date.now()}.pdf`;
    const { url: pdfUrl } = await uploadBuffer(pdfBuffer, fileName, 'application/pdf');

    return pdfUrl;
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    throw err;
  }
}
