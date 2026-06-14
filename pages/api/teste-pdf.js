import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  console.log('=== TESTE CHROMIUM-MIN v147 (CORRIGIDO) ===');
  const startTime = Date.now();

  let browser = null;
  try {
    // 1. CONVERTER IMAGEM PARA BASE64 (nunca use file:// na Vercel)
    const imagemTeste = path.join(process.cwd(), 'public', 'images', 'flores', 'rosas-1.jpg');
    const imagemExiste = fs.existsSync(imagemTeste);
    let imagemBase64 = '';
    
    if (imagemExiste) {
      const imagemBuffer = fs.readFileSync(imagemTeste);
      const ext = path.extname(imagemTeste).toLowerCase().replace('.', '');
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
      imagemBase64 = `data:${mime};base64,${imagemBuffer.toString('base64')}`;
    }

    // 2. DOWNLOAD DO CHROMIUM
    const tarballUrl = 'https://github.com/Sparticuz/chromium/releases/download/v147.0.0/chromium-v147.0.0-pack.x64.tar';
    console.log('Baixando Chromium...');
    const executablePath = await chromium.executablePath(tarballUrl);
    console.log('Chromium pronto em:', executablePath);

    // 3. LAUNCH CORRETO (v147+ exige headless: "shell")
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
      headless: 'shell',               // ← MUDANÇA CRÍTICA
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      },
    });

    const page = await browser.newPage();

    // 4. HTML COM IMAGEM EMBUTIDA
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 20mm; }
          * { box-sizing: border-box; }
          body { font-family: Georgia, serif; color: #333; margin: 0; }
          h1 { font-size: 28pt; color: #8B6F5E; margin-bottom: 20px; }
          p { font-size: 12pt; line-height: 1.6; }
          img { width: 200px; height: auto; border-radius: 4px; margin-top: 20px; display: block; }
        </style>
      </head>
      <body>
        <h1>Teste de PDF Editorial</h1>
        <p>Chromium v147 rodando na Vercel com sucesso.</p>
        <p>Tempo total: ${((Date.now() - startTime) / 1000).toFixed(1)}s</p>
        ${imagemExiste 
          ? `<img src="${imagemBase64}" />` 
          : '<p style="color:red">Imagem não encontrada</p>'}
      </body>
      </html>
    `;

    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    
    await page.waitForTimeout(2000); // aguarda renderização completa

    // 5. GERAR PDF
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('PDF gerado em', totalTime, 's — Tamanho:', pdfBuffer.length, 'bytes');

    // 6. RESPOSTA COM HEADERS CORRETOS
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);  // ← evita truncamento
    res.setHeader('Content-Disposition', 'inline; filename="teste.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    
    return res.status(200).send(pdfBuffer);

  } catch (erro) {
    console.error('Erro:', erro);
    if (browser) {
      try { await browser.close(); } catch (e) { /* ignora */ }
    }
    return res.status(500).json({ 
      erro: 'Falha no teste', 
      detalhe: erro.message,
    });
  }
}