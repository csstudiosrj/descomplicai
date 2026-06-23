import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { uploadBuffer } from '../../../lib/uploadthing';

const TARBALL_URL = 'https://github.com/Sparticuz/chromium/releases/download/v147.0.2/chromium-v147.0.2-pack.x64.tar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { contrato_id } = req.body;
  if (!contrato_id) {
    return res.status(400).json({ erro: 'contrato_id obrigatório' });
  }

  let browser = null;
  try {
    const { data: contrato, error: err1 } = await supabase
      .from('contratos')
      .select('id, evento_id, tipo, conteudo, token_assinatura, fornecedor_nome_assinatura, fornecedor_email_assinatura, fornecedores(nome, email)')
      .eq('id', contrato_id)
      .single();

    if (err1 || !contrato) {
      return res.status(404).json({ erro: 'Contrato não encontrado' });
    }

    const { data: evento } = await supabase
      .from('eventos')
      .select('nome_evento, data_evento, local_evento, cidade_evento')
      .eq('id', contrato.evento_id)
      .single();

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0').toString();
    const rodape = {
      nome: contrato.fornecedor_nome_assinatura || contrato.fornecedores?.nome || 'Fornecedor',
      email: contrato.fornecedor_email_assinatura || contrato.fornecedores?.email || '',
      dataHora: new Date().toLocaleString('pt-BR'),
      ip: ip.split(',')[0].trim(),
      identificador: contrato.token_assinatura || contrato.id,
    };

    const html = gerarHTMLContrato({ contrato, fornecedor: contrato.fornecedores, evento, rodape });

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

    // Upload do PDF
    const fileName = `contrato-${contrato_id}-${Date.now()}.pdf`;
    const { url: pdfUrl } = await uploadBuffer(pdfBuffer, fileName, 'application/pdf');

    // Atualiza contrato
    const { error: err2 } = await supabase
      .from('contratos')
      .update({ pdf_url: pdfUrl, atualizado_em: new Date().toISOString() })
      .eq('id', contrato_id);

    if (err2) throw err2;

    return res.status(200).json({ sucesso: true, pdf_url: pdfUrl });
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    if (browser) { try { await browser.close(); } catch (e) {} }
    return res.status(500).json({ erro: err.message || 'Erro interno' });
  }
}