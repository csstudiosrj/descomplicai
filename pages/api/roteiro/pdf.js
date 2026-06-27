import { getServiceRoleClient } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { evento_id } = req.body;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!evento_id || !token) {
      return res.status(400).json({ erro: 'evento_id e token são obrigatórios' });
    }

    const supabase = getServiceRoleClient();

    // 1. Autenticar
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ erro: 'Não autorizado' });
    }

    // 2. Verificar se é cerimonialista
    const { data: cerim, error: cerimError } = await supabase
      .from('cerimonialistas')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (cerimError || !cerim) {
      return res.status(403).json({ erro: 'Apenas cerimonialistas podem exportar roteiro' });
    }

    // 3. Buscar evento + memorial (paleta)
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('id, nome_noiva, nome_noivo, data_evento, cidade, memorial, cerimonialista_id')
      .eq('id', evento_id)
      .single();

    if (eventoError || !evento) {
      return res.status(404).json({ erro: 'Evento não encontrado' });
    }

    // 4. Verificar permissão (direta ou via vínculo)
    const { data: vinculo } = await supabase
      .from('cerimonialista_eventos')
      .select('id')
      .eq('evento_id', evento_id)
      .eq('cerimonialista_id', cerim.id)
      .maybeSingle();

    const isDono = evento.cerimonialista_id === cerim.id;
    if (!vinculo && !isDono) {
      return res.status(403).json({ erro: 'Sem permissão para este evento' });
    }

    // 5. Buscar roteiro (cerimonialista vê TUDO: público + privado)
    const { data: roteiro, error: roteiroError } = await supabase
      .from('roteiro')
      .select('*, fornecedores(nome)')
      .eq('evento_id', evento_id)
      .order('ordem', { ascending: true });

    if (roteiroError) {
      console.error('[PDF Roteiro] Erro ao buscar roteiro:', roteiroError);
      return res.status(500).json({ erro: 'Erro ao buscar roteiro' });
    }

    // 6. Extrair paleta do memorial
    let paleta = {};
    try {
      if (evento.memorial) {
        const memorial = typeof evento.memorial === 'string'
          ? JSON.parse(evento.memorial)
          : evento.memorial;
        paleta = memorial.paleta || memorial.cores || {};
      }
    } catch (e) {
      paleta = {};
    }

    const corPrimaria = paleta.primaria || paleta.cor1 || 'var(--color-primary)';
    const corSecundaria = paleta.secundaria || paleta.cor2 || 'var(--color-secondary)';
    const corTexto = paleta.texto || '#1a1a1a';
    const corFundo = paleta.fundo || '#fafafa';

    // 7. Gerar HTML
    const html = gerarHTML({ evento, roteiro: roteiro || [], corPrimaria, corSecundaria, corTexto, corFundo });

    // 8. Converter para PDF
    let pdfBuffer;
    let modo = 'pdf';

    // ESTRATÉGIA 1: puppeteer-core + chromium (Vercel)
    if (!pdfBuffer) {
      try {
        const puppeteer = await import('puppeteer-core');
        const chromium = await import('@sparticuz/chromium');
        
        const browser = await puppeteer.launch({
          args: [...chromium.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: await chromium.default.executablePath(),
          headless: chromium.default.headless,
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
        pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' },
          displayHeaderFooter: true,
          headerTemplate: '<div></div>',
          footerTemplate: \`
            <div style="font-size:10px;color:#999;text-align:center;width:100%;padding:8px 0;border-top:1px solid #eee;">
              Gerado pelo Descomplicaí — descomplicai.com.br
            </div>
          \`,
        });
        await browser.close();
        modo = 'puppeteer';
      } catch (e) {
        console.log('[PDF Roteiro] Puppeteer falhou:', e.message);
      }
    }

    // ESTRATÉGIA 2: pdf-lib (puro JS, sem binários)
    if (!pdfBuffer) {
      try {
        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
        
        const pageW = 595;
        const pageH = 842;
        let page = doc.addPage([pageW, pageH]);
        let y = pageH - 50;
        
        const hexToRgb = (hex) => {
          const clean = hex.replace('#', '');
          return {
            r: parseInt(clean.substring(0, 2), 16) / 255,
            g: parseInt(clean.substring(2, 4), 16) / 255,
            b: parseInt(clean.substring(4, 6), 16) / 255,
          };
        };
        
        const c1 = hexToRgb(corPrimaria.startsWith('var') ? '#C9A96E' : corPrimaria);
        const c2 = hexToRgb(corSecundaria.startsWith('var') ? '#8B7355' : corSecundaria);
        
        // Capa
        page.drawRectangle({ x: 0, y: pageH - 140, width: pageW, height: 140, color: rgb(c1.r, c1.g, c1.b) });
        
        const nomeCasal = \`\${evento.nome_noiva || 'Noiva'} \${evento.nome_noivo ? 'e ' + evento.nome_noivo : ''}\`.trim();
        const nomeWidth = fontBold.widthOfTextAtSize(nomeCasal, 22);
        page.drawText(nomeCasal, { x: (pageW - nomeWidth) / 2, y: pageH - 80, size: 22, font: fontBold, color: rgb(1, 1, 1) });
        
        if (evento.data_evento) {
          const dataTxt = new Date(evento.data_evento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
          const dw = font.widthOfTextAtSize(dataTxt, 12);
          page.drawText(dataTxt, { x: (pageW - dw) / 2, y: pageH - 105, size: 12, font, color: rgb(1, 1, 1) });
        }
        
        if (evento.cidade) {
          const cw = font.widthOfTextAtSize(evento.cidade, 10);
          page.drawText(evento.cidade, { x: (pageW - cw) / 2, y: pageH - 125, size: 10, font, color: rgb(1, 1, 1) });
        }
        
        y = pageH - 180;
        
        // Título seções
        page.drawText('Roteiro do Grande Dia', { x: 50, y, size: 18, font: fontBold, color: rgb(c1.r, c1.g, c1.b) });
        y -= 8;
        page.drawLine({ start: { x: 50, y }, end: { x: pageW - 50, y }, thickness: 2, color: rgb(c1.r, c1.g, c1.b) });
        y -= 25;
        
        // Seções
        for (const item of (roteiro || [])) {
          if (y < 80) {
            page = doc.addPage([pageW, pageH]);
            y = pageH - 50;
          }
          
          // Horário (círculo simulado)
          const hora = item.horario || '--:--';
          page.drawText(hora, { x: 50, y, size: 11, font: fontBold, color: rgb(c1.r, c1.g, c1.b) });
          
          // Título + privacidade
          const privLabel = item.publico === false ? ' [PRIVADO]' : ' [PÚBLICO]';
          const titulo = (item.titulo || 'Sem título') + privLabel;
          page.drawText(titulo, { x: 110, y, size: 12, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
          y -= 16;
          
          // Fornecedor
          if (item.fornecedores?.nome || item.fornecedor_nome) {
            const forn = item.fornecedores?.nome || item.fornecedor_nome;
            page.drawText(\`Fornecedor: \${forn}\`, { x: 110, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
            y -= 12;
          }
          
          // Descrição (quebra de linha simples)
          if (item.descricao) {
            const words = item.descricao.split(' ');
            let line = '';
            for (const word of words) {
              const test = line + ' ' + word;
              if (font.widthOfTextAtSize(test, 9) > (pageW - 160)) {
                page.drawText(line.trim(), { x: 110, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
                y -= 11;
                line = word;
              } else {
                line = test;
              }
            }
            if (line.trim()) {
              page.drawText(line.trim(), { x: 110, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
              y -= 11;
            }
          }
          
          // Música
          if (item.musica) {
            page.drawText(\`Musica: \${item.musica}\`, { x: 110, y, size: 9, font, color: rgb(c2.r, c2.g, c2.b) });
            y -= 12;
          }
          
          // Observações
          if (item.observacoes) {
            page.drawText('Observacoes:', { x: 110, y, size: 8, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
            y -= 10;
            const obsWords = item.observacoes.split(' ');
            let obsLine = '';
            for (const word of obsWords) {
              const test = obsLine + ' ' + word;
              if (font.widthOfTextAtSize(test, 8) > (pageW - 160)) {
                page.drawText(obsLine.trim(), { x: 120, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
                y -= 10;
                obsLine = word;
              } else {
                obsLine = test;
              }
            }
            if (obsLine.trim()) {
              page.drawText(obsLine.trim(), { x: 120, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
              y -= 10;
            }
          }
          
          y -= 12; // espaço entre seções
        }
        
        // Rodapé última página
        page.drawText('Gerado pelo Descomplicai — descomplicai.com.br', {
          x: 50, y: 30, size: 8, font, color: rgb(0.6, 0.6, 0.6)
        });
        
        pdfBuffer = await doc.save();
        modo = 'pdf-lib';
      } catch (e) {
        console.log('[PDF Roteiro] pdf-lib falhou:', e.message);
      }
    }

    // ESTRATÉGIA 3: Fallback HTML (cliente imprime)
    if (!pdfBuffer) {
      return res.status(200).json({
        html,
        modo: 'html',
        mensagem: 'Instale puppeteer-core + @sparticuz/chromium ou pdf-lib para gerar PDF direto na API'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`attachment; filename="roteiro-\${evento_id}.pdf"\`);
    res.setHeader('X-PDF-Mode', modo);
    res.send(Buffer.from(pdfBuffer));

  } catch (err) {
    console.error('[PDF Roteiro] Erro fatal:', err);
    return res.status(500).json({ erro: 'Erro interno ao gerar PDF', detalhe: err.message });
  }
}

function gerarHTML({ evento, roteiro, corPrimaria, corSecundaria, corTexto, corFundo }) {
  const nomeCasal = \`\${evento.nome_noiva || 'Noiva'} \${evento.nome_noivo ? 'e ' + evento.nome_noivo : 'e Noivo'}\`.trim();
  const dataFormatada = evento.data_evento
    ? new Date(evento.data_evento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  const secoesHTML = roteiro.map((item) => {
    const privacidade = item.publico === false
      ? '<span class="badge privado">PRIVADO</span>'
      : '<span class="badge publico">PUBLICO</span>';

    const fornecedor = item.fornecedores?.nome || item.fornecedor_nome || '';
    const musica = item.musica || '';
    const observacoes = item.observacoes || '';

    return \`
      <div class="secao">
        <div class="secao-header">
          <div class="horario">\${item.horario || '--:--'}</div>
          <div class="secao-info">
            <h3>\${item.titulo || 'Sem titulo'} \${privacidade}</h3>
            \${fornecedor ? \`<p class="fornecedor">Fornecedor: \${fornecedor}</p>\` : ''}
          </div>
        </div>
        \${item.descricao ? \`<p class="descricao">\${item.descricao}</p>\` : ''}
        \${musica ? \`<p class="musica">Musica: \${musica}</p>\` : ''}
        \${observacoes ? \`<div class="observacoes"><strong>Obs:</strong> \${observacoes}</div>\` : ''}
      </div>
    \`;
  }).join('');

  return \`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Roteiro - \${nomeCasal}</title>
<style>
  @page { size: A4; margin: 20mm 15mm 25mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: \${corTexto}; background: \${corFundo}; line-height: 1.5; }
  .capa { background: \${corPrimaria}; color: #fff; padding: 60px 40px; text-align: center; page-break-after: always; }
  .capa h1 { font-size: 32px; font-weight: 300; letter-spacing: 2px; margin: 0; }
  .capa .data { margin-top: 16px; font-size: 16px; opacity: 0.9; }
  .capa .cidade { margin-top: 8px; font-size: 14px; opacity: 0.8; }
  .conteudo { padding: 40px; }
  .conteudo h2 { color: \${corPrimaria}; border-bottom: 2px solid \${corPrimaria}; padding-bottom: 8px; margin-bottom: 32px; font-size: 20px; }
  .secao { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #eee; page-break-inside: avoid; }
  .secao-header { display: flex; align-items: flex-start; gap: 16px; }
  .horario { background: \${corPrimaria}; color: #fff; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; flex-shrink: 0; text-align: center; line-height: 1.2; }
  .secao-info { flex: 1; padding-top: 4px; }
  .secao-info h3 { font-size: 15px; color: #222; margin: 0 0 4px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; margin-left: 6px; vertical-align: middle; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge.privado { background: #333; color: #fff; }
  .badge.publico { background: #e8f5e9; color: #2e7d32; }
  .fornecedor { font-size: 11px; color: #666; margin: 2px 0 0; }
  .descricao { margin: 10px 0 0 72px; font-size: 12px; color: #444; line-height: 1.6; }
  .musica { margin: 8px 0 0 72px; font-size: 11px; color: \${corSecundaria}; font-style: italic; }
  .observacoes { margin: 10px 0 0 72px; font-size: 10px; color: #777; background: #f5f5f5; padding: 10px; border-radius: 6px; border-left: 3px solid \${corSecundaria}; }
  .rodape { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; padding: 10px; font-size: 9px; color: #aaa; border-top: 1px solid #eee; background: #fff; }
  .vazio { text-align: center; color: #999; padding: 40px; font-style: italic; }
</style>
</head>
<body>
  <div class="capa">
    <h1>\${nomeCasal}</h1>
    <div class="data">\${dataFormatada}</div>
    <div class="cidade">\${evento.cidade || ''}</div>
  </div>
  <div class="conteudo">
    <h2>Roteiro do Grande Dia</h2>
    \${secoesHTML || '<div class="vazio">Nenhuma secao cadastrada no roteiro.</div>'}
  </div>
  <div class="rodape">Gerado pelo Descomplicai — descomplicai.com.br</div>
</body>
</html>\`;
}
