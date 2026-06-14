// utils/pdfTemplate.js
import fs from 'fs';
import path from 'path';
import {
  capitalizarNome, formatarData, getPaleta, isCorEscura, getCorContraste,
  getNomeCor, getDicasRegionais, getItensOrcamento,
  parsearMemorial, extrairChecklist, extrairFornecedores, getImagem,
} from './pdfUtils';
import { sugerirFontes } from './sugestoes';

const CORES_GRAFICO = ['#2E7D32', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#E65100', '#00838F', '#AD1457'];

function normalizar(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

function fonteToBase64(nomeFonte) {
  const mapa = {
    'Times-Roman': null, 'Helvetica': null,
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
  const arquivo = mapa[nomeFonte];
  if (!arquivo) return null;
  try {
    const caminho = path.join(process.cwd(), 'public', 'fonts', arquivo);
    const buf = fs.readFileSync(caminho);
    return buf.toString('base64');
  } catch (e) {
    console.warn('Fonte base64 falhou:', nomeFonte, e.message);
    return null;
  }
}

function imagemToBase64(categoria, chave) {
  const src = getImagem(categoria, chave);
  if (!src || !fs.existsSync(src)) return null;
  try {
    const buf = fs.readFileSync(src);
    const ext = path.extname(src).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch (e) {
    console.warn('Imagem base64 falhou:', categoria, chave, e.message);
    return null;
  }
}

function gerarSvgPizza(itens, size = 260) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 20;
  const total = itens.reduce((s, d) => s + d.percentual, 0);
  let startAngle = -Math.PI / 2;
  let paths = '';
  let legendHtml = '';

  itens.slice(0, 8).forEach((item, i) => {
    const angle = (item.percentual / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const cor = CORES_GRAFICO[i % CORES_GRAFICO.length];
    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${cor}" stroke="#FFFFFF" stroke-width="2"/>`;
    legendHtml += `
      <div style="display:flex;align-items:center;margin-bottom:6px;">
        <div style="width:14px;height:14px;background:${cor};border-radius:2px;margin-right:8px;flex-shrink:0;"></div>
        <span style="font-family:var(--font-body);font-size:10px;color:var(--color-text);">${item.item} <strong>(${item.percentual}%)</strong></span>
      </div>
    `;
    startAngle = endAngle;
  });

  return { svg: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;">${paths}</svg>`, legend: legendHtml };
}

export function gerarTemplateHTML({ memorial, dadosEvento, qrCodeDataUri = null }) {
  const estilo = dadosEvento?.estilo || 'classico';
  const paleta = getPaleta(dadosEvento);
  const [cor1, cor2, cor3] = paleta;

  // CORREÇÃO: usar a cor mais escura da paleta para texto/títulos
  const corTexto = '#1A1714';
  const corTextoSuave = '#5C534A';
  const corPrimaria = isCorEscura(cor1) ? cor1 : (isCorEscura(cor2) ? cor2 : (isCorEscura(cor3) ? cor3 : '#5C4A3D'));
  const corSecundaria = cor2;
  const corTerciaria = cor3;
  const corFundo = cor1;

  const fontes = sugerirFontes(estilo);
  const fonteDisplay = fontes.find(f => f.uso === 'display')?.nome || 'Georgia';
  const fonteCorpo = fontes.find(f => f.uso === 'corpo')?.nome || 'Helvetica';

  const nome1 = capitalizarNome(dadosEvento?.nomePessoa1 || '');
  const nome2 = capitalizarNome(dadosEvento?.nomePessoa2 || '');
  const nomeCasal = nome1 && nome2 ? `${nome1} & ${nome2}` : 'Nosso Casamento';
  const dataFormatada = formatarData(dadosEvento?.dataEvento);
  const cidade = dadosEvento?.cidadeEvento || '';
  const estado = dadosEvento?.estadoEvento || '';
  const localCompleto = cidade && estado ? `${cidade}, ${estado}` : cidade || estado || 'Local a definir';

  const secoes = parsearMemorial(memorial);
  const secoesNormais = secoes.filter(s => {
    const t = normalizar(s.titulo);
    return !t.includes('fornecedor') && !t.includes('orcamento') && !t.includes('checklist') && !t.includes('decisoes') && !t.includes('linha do tempo');
  });

  const checklist = extrairChecklist(secoes);
  const fornecedores = extrairFornecedores(secoes);
  const itensOrcamento = getItensOrcamento(cidade, estado);
  const dicasRegionais = getDicasRegionais(cidade, estado);

  const displayBase64 = fonteToBase64(fonteDisplay);
  const corpoBase64 = fonteToBase64(fonteCorpo);

  let fontFaceCss = '';
  if (displayBase64) {
    fontFaceCss += `@font-face { font-family: 'DisplayFont'; src: url(data:font/woff2;base64,${displayBase64}) format('woff2'); font-weight: normal; font-style: normal; }`;
  } else {
    fontFaceCss += `@font-face { font-family: 'DisplayFont'; src: local('Georgia'), local('Times New Roman'); }`;
  }
  if (corpoBase64) {
    fontFaceCss += `@font-face { font-family: 'BodyFont'; src: url(data:font/woff2;base64,${corpoBase64}) format('woff2'); font-weight: normal; font-style: normal; }`;
  } else {
    fontFaceCss += `@font-face { font-family: 'BodyFont'; src: local('Helvetica'), local('Arial'); }`;
  }

  const flores = dadosEvento?.flores || '';
  const imgDecoracao = imagemToBase64('decoracao', estilo);
  const imgCerimonia = imagemToBase64('cerimonia', estilo);
  const imgFlores = imagemToBase64('flores', flores) || imagemToBase64('flores', 'default');
  const imgMesa = imagemToBase64('mesaPosta', estilo);
  const imgAlimentacao = imagemToBase64('alimentacao', estilo);
  const imgEntretenimento = imagemToBase64('entretenimento', estilo);
  const imgVestido = imagemToBase64('vestido', dadosEvento?.estiloVestido) || imagemToBase64('vestido', 'default');
  const imgPapelaria = imagemToBase64('papelaria', estilo);

  const getSecao = (tituloBusca) => {
    const buscaNormalizada = normalizar(tituloBusca);
    return secoesNormais.find(s => normalizar(s.titulo).includes(buscaNormalizada));
  };

  const renderTextoSecao = (secao) => {
    if (!secao?.linhas?.length) {
      return '<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">Conteúdo personalizado para este casal.</p>';
    }
    return secao.linhas.map(linha => {
      const texto = linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
      if (!texto) return '';
      if (linha.startsWith('### ')) return `<h3 style="font-family:var(--font-display);font-size:12pt;color:var(--color-primary);margin-top:12px;margin-bottom:5px;">${texto}</h3>`;
      if (linha.startsWith('- ') || linha.startsWith('* ')) return `<p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:4px;margin-left:10px;">&bull; ${texto}</p>`;
      return `<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${texto}</p>`;
    }).join('');
  };

  const grafico = gerarSvgPizza(itensOrcamento.slice(0, 8));

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  ${fontFaceCss}
  :root {
    --color-primary: ${corPrimaria};
    --color-secondary: ${corSecundaria};
    --color-tertiary: ${corTerciaria};
    --color-fundo: ${corFundo};
    --color-text: ${corTexto};
    --color-text-soft: ${corTextoSuave};
    --font-display: 'DisplayFont', Georgia, serif;
    --font-body: 'BodyFont', Helvetica, Arial, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  body { font-family: var(--font-body); color: var(--color-text); }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 16mm 18mm 20mm 18mm;
    position: relative;
    page-break-after: always;
    overflow: visible;
  }
  .page:last-child { page-break-after: auto; }

  .footer {
    position: absolute;
    bottom: 8mm;
    left: 18mm;
    right: 18mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.5pt solid #C8BFB4;
    padding-top: 2.5mm;
    font-size: 8pt;
    color: var(--color-text-soft);
    font-family: var(--font-body);
  }

  /* CAPA */
  .cover {
    background: var(--color-tertiary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 30mm 20mm;
    min-height: 297mm;
  }
  .cover-line {
    width: 25mm;
    height: 0.8pt;
    background: ${getCorContraste(corTerciaria)};
    margin-bottom: 10mm;
  }
  .cover-title {
    font-family: var(--font-display);
    font-size: 40pt;
    color: ${getCorContraste(corTerciaria)};
    margin-bottom: 4mm;
    letter-spacing: 1px;
    line-height: 1.1;
  }
  .cover-subtitle {
    font-family: var(--font-body);
    font-size: 11pt;
    color: ${getCorContraste(corTerciaria)};
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 8mm;
  }
  .cover-local {
    font-family: var(--font-body);
    font-size: 12pt;
    color: ${getCorContraste(corTerciaria)};
    margin-bottom: 3mm;
  }
  .cover-date {
    font-family: var(--font-body);
    font-size: 11pt;
    color: ${getCorContraste(corTerciaria)};
  }
  .cover-palette {
    display: flex;
    gap: 10mm;
    margin-top: 12mm;
  }
  .palette-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .palette-circle {
    width: 14mm;
    height: 14mm;
    border-radius: 50%;
    border: 2.5pt solid ${isCorEscura(corTerciaria) ? '#FFFFFF' : '#1A1714'};
    margin-bottom: 2mm;
  }
  .palette-name { font-size: 8pt; color: ${getCorContraste(corTerciaria)}; font-family: var(--font-body); }
  .palette-hex { font-size: 7pt; color: ${getCorContraste(corTerciaria)}; opacity: 0.8; font-family: var(--font-body); }

  /* TÍTULOS — COR ESCURA GARANTIDA */
  .section-title {
    font-family: var(--font-display);
    font-size: 24pt;
    color: var(--color-primary);
    margin-bottom: 5mm;
    padding-bottom: 3mm;
    border-bottom: 1.5pt solid var(--color-secondary);
    line-height: 1.2;
  }
  .section-subtitle {
    font-family: var(--font-display);
    font-size: 13pt;
    color: var(--color-primary);
    margin-top: 5mm;
    margin-bottom: 3mm;
    line-height: 1.3;
  }

  /* LAYOUT EDITORIAL — SEM HEIGHT FIXO */
  .editorial-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5mm;
    align-items: start;
  }
  .editorial-text {
    font-family: var(--font-body);
    font-size: 10.5pt;
    line-height: 1.7;
    color: var(--color-text);
  }
  .editorial-text p { margin-bottom: 6px; }
  .editorial-text h3 { page-break-after: avoid; }

  /* IMAGENS — CONTAIN EM VEZ DE COVER */
  .editorial-image-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }
  .editorial-image {
    max-width: 100%;
    max-height: 230mm;
    object-fit: contain;
    border-radius: 3px;
    display: block;
  }
  .editorial-image-landscape {
    max-width: 100%;
    max-height: 100mm;
    object-fit: contain;
    border-radius: 3px;
    display: block;
  }

  /* Layout topo com imagem */
  .editorial-top {
    display: flex;
    flex-direction: column;
    gap: 4mm;
  }
  .editorial-top img {
    width: 100%;
    max-height: 95mm;
    object-fit: contain;
    border-radius: 3px;
    display: block;
  }
  .editorial-top .text-col {
    column-count: 2;
    column-gap: 5mm;
    font-size: 10pt;
    line-height: 1.65;
  }

  /* TABELAS */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 3mm;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  .data-table th {
    text-align: left;
    padding: 2mm 2mm;
    border-bottom: 1pt solid var(--color-primary);
    background: ${corSecundaria}22;
    font-family: var(--font-body);
    font-weight: 600;
    color: var(--color-primary);
    font-size: 8.5pt;
  }
  .data-table td {
    padding: 1.8mm 2mm;
    border-bottom: 0.4pt solid #E5E0D9;
    font-family: var(--font-body);
    vertical-align: top;
    font-size: 9pt;
  }
  .data-table tr { page-break-inside: avoid; }

  /* BOX INFO */
  .info-box {
    background: ${corSecundaria}15;
    border-left: 2.5pt solid var(--color-primary);
    padding: 3mm;
    margin: 3mm 0;
    border-radius: 2px;
    page-break-inside: avoid;
  }
  .info-box p {
    font-size: 9.5pt;
    line-height: 1.6;
    margin-bottom: 2px;
  }

  /* TIMELINE */
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 4mm;
    margin-top: 4mm;
  }
  .timeline-item {
    display: flex;
    gap: 3mm;
    page-break-inside: avoid;
  }
  .timeline-dot {
    width: 3mm;
    height: 3mm;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 1.5mm;
  }
  .timeline-line {
    width: 0.4pt;
    background: #E5E0D9;
    flex: 1;
    margin-left: 1.3mm;
  }
  .timeline-content h4 {
    font-family: var(--font-display);
    font-size: 11pt;
    color: var(--color-primary);
    margin-bottom: 2mm;
  }
  .timeline-content p {
    font-size: 9.5pt;
    line-height: 1.5;
    margin-bottom: 1px;
  }

  /* ORÇAMENTO */
  .budget-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 5mm;
    align-items: start;
    margin-bottom: 4mm;
  }
  .budget-chart svg { display: block; }

  /* CTA */
  .cta-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 260mm;
  }
  .cta-title {
    font-family: var(--font-display);
    font-size: 26pt;
    color: var(--color-primary);
    margin-bottom: 5mm;
    line-height: 1.2;
  }
  .cta-text {
    font-size: 11pt;
    line-height: 1.7;
    max-width: 140mm;
    margin-bottom: 4mm;
  }
  .cta-quote {
    font-family: var(--font-display);
    font-size: 14pt;
    color: var(--color-primary);
    font-style: italic;
    margin: 4mm 0;
  }
  .cta-qr {
    width: 30mm;
    height: 30mm;
    margin-top: 4mm;
  }

  /* INDICE */
  .toc-row {
    display: flex;
    justify-content: space-between;
    padding: 2mm 0;
    border-bottom: 0.3pt solid #E5E0D9;
    font-size: 10.5pt;
  }
  .toc-row strong { color: var(--color-primary); }

  /* EVITAR CORTE DE ELEMENTOS */
  p, .info-box, .timeline-item, .data-table tr {
    page-break-inside: avoid;
  }
  .section-title, .section-subtitle {
    page-break-after: avoid;
  }
</style>
</head>
<body>

<!-- CAPA -->
<div class="page cover">
  <div class="cover-line"></div>
  <div class="cover-title">${nomeCasal}</div>
  <div class="cover-subtitle">Memorial do Casamento</div>
  <div class="cover-local">${localCompleto}</div>
  <div class="cover-date">${dataFormatada}</div>
  <div class="cover-line" style="margin-top:8mm;margin-bottom:0;"></div>
  <div class="cover-palette">
    ${paleta.map((cor, i) => `
      <div class="palette-item">
        <div class="palette-circle" style="background:${cor};"></div>
        <div class="palette-name">${getNomeCor(cor)}</div>
        <div class="palette-hex">${cor}</div>
      </div>
    `).join('')}
  </div>
  <div class="footer" style="border-top-color:${getCorContraste(corTerciaria)};color:${getCorContraste(corTerciaria)};">
    <span>${nomeCasal}</span>
    <span>gerado pelo descomplicaí</span>
    <span>1</span>
  </div>
</div>

<!-- ÍNDICE -->
<div class="page">
  <div class="section-title" style="font-size:18pt;">Bem-vindos ao seu Memorial</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:6mm;">
    Este memorial foi criado exclusivamente para <strong>${nomeCasal}</strong> pelo descomplicaí. 
    Ele reúne todas as decisões, referências visuais e orientações práticas para tornar o planejamento 
    do seu casamento uma experiência leve, organizada e inesquecível.
  </p>
  <div class="section-title" style="font-size:16pt;margin-top:4mm;">Índice</div>
  ${[
    ['Identidade Visual', '3'], ['Cerimônia', '4'], ['Decoração', '5'], ['Mesa Posta', '6'],
    ['Alimentação e Bebidas', '7'], ['Entretenimento', '8'], ['Vestuário e Beleza', '9'],
    ['Papelaria e Identidade', '10'], ['Linha do Tempo Visual', '11'], ['Checklist de Decisões', '13'],
    ['Fornecedores', '15'], ['Orçamento Detalhado', '17'], ['Dicas Regionais', '19'],
  ].map(([s, p]) => `<div class="toc-row"><span>${s}</span><span style="color:var(--color-text-soft);">${p}</span></div>`).join('')}
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>2</span></div>
</div>

<!-- IDENTIDADE VISUAL -->
<div class="page">
  <div class="section-title">Identidade Visual</div>
  <div class="editorial-layout">
    <div class="editorial-text">
      ${renderTextoSecao(getSecao('identidade'))}
      <div class="section-subtitle">Paleta Detalhada</div>
      <div style="display:flex;gap:8mm;margin-top:3mm;">
        ${paleta.map((cor, i) => `
          <div style="text-align:center;">
            <div style="width:16mm;height:16mm;border-radius:50%;background:${cor};border:2pt solid ${isCorEscura(cor)?'#FFF':'#1A1714'};margin-bottom:1.5mm;"></div>
            <div style="font-size:8pt;">${getNomeCor(cor)}</div>
            <div style="font-size:7pt;color:var(--color-text-soft);">${cor}</div>
            <div style="font-size:7pt;color:var(--color-text-soft);">${i===0?'Principal':i===1?'Secundária':'Terciária'}</div>
          </div>
        `).join('')}
      </div>
      <div class="section-subtitle">Fontes Sugeridas</div>
      <div class="info-box">
        <p><strong>Display:</strong> ${fonteDisplay}</p>
        <p><strong>Corpo:</strong> ${fonteCorpo}</p>
        <p>Escolhidas para harmonizar com o estilo <strong>${estilo}</strong>.</p>
      </div>
    </div>
    ${imgDecoracao ? `<div class="editorial-image-wrapper"><img src="${imgDecoracao}" class="editorial-image" alt="decoração"/></div>` : ''}
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>3</span></div>
</div>

<!-- CERIMÔNIA -->
<div class="page">
  <div class="section-title">Cerimônia</div>
  <div class="editorial-layout">
    <div class="editorial-text">
      ${renderTextoSecao(getSecao('cerimonia'))}
    </div>
    ${imgCerimonia ? `<div class="editorial-image-wrapper"><img src="${imgCerimonia}" class="editorial-image" alt="cerimônia"/></div>` : ''}
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>4</span></div>
</div>

<!-- DECORAÇÃO -->
<div class="page">
  <div class="section-title">Decoração</div>
  <div class="editorial-top">
    ${imgFlores ? `<img src="${imgFlores}" alt="flores"/>` : ''}
    <div class="text-col">
      ${renderTextoSecao(getSecao('decoracao'))}
      <div class="info-box" style="margin-top:4mm;">
        <p><strong>Iluminação:</strong> Combine spots quentes com velas em castiçais.</p>
        <p><strong>Flores:</strong> Arranjos que dialoguem com a paleta ${paleta.join(', ')}.</p>
      </div>
    </div>
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>5</span></div>
</div>

<!-- MESA POSTA -->
<div class="page">
  <div class="section-title">Mesa Posta</div>
  <div class="editorial-layout">
    <div class="editorial-text">
      ${renderTextoSecao(getSecao('mesa'))}
    </div>
    ${imgMesa ? `<div class="editorial-image-wrapper"><img src="${imgMesa}" class="editorial-image" alt="mesa"/></div>` : ''}
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>6</span></div>
</div>

<!-- ALIMENTAÇÃO -->
<div class="page">
  <div class="section-title">Alimentação e Bebidas</div>
  <div class="editorial-top">
    ${imgAlimentacao ? `<img src="${imgAlimentacao}" alt="alimentação"/>` : ''}
    <div class="text-col">
      ${renderTextoSecao(getSecao('alimentacao'))}
    </div>
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>7</span></div>
</div>

<!-- ENTRETENIMENTO -->
<div class="page">
  <div class="section-title">Entretenimento</div>
  <div class="editorial-layout">
    <div class="editorial-text">
      ${renderTextoSecao(getSecao('entretenimento'))}
      <div class="section-subtitle">Cronograma da Festa</div>
      <table class="data-table">
        <tr><th style="width:25mm;">Horário</th><th>Atividade</th></tr>
        ${[['18:00','Cerimônia'],['19:00','Coquetel'],['20:00','Jantar'],['21:30','Discursos'],['22:00','Corte do bolo'],['22:30','Primeira dança'],['23:00','Pista'],['00:00','Bem-casados'],['01:00','Despedida']].map(([h,a])=>`<tr><td>${h}</td><td>${a}</td></tr>`).join('')}
      </table>
    </div>
    ${imgEntretenimento ? `<div class="editorial-image-wrapper"><img src="${imgEntretenimento}" class="editorial-image" alt="entretenimento"/></div>` : ''}
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>8</span></div>
</div>

<!-- VESTUÁRIO -->
<div class="page">
  <div class="section-title">Vestuário e Beleza</div>
  <div class="editorial-layout">
    <div class="editorial-text">
      ${renderTextoSecao(getSecao('vestuario'))}
      <div class="section-subtitle">Dicas</div>
      <div class="info-box">
        <p>&bull; Prova do vestido: 6 meses antes</p>
        <p>&bull; Ajustes finais: 2 semanas antes</p>
        <p>&bull; Maquiagem à prova d'água</p>
      </div>
    </div>
    ${imgVestido ? `<div class="editorial-image-wrapper"><img src="${imgVestido}" class="editorial-image" alt="vestido"/></div>` : ''}
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>9</span></div>
</div>

<!-- PAPELARIA -->
<div class="page">
  <div class="section-title">Papelaria e Identidade</div>
  <div class="editorial-top">
    ${imgPapelaria ? `<img src="${imgPapelaria}" alt="papelaria"/>` : ''}
    <div class="text-col">
      ${renderTextoSecao(getSecao('papelaria'))}
      <div class="section-subtitle">Itens Essenciais</div>
      <table class="data-table">
        <tr><th>Item</th><th>Prazo</th></tr>
        ${[['Save the Date','10-12 meses'],['Convite','3-4 meses'],['Site','6 meses'],['Menu','1 mês'],['Cartão de lugar','1 mês']].map(([i,p])=>`<tr><td>${i}</td><td>${p}</td></tr>`).join('')}
      </table>
    </div>
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>10</span></div>
</div>

<!-- LINHA DO TEMPO -->
<div class="page">
  <div class="section-title">Linha do Tempo Visual</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:5mm;">O planejamento exige organização. Aqui está o cronograma ideal para ${nomeCasal}.</p>
  <div class="timeline">
    ${[
      {meses:'12-8 meses antes',cor:'#4CAF50',tarefas:['Definir data e reservar local','Contratar cerimonialista','Iniciar lista de convidados','Definir estilo e paleta']},
      {meses:'7-4 meses antes',cor:'#FFC107',tarefas:['Fechar buffet e bebidas','Contratar fotógrafo e vídeo','Provar vestido e traje','Definir decoração e flores']},
      {meses:'3-1 meses antes',cor:'#FF9800',tarefas:['Enviar convites','Confirmar presenças','Ajustar detalhes decorativos','Prova de cabelo e maquiagem']},
      {meses:'Última semana',cor:'#F44336',tarefas:['Ensaio geral','Confirmar fornecedores','Separar itens do dia','Descansar e se hidratar']},
    ].map((item,i)=>`
      <div class="timeline-item">
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div class="timeline-dot" style="background:${item.cor};"></div>
          ${i<3?'<div class="timeline-line"></div>':''}
        </div>
        <div class="timeline-content">
          <h4>${item.meses}</h4>
          ${item.tarefas.map(t=>`<p>&bull; ${t}</p>`).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  <div style="display:flex;gap:6mm;margin-top:5mm;flex-wrap:wrap;">
    ${[{c:'#4CAF50',l:'Tranquilo'},{c:'#FFC107',l:'Atenção'},{c:'#FF9800',l:'Urgente'},{c:'#F44336',l:'Crítico'}].map(x=>`
      <div style="display:flex;align-items:center;gap:2mm;">
        <div style="width:3mm;height:3mm;background:${x.c};border-radius:1px;"></div>
        <span style="font-size:9pt;">${x.l}</span>
      </div>
    `).join('')}
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>11</span></div>
</div>

<!-- CALENDÁRIO MENSAL -->
<div class="page">
  <div class="section-title">Calendário Mensal</div>
  <table class="data-table">
    <tr><th style="width:20mm;">Mês</th><th>Tarefas Prioritárias</th><th style="width:15mm;">Status</th></tr>
    ${[
      ['Mês 12','Definir data, reservar local, contratar cerimonialista',''],
      ['Mês 11','Lista de convidados, definir estilo e paleta',''],
      ['Mês 10','Save the date, procurar vestido e traje',''],
      ['Mês 9','Contratar fotógrafo e vídeo, definir buffet',''],
      ['Mês 8','Provar vestido, definir decoração e flores',''],
      ['Mês 7','Contratar música/entretenimento, definir papelaria',''],
      ['Mês 6','Degustação do buffet, prova de cabelo/maquiagem',''],
      ['Mês 5','Definir bolo e doces, contratar transporte',''],
      ['Mês 4','Enviar convites, confirmar fornecedores',''],
      ['Mês 3','Ajustes finais de decoração, prova de vestido',''],
      ['Mês 2','Confirmar presenças, reunião com cerimonialista',''],
      ['Mês 1','Ensaio geral, separar itens do dia, relaxar',''],
    ].map(([m,t,s])=>`<tr><td>${m}</td><td>${t}</td><td>[ ]</td></tr>`).join('')}
  </table>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>12</span></div>
</div>

<!-- CHECKLIST -->
<div class="page">
  <div class="section-title">Checklist de Decisões</div>
  <table class="data-table">
    <tr><th>Decisão Pendente</th><th style="width:25mm;">Prazo</th><th style="width:10mm;">&check;</th><th>Anotações</th></tr>
    ${checklist.slice(0,12).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.prazo}</td>
        <td style="text-align:center;">[ ]</td>
        <td style="border-bottom:0.5pt dashed #D4CFC9;height:5mm;"></td>
      </tr>
    `).join('')}
  </table>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>13</span></div>
</div>

<!-- CHECKLIST ANOTAÇÕES -->
<div class="page">
  <div class="section-title">Checklist &mdash; Anotações</div>
  ${(checklist.length>12?checklist.slice(12,20):checklist.slice(0,8)).map(item=>`
    <div style="margin-bottom:4mm;">
      <div style="display:flex;gap:2mm;margin-bottom:1mm;">
        <span style="font-size:10pt;">[ ]</span>
        <span style="font-size:10pt;">${item.item}</span>
      </div>
      <div style="border-bottom:0.5pt dashed #D4CFC9;height:6mm;"></div>
      <div style="border-bottom:0.5pt dashed #D4CFC9;height:6mm;"></div>
    </div>
  `).join('')}
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>14</span></div>
</div>

<!-- FORNECEDORES -->
<div class="page">
  <div class="section-title">Fornecedores</div>
  <table class="data-table">
    <tr><th style="width:25mm;">Categoria</th><th>Nome</th><th style="width:22mm;">Telefone</th><th style="width:30mm;">E-mail</th><th style="width:15mm;">Status</th></tr>
    ${fornecedores.slice(0,14).map(f=>`
      <tr>
        <td>${f.categoria}</td>
        <td>${f.nome}</td>
        <td>________________</td>
        <td>________________</td>
        <td>A definir</td>
      </tr>
    `).join('')}
  </table>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>15</span></div>
</div>

<!-- FORNECEDORES ANOTAÇÕES -->
<div class="page">
  <div class="section-title">Fornecedores &mdash; Anotações</div>
  <table class="data-table">
    <tr><th style="width:25mm;">Categoria</th><th style="width:25mm;">Valor</th><th style="width:20mm;">Prazo</th><th>Anotações</th></tr>
    ${fornecedores.slice(0,10).map(f=>`
      <tr>
        <td>${f.categoria}</td>
        <td>R$ ____________</td>
        <td>____________</td>
        <td style="border-bottom:0.5pt dashed #D4CFC9;height:5mm;"></td>
      </tr>
    `).join('')}
  </table>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>16</span></div>
</div>

<!-- ORÇAMENTO -->
<div class="page">
  <div class="section-title">Orçamento Detalhado</div>
  <p style="font-size:10pt;line-height:1.6;margin-bottom:4mm;">Esta estimativa foi regionalizada com base em <strong>${cidade || 'sua cidade'}</strong> / <strong>${estado || 'seu estado'}</strong>.</p>
  <div class="budget-grid">
    <div class="budget-chart">${grafico.svg}</div>
    <div>${grafico.legend}</div>
  </div>
  <table class="data-table">
    <tr><th>Item</th><th style="width:12mm;">%</th><th style="width:22mm;">Valor Est.</th><th style="width:22mm;">Valor Real</th></tr>
    ${itensOrcamento.slice(0,15).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.percentual}%</td>
        <td>R$ ${item.valor.toLocaleString('pt-BR')}</td>
        <td>R$ ____________</td>
      </tr>
    `).join('')}
  </table>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>17</span></div>
</div>

<!-- ORÇAMENTO CONTINUAÇÃO -->
<div class="page">
  <div class="section-title">Orçamento &mdash; Continuação</div>
  <table class="data-table">
    <tr><th>Item</th><th style="width:12mm;">%</th><th style="width:22mm;">Valor Est.</th><th style="width:22mm;">Valor Real</th></tr>
    ${itensOrcamento.slice(15).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.percentual}%</td>
        <td>R$ ${item.valor.toLocaleString('pt-BR')}</td>
        <td>R$ ____________</td>
      </tr>
    `).join('')}
    <tr style="border-top:1.5pt solid var(--color-primary);font-weight:bold;">
      <td>TOTAL ESTIMADO</td>
      <td>100%</td>
      <td>R$ ${itensOrcamento.reduce((s,i)=>s+i.valor,0).toLocaleString('pt-BR')}</td>
      <td>R$ ____________</td>
    </tr>
  </table>
  <div class="info-box" style="margin-top:4mm;">
    <p>Dica: reserve 10% do orçamento para imprevistos. Negocie pacotes completos com fornecedores.</p>
  </div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>18</span></div>
</div>

<!-- DICAS REGIONAIS -->
<div class="page">
  <div class="section-title">Dicas Regionais</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:5mm;">Informações específicas para <strong>${localCompleto}</strong>.</p>
  <div class="section-subtitle">Clima Local</div>
  <div class="info-box"><p>${dicasRegionais.clima}</p></div>
  <div class="section-subtitle">Cuidados Especiais</div>
  ${dicasRegionais.cuidados.map(c=>`<p style="font-size:10pt;line-height:1.6;margin-bottom:2px;margin-left:3mm;">&bull; ${c}</p>`).join('')}
  <div class="section-subtitle" style="margin-top:5mm;">Melhores Épocas</div>
  ${dicasRegionais.melhoresEpocas.map(e=>`<p style="font-size:10pt;line-height:1.6;margin-bottom:2px;margin-left:3mm;">&check; ${e}</p>`).join('')}
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>19</span></div>
</div>

<!-- CTA FINAL -->
<div class="page cta-page">
  <div class="cta-title">Obrigado por confiar no descomplicaí</div>
  <div class="cta-text">${nomeCasal}, este memorial é apenas o começo. Assine o descomplicaí e tenha acesso à gestão completa do seu casamento.</div>
  <div class="cta-quote">"O amor é a poesia dos sentidos."</div>
  <div style="font-size:9pt;color:var(--color-text-soft);margin-bottom:6mm;">&mdash; Honoré de Balzac</div>
  ${qrCodeDataUri ? `<img src="${qrCodeDataUri}" class="cta-qr" alt="QR Code"/>` : ''}
  <div style="font-size:10pt;color:var(--color-primary);margin-top:3mm;">arxum.csstudios.site/descomplicai</div>
  <div class="footer"><span>${nomeCasal}</span><span>gerado pelo descomplicaí</span><span>20</span></div>
</div>

</body>
</html>
  `;

  return html;
}