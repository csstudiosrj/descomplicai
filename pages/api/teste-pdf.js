import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  console.log('=== TESTE CHROMIUM-MIN v147 ===');
  const startTime = Date.now();

  let browser = null;
  try {
    // Imagem de teste
    const imagemTeste = path.join(process.cwd(), 'public', 'images', 'flores', 'rosas-1.jpg');
    const imagemExiste = fs.existsSync(imagemTeste);
    console.log('Imagem existe?', imagemExiste);

    // URL do tarball do Chromium v147.0.0 (x64)
    const tarballUrl = 'https://github.com/Sparticuz/chromium/releases/download/v147.0.0/chromium-v147.0.0-pack.x64.tar';
    
    console.log('Baixando Chromium de:', tarballUrl);
    const executablePath = await chromium.executablePath(tarballUrl);
    console.log('Chromium pronto em:', executablePath);

    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: Georgia, serif; color: #333; }
          h1 { font-size: 28pt; color: #8B6F5E; margin-bottom: 20px; }
          p { font-size: 12pt; line-height: 1.6; }
          img { width: 200px; height: auto; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Teste de PDF Editorial</h1>
        <p>Se você está vendo este PDF, o Chromium v147 foi baixado, extraído e executado com sucesso na Vercel.</p>
        <p>Tempo total: ${((Date.now() - startTime) / 1000).toFixed(1)}s</p>
        ${imagemExiste ? `<img src="file://${imagemTeste.replace(/\\/g, '/')}" />` : '<p>Imagem não encontrada</p>'}
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000);

    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('PDF gerado em', totalTime, 's');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="teste.pdf"');
    return res.send(pdf);

  } catch (erro) {
    console.error('Erro no teste:', erro.message);
    if (browser) await browser.close();
    return res.status(500).json({ erro: 'Falha no teste', detalhe: erro.message });
  }
}