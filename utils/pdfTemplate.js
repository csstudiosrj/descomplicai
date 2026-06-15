// utils/pdfTemplate.js — Template Editorial de Revista (v3)
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

/* ═══════════════════════════════════════════════════════════
   FONTES — carrega Regular e Bold em base64
   ═══════════════════════════════════════════════════════════ */
function fonteToBase64(nomeFonte, peso = 'regular') {
  const mapa = {
    'Cormorant Garamond': { regular: 'cormorant-garamond-v21-latin-regular.woff2', bold: 'cormorant-garamond-v21-latin-700.woff2' },
    'Playfair Display': { regular: 'playfair-display-v40-latin-regular.woff2', bold: 'playfair-display-v40-latin-700.woff2' },
    'Amatic SC': { regular: 'amatic-sc-v28-latin-regular.woff2', bold: 'amatic-sc-v28-latin-700.woff2' },
    'Lora': { regular: 'lora-v37-latin-regular.woff2', bold: 'lora-v37-latin-700.woff2' },
    'Josefin Sans': { regular: 'josefin-sans-v34-latin-regular.woff2', bold: 'josefin-sans-v34-latin-700.woff2' },
    'Montserrat': { regular: 'montserrat-v31-latin-regular.woff2', bold: 'montserrat-v31-latin-700.woff2' },
    'Open Sans': { regular: 'open-sans-v44-latin-regular.woff2', bold: 'open-sans-v44-latin-700.woff2' },
    'Inter': { regular: 'inter-v20-latin-regular.woff2', bold: 'inter-v20-latin-700.woff2' },
    'Oswald': { regular: 'oswald-v57-latin-regular.woff2', bold: 'oswald-v57-latin-700.woff2' },
    'Roboto': { regular: 'roboto-v51-latin-regular.woff2', bold: 'roboto-v51-latin-700.woff2' },
    'Pacifico': { regular: 'pacifico-v23-latin-regular.woff2' },
    'Nunito': { regular: 'nunito-v32-latin-regular.woff2', bold: 'nunito-v32-latin-700.woff2' },
    'Great Vibes': { regular: 'great-vibes-v21-latin-regular.woff2' },
    'Crimson Text': { regular: 'crimson-text-v19-latin-regular.woff2', bold: 'crimson-text-v19-latin-700.woff2' },
    'EB Garamond': { regular: 'eb-garamond-v32-latin-regular.woff2', bold: 'eb-garamond-v32-latin-700.woff2' },
    'DM Sans': { regular: 'dm-sans-v17-latin-regular.woff2', bold: 'dm-sans-v17-latin-700.woff2' },
    'Space Mono': { regular: 'space-mono-v17-latin-regular.woff2', bold: 'space-mono-v17-latin-700.woff2' },
    'Dancing Script': { regular: 'dancing-script-v29-latin-regular.woff2', bold: 'dancing-script-v29-latin-700.woff2' },
    'Parisienne': { regular: 'parisienne-v14-latin-regular.woff2' },
    'Libre Baskerville': { regular: 'libre-baskerville-v24-latin-regular.woff2', bold: 'libre-baskerville-v24-latin-700.woff2' },
    'Lato': { regular: 'lato-v25-latin-regular.woff2', bold: 'lato-v25-latin-700.woff2' },
    'Source Serif 4': { regular: 'source-serif-4-v14-latin-regular.woff2', bold: 'source-serif-4-v14-latin-700.woff2' },
    'JetBrains Mono': { regular: 'jetbrains-mono-v24-latin-regular.woff2', bold: 'jetbrains-mono-v24-latin-700.woff2' },
  };
  const arquivo = mapa[nomeFonte]?.[peso];
  if (!arquivo) return null;
  try {
    const caminho = path.join(process.cwd(), 'public', 'fonts', arquivo);
    const buf = fs.readFileSync(caminho);
    return buf.toString('base64');
  } catch (e) {
    console.warn('Fonte base64 falhou:', nomeFonte, peso, e.message);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   IMAGENS — base64 única e múltiplas
   ═══════════════════════════════════════════════════════════ */
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

function getImagensMultiplas(categoria, estilo, quantidade = 3) {
  const base = path.join(process.cwd(), 'public', 'images', categoria);
  if (!fs.existsSync(base)) return [];
  const todos = fs.readdirSync(base)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();
  const comEstilo = todos.filter(f => f.toLowerCase().includes(estilo.toLowerCase()));
  const resto = todos.filter(f => !f.toLowerCase().includes(estilo.toLowerCase()));
  const selecionados = [...comEstilo, ...resto].slice(0, quantidade);
  return selecionados.map(f => {
    try {
      const buf = fs.readFileSync(path.join(base, f));
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

/* ═══════════════════════════════════════════════════════════
   SVGs DECORATIVOS
   ═══════════════════════════════════════════════════════════ */
function svgMonograma(inicial1, inicial2, cor, tamanho = 140) {
  const i1 = (inicial1 || 'N').charAt(0).toUpperCase();
  const i2 = (inicial2 || 'N').charAt(0).toUpperCase();
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="70" r="65" fill="none" stroke="${cor}" stroke-width="1.2" opacity="0.6"/>
    <circle cx="70" cy="70" r="58" fill="none" stroke="${cor}" stroke-width="0.6" opacity="0.4"/>
    <text x="70" y="78" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="38" fill="${cor}" letter-spacing="2">${i1} <tspan font-size="24" dy="-4">&</tspan> ${i2}</text>
    <line x1="35" y1="95" x2="105" y2="95" stroke="${cor}" stroke-width="1" opacity="0.5"/>
  </svg>`;
}

function svgDecoracaoPerfil(perfil, cor, largura = 160) {
  const h = 40;
  if (perfil === 'classico') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,20 Q${largura/4},5 ${largura/2},20 T${largura},20" fill="none" stroke="${cor}" stroke-width="1.2" opacity="0.5"/>
      <path d="M${largura*0.15},25 Q${largura*0.35},10 ${largura*0.5},25 T${largura*0.85},25" fill="none" stroke="${cor}" stroke-width="0.8" opacity="0.35"/>
      <circle cx="${largura/2}" cy="12" r="3" fill="none" stroke="${cor}" stroke-width="0.8" opacity="0.4"/>
    </svg>`;
  }
  if (perfil === 'boho') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,35 Q20,10 35,25 Q50,5 65,28 Q80,8 95,26 Q110,6 125,25 Q135,15 ${largura-10},35" fill="none" stroke="${cor}" stroke-width="1.2" opacity="0.5"/>
      <path d="M25,38 Q35,18 45,32 Q55,15 70,33 Q85,16 100,32 Q115,18 125,35" fill="none" stroke="${cor}" stroke-width="0.8" opacity="0.35"/>
      <circle cx="35" cy="22" r="2" fill="${cor}" opacity="0.3"/>
      <circle cx="95" cy="20" r="2" fill="${cor}" opacity="0.3"/>
    </svg>`;
  }
  if (perfil === 'moderno') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${largura*0.1}" y="15" width="${largura*0.15}" height="10" fill="none" stroke="${cor}" stroke-width="1" opacity="0.5"/>
      <rect x="${largura*0.35}" y="12" width="${largura*0.25}" height="16" fill="none" stroke="${cor}" stroke-width="1" opacity="0.5"/>
      <rect x="${largura*0.7}" y="15" width="${largura*0.2}" height="10" fill="none" stroke="${cor}" stroke-width="1" opacity="0.5"/>
      <line x1="0" y1="32" x2="${largura}" y2="32" stroke="${cor}" stroke-width="1.5" opacity="0.6"/>
    </svg>`;
  }
  if (perfil === 'rustico') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,30 Q15,15 25,28 Q35,10 50,30 Q65,12 80,28 Q95,14 110,30 Q125,16 ${largura-5},30" fill="none" stroke="${cor}" stroke-width="1.5" opacity="0.5"/>
      <path d="M20,35 Q30,22 40,33 Q55,18 70,34 Q85,20 100,33 Q115,22 125,35" fill="none" stroke="${cor}" stroke-width="1" opacity="0.35"/>
      <circle cx="50" cy="18" r="2.5" fill="${cor}" opacity="0.25"/>
      <circle cx="100" cy="20" r="2" fill="${cor}" opacity="0.25"/>
    </svg>`;
  }
  if (perfil === 'romantico') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${largura/2},12 C${largura/2-8},2 ${largura/2-16},8 ${largura/2-16},16 C${largura/2-16},24 ${largura/2},32 ${largura/2},32 C${largura/2},32 ${largura/2+16},24 ${largura/2+16},16 C${largura/2+16},8 ${largura/2+8},2 ${largura/2},12" fill="none" stroke="${cor}" stroke-width="1.2" opacity="0.5"/>
      <path d="M0,28 Q${largura/3},20 ${largura/2},28 T${largura},28" fill="none" stroke="${cor}" stroke-width="0.8" opacity="0.35"/>
    </svg>`;
  }
  // minimalista
  return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${largura*0.2}" y1="20" x2="${largura*0.8}" y2="20" stroke="${cor}" stroke-width="1" opacity="0.6"/>
  </svg>`;
}

function svgLogoDescomplicai(corPrimaria, corTexto = '#1A1714', largura = 110) {
  return `<svg width="${largura}" height="28" viewBox="0 0 110 28" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="18" font-family="Georgia, serif" font-size="11" fill="${corTexto}" font-weight="normal">des</text>
    <text x="22" y="18" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="${corTexto}" font-weight="normal">complicaí</text>
    <circle cx="98" cy="14" r="7" fill="${corPrimaria}" opacity="0.9"/>
    <circle cx="98" cy="14" r="4" fill="none" stroke="${corTexto}" stroke-width="0.8" opacity="0.3"/>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZADORES DE TEXTO
   ═══════════════════════════════════════════════════════════ */
function renderTextoSecao(secao) {
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
}

function renderTextoEditorial(secoesNormais) {
  // Junta todas as linhas de todas as seções em um texto contínuo
  const todasLinhas = [];
  for (const sec of secoesNormais) {
    for (const linha of sec.linhas) {
      const limpa = linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
      if (limpa && !limpa.startsWith('##') && !limpa.startsWith('---')) todasLinhas.push(limpa);
    }
  }
  if (todasLinhas.length === 0) {
    return '<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">Memorial do casamento.</p>';
  }
  // Primeiro parágrafo com drop-cap
  let html = '';
  const primeiro = todasLinhas[0];
  const resto = todasLinhas.slice(1);
  html += `<p class="editorial-dropcap" style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${primeiro}</p>`;
  for (const par of resto) {
    html += `<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${par}</p>`;
  }
  return html;
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

/* ═══════════════════════════════════════════════════════════
   FUNÇÃO PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
export function gerarTemplateHTML({ memorial, dadosEvento, qrCodeDataUri = null }) {
  const estilo = dadosEvento?.estilo || 'classico';
  const perfil = dadosEvento?.perfilCasal || estilo;
  const paleta = getPaleta(dadosEvento);
  const [cor1, cor2, cor3] = paleta;

  const corTexto = '#1A1714';
  const corTextoSuave = '#5C534A';
  const corPrimaria = isCorEscura(cor1) ? cor1 : (isCorEscura(cor2) ? cor2 : (isCorEscura(cor3) ? cor3 : '#5C4A3D'));
  const corSecundaria = cor2;
  const corTerciaria = cor3;
  const corFundo = cor1;
  const corContraste = getCorContraste(corTerciaria);

  const fontes = sugerirFontes(estilo);
  const fonteDisplay = fontes.find(f => f.uso === 'display')?.nome || 'Georgia';
  const fonteCorpo = fontes.find(f => f.uso === 'corpo')?.nome || 'Helvetica';

  const nome1 = capitalizarNome(dadosEvento?.nomePessoa1 || '');
  const nome2 = capitalizarNome(dadosEvento?.nomePessoa2 || '');
  const nomeCasal = nome1 && nome2 ? `${nome1} & ${nome2}` : 'Nosso Casamento';
  const inicial1 = nome1.charAt(0) || 'N';
  const inicial2 = nome2.charAt(0) || 'N';
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

  // Fontes base64
  const displayRegular = fonteToBase64(fonteDisplay, 'regular');
  const displayBold = fonteToBase64(fonteDisplay, 'bold');
  const corpoRegular = fonteToBase64(fonteCorpo, 'regular');
  const corpoBold = fonteToBase64(fonteCorpo, 'bold');

  let fontFaceCss = '';
  if (displayRegular) {
    fontFaceCss += `@font-face { font-family: 'DisplayFont'; src: url(data:font/woff2;base64,${displayRegular}) format('woff2'); font-weight: normal; font-style: normal; }`;
  } else {
    fontFaceCss += `@font-face { font-family: 'DisplayFont'; src: local('Georgia'), local('Times New Roman'); font-weight: normal; }`;
  }
  if (displayBold) {
    fontFaceCss += `@font-face { font-family: 'DisplayFont'; src: url(data:font/woff2;base64,${displayBold}) format('woff2'); font-weight: bold; font-style: normal; }`;
  }
  if (corpoRegular) {
    fontFaceCss += `@font-face { font-family: 'BodyFont'; src: url(data:font/woff2;base64,${corpoRegular}) format('woff2'); font-weight: normal; font-style: normal; }`;
  } else {
    fontFaceCss += `@font-face { font-family: 'BodyFont'; src: local('Helvetica'), local('Arial'); font-weight: normal; }`;
  }
  if (corpoBold) {
    fontFaceCss += `@font-face { font-family: 'BodyFont'; src: url(data:font/woff2;base64,${corpoBold}) format('woff2'); font-weight: bold; font-style: normal; }`;
  }

  // Imagens
  const imgCapa = imagemToBase64('local', estilo) || imagemToBase64('cerimonia', estilo);
  const imgDecoracao = getImagensMultiplas('decoracao', estilo, 3);
  const imgCerimonia = getImagensMultiplas('cerimonia', estilo, 3);
  const imgFlores = getImagensMultiplas('flores', dadosEvento?.flores || estilo, 3);
  const imgMesa = getImagensMultiplas('mesa', estilo, 3);
  const imgAlimentacao = getImagensMultiplas('alimentacao', estilo, 3);
  const imgEntretenimento = getImagensMultiplas('entretenimento', estilo, 3);
  const imgVestido = getImagensMultiplas('vestidos', dadosEvento?.estiloVestido || estilo, 3);
  const imgPapelaria = getImagensMultiplas('papelaria', estilo, 3);
  const imgBeleza = getImagensMultiplas('beleza', estilo, 3);
  const imgDetalhes = getImagensMultiplas('detalhes', estilo, 2);

  const getSecao = (tituloBusca) => {
    const buscaNormalizada = normalizar(tituloBusca);
    return secoesNormais.find(s => normalizar(s.titulo).includes(buscaNormalizada));
  };

  const grafico = gerarSvgPizza(itensOrcamento.slice(0, 8));
  const svgDeco = svgDecoracaoPerfil(perfil, corPrimaria);
  const svgLogo = svgLogoDescomplicai(corPrimaria, corTexto);
  const svgMono = svgMonograma(inicial1, inicial2, corContraste);

  // Dicas por seção
  const dicasPorSecao = {
    'Identidade Visual': 'Mantenha a coerência visual em todos os materiais. Teste as fontes em tamanhos pequenos antes de aprovar.',
    'Cerimônia': 'Chegue 30 minutos antes para acertos finais. Verifique a acústica do local com antecedência.',
    'Decoração': 'Reserve 10% do orçamento de decoração para itens de última hora. Flores frescas chegam no dia do evento.',
    'Mesa Posta': 'Confirme a quantidade de louças uma semana antes. Sousplats elevam o visual sem custos altos.',
    'Alimentação e Bebidas': 'Faça degustação com pelo menos 3 opções de menu. Reserve água e bebidas não alcoólicas generosamente.',
    'Entretenimento': 'Teste o equipamento de som no local. Prepare uma playlist de reserva caso o DJ precise.',
    'Vestuário e Beleza': 'Agende a prova final 2 semanas antes. Leve os sapatos para a prova de altura.',
    'Papelaria e Identidade': 'Imprima 10% a mais de convites para imprevistos. Envie save the date com 8 meses de antecedência.',
    'Linha do Tempo': 'Adicione 15 minutos de folga entre cada etapa. Delegue tarefas para padrinhos e familiares.',
    'Dicas Regionais': 'Consulte o calendário de eventos da cidade para evitar conflitos de data.',
  };

  // Renderizador de página de seção temática
  const renderPaginaSecao = (titulo, secao, imagens, layoutIdx, dica) => {
    const texto = renderTextoSecao(secao);
    const layout = layoutIdx % 4;
    let corpo = '';

    if (layout === 0) {
      // Hero: imagem larga + texto em colunas
      const imgHero = imagens[0] ? `<img src="${imagens[0]}" style="width:100%;max-height:85mm;object-fit:cover;border-radius:3px;display:block;margin-bottom:5mm;"/>` : '';
      corpo = `
        ${imgHero}
        <div style="column-count:2;column-gap:5mm;font-size:10pt;line-height:1.65;">
          ${texto}
        </div>
      `;
    } else if (layout === 1) {
      // Magazine: texto + imagem lateral
      const imgLat = imagens[0] ? `<img src="${imagens[0]}" style="width:100%;max-height:200mm;object-fit:cover;border-radius:3px;display:block;"/>` : '';
      corpo = `
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:5mm;align-items:start;">
          <div>${texto}</div>
          <div style="display:flex;align-items:flex-start;justify-content:center;">${imgLat}</div>
        </div>
      `;
    } else if (layout === 2) {
      // Grid: imagens 2x2 + texto
      const imgs = imagens.slice(0, 4).map((img, i) => img ? `<img src="${img}" style="width:100%;height:55mm;object-fit:cover;border-radius:3px;display:block;"/>` : '').join('');
      corpo = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:4mm;">
          ${imgs}
        </div>
        <div style="font-size:10pt;line-height:1.65;">${texto}</div>
      `;
    } else {
      // Overlay: imagem de fundo com texto
      const imgBack = imagens[0] ? `background-image:url(${imagens[0]});background-size:cover;background-position:center;` : '';
      corpo = `
        <div style="position:relative;border-radius:3px;overflow:hidden;min-height:120mm;${imgBack}">
          <div style="background:rgba(249,247,244,0.88);padding:5mm;position:absolute;bottom:0;left:0;right:0;">
            <div style="font-size:10pt;line-height:1.65;">${texto}</div>
          </div>
        </div>
      `;
    }

    return `
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">${titulo}</div>
  ${corpo}
  <div class="info-box" style="margin-top:4mm;">
    <p style="font-size:9.5pt;line-height:1.6;"><strong>Dica:</strong> ${dica}</p>
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>`;
  };

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
  body { font-family: var(--font-body); color: var(--color-text); counter-reset: pagina; }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 14mm 18mm 22mm 18mm;
    position: relative;
    page-break-after: always;
    overflow: visible;
    counter-increment: pagina;
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
  .page-number::after { content: counter(pagina); }

  /* CAPA */
  .cover {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 30mm 20mm;
    min-height: 297mm;
    overflow: hidden;
  }
  .cover-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-size: cover;
    background-position: center;
    z-index: 0;
  }
  .cover-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to bottom, rgba(26,23,20,0.35) 0%, rgba(26,23,20,0.65) 100%);
    z-index: 1;
  }
  .cover-content {
    position: relative;
    z-index: 2;
    color: ${corContraste};
  }
  .cover-monogram {
    margin-bottom: 8mm;
  }
  .cover-monogram svg { display: block; margin: 0 auto; }
  .cover-title {
    font-family: var(--font-display);
    font-size: 42pt;
    margin-bottom: 4mm;
    letter-spacing: 1px;
    line-height: 1.1;
  }
  .cover-subtitle {
    font-family: var(--font-body);
    font-size: 11pt;
    letter-spacing: 5px;
    text-transform: uppercase;
    margin-bottom: 10mm;
  }
  .cover-local {
    font-family: var(--font-body);
    font-size: 12pt;
    margin-bottom: 3mm;
  }
  .cover-date {
    font-family: var(--font-body);
    font-size: 11pt;
    margin-bottom: 10mm;
  }
  .cover-palette {
    display: flex;
    gap: 10mm;
    justify-content: center;
    margin-top: 8mm;
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
    border: 2.5pt solid ${corContraste};
    margin-bottom: 2mm;
  }
  .palette-name { font-size: 8pt; font-family: var(--font-body); }
  .palette-role { font-size: 7pt; opacity: 0.8; font-family: var(--font-body); }
  .cover-deco {
    position: absolute;
    bottom: 18mm;
    left: 0; right: 0;
    z-index: 2;
    display: flex;
    justify-content: center;
  }
  .cover-footer {
    position: absolute;
    bottom: 8mm;
    left: 18mm;
    right: 18mm;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.5pt solid ${corContraste};
    padding-top: 2.5mm;
    font-size: 8pt;
    color: ${corContraste};
  }

  /* ÍNDICE */
  .toc-intro {
    font-size: 11pt;
    line-height: 1.7;
    margin-bottom: 6mm;
    font-style: italic;
    color: var(--color-text-soft);
  }
  .toc-row {
    display: flex;
    justify-content: space-between;
    padding: 2.2mm 0;
    border-bottom: 0.3pt solid #E5E0D9;
    font-size: 10.5pt;
  }
  .toc-row strong { color: var(--color-primary); }

  /* EDITORIAL NARRATIVO */
  .editorial-header {
    text-align: center;
    margin-bottom: 6mm;
  }
  .editorial-header h2 {
    font-family: var(--font-display);
    font-size: 26pt;
    color: var(--color-primary);
    margin-bottom: 2mm;
  }
  .editorial-header .sub {
    font-size: 10pt;
    color: var(--color-text-soft);
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .editorial-columns {
    column-count: 2;
    column-gap: 6mm;
    column-rule: 0.5pt solid #E5E0D9;
  }
  .editorial-columns p {
    font-family: var(--font-body);
    font-size: 10.5pt;
    line-height: 1.7;
    color: var(--color-text);
    margin-bottom: 8px;
    text-align: justify;
  }
  .editorial-dropcap::first-letter {
    font-family: var(--font-display);
    font-size: 3.8em;
    float: left;
    line-height: 0.75;
    margin-right: 0.08em;
    margin-top: 0.05em;
    color: var(--color-primary);
    font-weight: bold;
  }
  .editorial-image-inline {
    break-inside: avoid;
    margin: 4mm 0;
  }
  .editorial-image-inline img {
    width: 100%;
    max-height: 70mm;
    object-fit: cover;
    border-radius: 3px;
    display: block;
  }
  .editorial-image-float-left {
    float: left;
    width: 45%;
    margin: 2mm 3mm 2mm 0;
    break-inside: avoid;
  }
  .editorial-image-float-left img {
    width: 100%;
    max-height: 55mm;
    object-fit: cover;
    border-radius: 3px;
    display: block;
  }
  .editorial-image-float-right {
    float: right;
    width: 45%;
    margin: 2mm 0 2mm 3mm;
    break-inside: avoid;
  }
  .editorial-image-float-right img {
    width: 100%;
    max-height: 55mm;
    object-fit: cover;
    border-radius: 3px;
    display: block;
  }

  /* SEÇÕES TEMÁTICAS */
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

  /* UTILITÁRIOS */
  .checklist-clean td { border-bottom: 0.5pt solid #E5E0D9; }
  .checklist-clean th { border-bottom: 1pt solid var(--color-primary); background: transparent; }
  .checklist-clean { border: none; }
  .checklist-clean tr:first-child th { border-top: 1pt solid var(--color-primary); }

  p, .info-box, .timeline-item, .data-table tr {
    page-break-inside: avoid;
  }
  .section-title, .section-subtitle {
    page-break-after: avoid;
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════ CAPA -->
<div class="page cover">
  <div class="cover-bg" style="background-image:url(${imgCapa || ''});"></div>
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div class="cover-monogram">${svgMono}</div>
    <div class="cover-title">${nomeCasal}</div>
    <div class="cover-subtitle">Memorial do Casamento</div>
    <div class="cover-local">${localCompleto}</div>
    <div class="cover-date">${dataFormatada}</div>
    <div class="cover-palette">
      ${paleta.map((cor, i) => `
        <div class="palette-item">
          <div class="palette-circle" style="background:${cor};"></div>
          <div class="palette-name">${getNomeCor(cor)}</div>
          <div class="palette-role">${i===0?'Principal':i===1?'Secundária':'Terciária'}</div>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="cover-deco">${svgDecoracaoPerfil(perfil, corContraste, 200)}</div>
  <div class="cover-footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ÍNDICE -->
<div class="page">
  <div style="text-align:center;margin-bottom:4mm;">${svgDecoracaoPerfil(perfil, corPrimaria, 140)}</div>
  <div class="section-title" style="font-size:18pt;text-align:center;border:none;">Bem-vindos ao seu Memorial</div>
  <p class="toc-intro" style="text-align:center;">
    Este memorial foi criado exclusivamente para <strong>${nomeCasal}</strong> pelo descomplicaí.
    Ele reúne todas as decisões, referências visuais e orientações práticas para tornar o planejamento
    do seu casamento uma experiência leve, organizada e inesquecível.
  </p>
  <div class="section-title" style="font-size:16pt;margin-top:5mm;">Índice</div>
  ${[
    ['O Memorial', '3'],
    ['Identidade Visual', '5'],
    ['Cerimônia', '6'],
    ['Decoração', '7'],
    ['Mesa Posta', '8'],
    ['Alimentação e Bebidas', '9'],
    ['Entretenimento', '10'],
    ['Vestuário e Beleza', '11'],
    ['Papelaria e Identidade', '12'],
    ['Linha do Tempo', '13'],
    ['Checklist de Decisões', '15'],
    ['Fornecedores', '17'],
    ['Orçamento Detalhado', '18'],
    ['Dicas Regionais', '20'],
  ].map(([s, p]) => `<div class="toc-row"><span><strong>${s}</strong></span><span style="color:var(--color-text-soft);">${p}</span></div>`).join('')}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ EDITORIAL NARRATIVO (páginas 3-4) -->
<div class="page">
  <div class="editorial-header">
    <h2>O Memorial</h2>
    <div class="sub">A história do casamento de ${nomeCasal}</div>
  </div>
  <div class="editorial-columns">
    ${renderTextoEditorial(secoesNormais)}
  </div>
  ${imgDetalhes.length > 0 ? `
    <div class="editorial-image-inline" style="margin-top:5mm;">
      <img src="${imgDetalhes[0]}" alt="detalhes"/>
    </div>
  ` : ''}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

${imgDetalhes.length > 1 ? `
<div class="page">
  <div class="editorial-columns" style="margin-top:8mm;">
    <div class="editorial-image-float-left"><img src="${imgDetalhes[1]}" alt="detalhes"/></div>
    <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">
      Cada detalhe deste memorial foi pensado para refletir a personalidade única de ${nomeCasal}.
      Das cores à escolha das flores, da cerimônia à festa, tudo converge para uma experiência
      autêntica e inesquecível.
    </p>
    <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">
      Use este documento como guia visual e prático durante todo o planejamento.
      Compartilhe com fornecedores, padrinhos e familiares para que todos estejam alinhados
      com a visão do casal.
    </p>
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<!-- ═══════════════════════════════════════════════════ SEÇÕES TEMÁTICAS -->
${renderPaginaSecao('Identidade Visual', getSecao('identidade'), imgDecoracao, 0, dicasPorSecao['Identidade Visual'])}
${renderPaginaSecao('Cerimônia', getSecao('cerimonia'), imgCerimonia, 1, dicasPorSecao['Cerimônia'])}
${renderPaginaSecao('Decoração', getSecao('decoracao'), imgFlores.length ? imgFlores : imgDecoracao, 2, dicasPorSecao['Decoração'])}
${renderPaginaSecao('Mesa Posta', getSecao('mesa'), imgMesa, 3, dicasPorSecao['Mesa Posta'])}
${renderPaginaSecao('Alimentação e Bebidas', getSecao('alimentacao'), imgAlimentacao, 0, dicasPorSecao['Alimentação e Bebidas'])}
${renderPaginaSecao('Entretenimento', getSecao('entretenimento'), imgEntretenimento, 1, dicasPorSecao['Entretenimento'])}
${renderPaginaSecao('Vestuário e Beleza', getSecao('vestuario'), imgVestido.length ? imgVestido : imgBeleza, 2, dicasPorSecao['Vestuário e Beleza'])}
${renderPaginaSecao('Papelaria e Identidade', getSecao('papelaria'), imgPapelaria, 3, dicasPorSecao['Papelaria e Identidade'])}

<!-- ═══════════════════════════════════════════════════ LINHA DO TEMPO -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Linha do Tempo</div>
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CALENDÁRIO MENSAL -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CHECKLIST -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Checklist de Decisões</div>
  <table class="data-table checklist-clean">
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CHECKLIST ANOTAÇÕES -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ FORNECEDORES -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ FORNECEDORES ANOTAÇÕES -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO CONTINUAÇÃO -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
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
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ DICAS REGIONAIS -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Dicas Regionais</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:5mm;">Informações específicas para <strong>${localCompleto}</strong>.</p>
  <div class="section-subtitle">Clima Local</div>
  <div class="info-box"><p>${dicasRegionais.clima}</p></div>
  <div class="section-subtitle">Cuidados Especiais</div>
  ${dicasRegionais.cuidados.map(c=>`<p style="font-size:10pt;line-height:1.6;margin-bottom:2px;margin-left:3mm;">&bull; ${c}</p>`).join('')}
  <div class="section-subtitle" style="margin-top:5mm;">Melhores Épocas</div>
  ${dicasRegionais.melhoresEpocas.map(e=>`<p style="font-size:10pt;line-height:1.6;margin-bottom:2px;margin-left:3mm;">&check; ${e}</p>`).join('')}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CTA FINAL -->
<div class="page cta-page">
  <div class="cta-title">Obrigado por confiar no descomplicaí</div>
  <div class="cta-text">${nomeCasal}, este memorial é apenas o começo. Assine o descomplicaí e tenha acesso à gestão completa do seu casamento.</div>
  <div class="cta-quote">"O amor é a poesia dos sentidos."</div>
  <div style="font-size:9pt;color:var(--color-text-soft);margin-bottom:6mm;">&mdash; Honoré de Balzac</div>
  ${qrCodeDataUri ? `<img src="${qrCodeDataUri}" class="cta-qr" alt="QR Code"/>` : ''}
  <div style="font-size:10pt;color:var(--color-primary);margin-top:3mm;">arxum.csstudios.site/descomplicai</div>
  <div style="margin-top:6mm;">${svgLogo}</div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${svgLogo}</span>
    <span class="page-number"></span>
  </div>
</div>

</body>
</html>
  `;

  return html;
}