// utils/pdfTemplate.js — Template Editorial Fluido (descomplicaí v4)
// Princípio: quantas páginas forem necessárias. Nada de número fixo.

import fs from 'fs';
import path from 'path';
import {
  capitalizarNome, formatarData, getPaleta, isCorEscura, getCorContraste,
  getNomeCor, getDicasRegionais, getItensOrcamento, getValorRegionalizado,
  parsearMemorial, extrairChecklist, extrairFornecedores, getImagem,
} from './pdfUtils';
import { sugerirFontes } from './sugestoes';

const CORES_GRAFICO = ['#2E7D32', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#E65100', '#00838F', '#AD1457'];

function normalizar(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

/* ═══════════════════════════════════════════════════════════
   FILTRO HEX — remove códigos hex do texto do memorial
   ═══════════════════════════════════════════════════════════ */
function filtrarHexDoTexto(texto) {
  if (!texto || typeof texto !== 'string') return texto;
  return texto.replace(/#[0-9A-Fa-f]{3,8}\b/g, '').replace(/\s{2,}/g, ' ').trim();
}

/* ═══════════════════════════════════════════════════════════
   FONTES — carrega Regular e Bold em base64
   ═══════════════════════════════════════════════════════════ */
function fonteToBase64(nomeFonte, peso = 'regular') {
  if (typeof nomeFonte !== 'string') return null;
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
    'DM Sans': { regular: 'dm-sans-v17-latin-regular.woff2', bold: 'dm-sans-v17-latin-700.woff2', light: 'dm-sans-v17-latin-300.woff2' },
    'Space Mono': { regular: 'space-mono-v17-latin-regular.woff2', bold: 'space-mono-v17-latin-700.woff2', italic: 'space-mono-v17-latin-italic.woff2' },
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
   IMAGENS — base64 única e múltiplas (SEM readdirSync)
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

function getImagensMultiplas(categoria, chave, quantidade = 3) {
  const resultado = [];
  const chaveStr = String(chave || 'default').toLowerCase();

  const principal = getImagem(categoria, chaveStr);
  if (principal) {
    try {
      if (fs.existsSync(principal)) {
        const buf = fs.readFileSync(principal);
        resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`);
      }
    } catch (e) { console.warn('Img principal falhou:', categoria, chaveStr, e.message); }
  }

  if (resultado.length === 0) {
    const fallback = getImagem(categoria, 'default');
    if (fallback) {
      try {
        if (fs.existsSync(fallback)) {
          const buf = fs.readFileSync(fallback);
          resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`);
        }
      } catch (e) {}
    }
  }

  if (principal && resultado.length > 0) {
    const dir = path.dirname(principal);
    const ext = path.extname(principal);
    const baseName = path.basename(principal, ext);
    const prefixMatch = baseName.match(/^(.+)-(\d+)$/);
    const prefix = prefixMatch ? prefixMatch[1] : baseName;

    for (let i = 2; i <= 6; i++) {
      if (resultado.length >= quantidade) break;
      const candidato = path.join(dir, `${prefix}-${i}${ext}`);
      try {
        if (fs.existsSync(candidato)) {
          const buf = fs.readFileSync(candidato);
          resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`);
        }
      } catch (e) {}
    }
  }

  if (resultado.length < quantidade) {
    const extrasPorCategoria = {
      decoracao: ['decor-default-1', 'decor-default-2', 'decor-default-3'],
      cerimonia: ['cerimonia-default-1', 'cerimonia-beijo-1', 'cerimonia-corredor-1'],
      flores: ['flores-default-1', 'flores-default-2', 'rosas-1'],
      mesa: ['mesa-default-1', 'mesa-default-2'],
      alimentacao: ['bolo-casamento-2', 'mesa-doces-1', 'coquetel-drinks-1'],
      entretenimento: ['pista-danca-2', 'dj-banda-1', 'cabine-fotos-1'],
      vestidos: ['vestido-default-1', 'vestido-default-2'],
      papelaria: ['convite-2', 'menu-lugar-1', 'monograma-1'],
      beleza: ['making-of-noiva-1', 'maquiagem-noiva-1', 'acessorios-noiva-1'],
      detalhes: ['aliancas-1', 'buque-1', 'lembrancinhas-1'],
      local: ['local-default-1', 'local-jardim-1', 'local-salao-1'],
    };
    const extras = extrasPorCategoria[categoria] || [];
    const baseDir = path.join(process.cwd(), 'public', 'images', categoria);
    for (const nome of extras) {
      if (resultado.length >= quantidade) break;
      const candidato = path.join(baseDir, `${nome}.jpg`);
      try {
        if (fs.existsSync(candidato)) {
          const buf = fs.readFileSync(candidato);
          resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`);
        }
      } catch (e) {}
    }
  }

  return resultado;
}

/* ═══════════════════════════════════════════════════════════
   LOGO DESCOMPLECAÍ — tipografia pura, zero SVG
   ═══════════════════════════════════════════════════════════ */
function logoDescomplicaiHTML(corDescomplica = '#8B6F5E', corI = '#10B981') {
  return `<span style="font-family:'LogoFont1', 'DM Sans', 'Helvetica Neue', Arial, sans-serif; font-weight:300; font-size:1em; color:${corDescomplica};">descomplica</span><span style="font-family:'LogoFont2', 'Space Mono', 'Courier New', monospace; font-weight:400; font-style:italic; font-size:1.05em; color:${corI};">í</span>`;
}

/* ═══════════════════════════════════════════════════════════
   SVGs DECORATIVOS
   ═══════════════════════════════════════════════════════════ */
function svgMonograma(inicial1, inicial2, cor, tamanho = 140) {
  const i1 = String(inicial1 || 'N').charAt(0).toUpperCase();
  const i2 = String(inicial2 || 'N').charAt(0).toUpperCase();
  const c = String(cor || '#1A1714');
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="70" r="65" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.6"/>
    <circle cx="70" cy="70" r="58" fill="none" stroke="${c}" stroke-width="0.6" opacity="0.4"/>
    <text x="70" y="78" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="38" fill="${c}" letter-spacing="2">${i1} <tspan font-size="24" dy="-4">&amp;</tspan> ${i2}</text>
    <line x1="35" y1="95" x2="105" y2="95" stroke="${c}" stroke-width="1" opacity="0.5"/>
  </svg>`;
}

function svgMonogramaPorPerfil(inicial1, inicial2, perfil, cor, tamanho = 140) {
  const i1 = String(inicial1 || 'N').charAt(0).toUpperCase();
  const i2 = String(inicial2 || 'N').charAt(0).toUpperCase();
  const c = String(cor || '#1A1714');
  const p = String(perfil || 'minimalista').toLowerCase();

  if (p === 'classico') {
    return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="100" height="100" fill="none" stroke="${c}" stroke-width="1" opacity="0.4"/>
      <text x="70" y="78" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="36" fill="${c}" letter-spacing="1">${i1} & ${i2}</text>
      <line x1="30" y1="95" x2="110" y2="95" stroke="${c}" stroke-width="0.8" opacity="0.5"/>
      <line x1="30" y1="98" x2="110" y2="98" stroke="${c}" stroke-width="0.4" opacity="0.3"/>
    </svg>`;
  }
  if (p === 'boho') {
    return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" fill="none" stroke="${c}" stroke-width="1" opacity="0.3" stroke-dasharray="4 2"/>
      <text x="70" y="76" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="34" fill="${c}" letter-spacing="1">${i1} <tspan font-size="20" dy="-2">&amp;</tspan> ${i2}</text>
      <path d="M30,100 Q50,85 70,100 Q90,85 110,100" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.4"/>
    </svg>`;
  }
  if (p === 'moderno') {
    return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="90" height="90" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>
      <rect x="35" y="35" width="70" height="70" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.3"/>
      <text x="70" y="78" text-anchor="middle" font-family="DisplayFont, 'Helvetica Neue', sans-serif" font-size="32" fill="${c}" font-weight="bold" letter-spacing="2">${i1} / ${i2}</text>
    </svg>`;
  }
  if (p === 'rustico') {
    return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="55" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.4"/>
      <text x="70" y="76" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="34" fill="${c}" letter-spacing="1">${i1} + ${i2}</text>
      <path d="M25,105 Q45,90 70,105 Q95,90 115,105" fill="none" stroke="${c}" stroke-width="1" opacity="0.4"/>
      <circle cx="45" cy="95" r="2" fill="${c}" opacity="0.3"/>
      <circle cx="95" cy="95" r="2" fill="${c}" opacity="0.3"/>
    </svg>`;
  }
  if (p === 'romantico') {
    return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M70,25 C55,10 35,25 35,45 C35,65 70,85 70,85 C70,85 105,65 105,45 C105,25 85,10 70,25" fill="none" stroke="${c}" stroke-width="1" opacity="0.4"/>
      <text x="70" y="100" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="30" fill="${c}" letter-spacing="1">${i1} & ${i2}</text>
    </svg>`;
  }
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="70" x2="120" y2="70" stroke="${c}" stroke-width="1" opacity="0.6"/>
    <text x="70" y="65" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="36" fill="${c}" letter-spacing="2">${i1} & ${i2}</text>
    <line x1="20" y1="75" x2="120" y2="75" stroke="${c}" stroke-width="0.5" opacity="0.3"/>
  </svg>`;
}

function svgDecoracaoPerfil(perfil, cor, largura = 160) {
  const p = String(perfil || 'minimalista').toLowerCase();
  const c = String(cor || '#1A1714');
  const h = 40;
  if (p === 'classico') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,20 Q${largura/4},5 ${largura/2},20 T${largura},20" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.5"/>
      <path d="M${largura*0.15},25 Q${largura*0.35},10 ${largura*0.5},25 T${largura*0.85},25" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.35"/>
      <circle cx="${largura/2}" cy="12" r="3" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.4"/>
    </svg>`;
  }
  if (p === 'boho') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,35 Q20,10 35,25 Q50,5 65,28 Q80,8 95,26 Q110,6 125,25 Q135,15 ${largura-10},35" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.5"/>
      <path d="M25,38 Q35,18 45,32 Q55,15 70,33 Q85,16 100,32 Q115,18 125,35" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.35"/>
      <circle cx="35" cy="22" r="2" fill="${c}" opacity="0.3"/>
      <circle cx="95" cy="20" r="2" fill="${c}" opacity="0.3"/>
    </svg>`;
  }
  if (p === 'moderno') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${largura*0.1}" y="15" width="${largura*0.15}" height="10" fill="none" stroke="${c}" stroke-width="1" opacity="0.5"/>
      <rect x="${largura*0.35}" y="12" width="${largura*0.25}" height="16" fill="none" stroke="${c}" stroke-width="1" opacity="0.5"/>
      <rect x="${largura*0.7}" y="15" width="${largura*0.2}" height="10" fill="none" stroke="${c}" stroke-width="1" opacity="0.5"/>
      <line x1="0" y1="32" x2="${largura}" y2="32" stroke="${c}" stroke-width="1.5" opacity="0.6"/>
    </svg>`;
  }
  if (p === 'rustico') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,30 Q15,15 25,28 Q35,10 50,30 Q65,12 80,28 Q95,14 110,30 Q125,16 ${largura-5},30" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>
      <path d="M20,35 Q30,22 40,33 Q55,18 70,34 Q85,20 100,33 Q115,22 125,35" fill="none" stroke="${c}" stroke-width="1" opacity="0.35"/>
      <circle cx="50" cy="18" r="2.5" fill="${c}" opacity="0.25"/>
      <circle cx="100" cy="20" r="2" fill="${c}" opacity="0.25"/>
    </svg>`;
  }
  if (p === 'romantico') {
    return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${largura/2},12 C${largura/2-8},2 ${largura/2-16},8 ${largura/2-16},16 C${largura/2-16},24 ${largura/2},32 ${largura/2},32 C${largura/2},32 ${largura/2+16},24 ${largura/2+16},16 C${largura/2+16},8 ${largura/2+8},2 ${largura/2},12" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.5"/>
      <path d="M0,28 Q${largura/3},20 ${largura/2},28 T${largura},28" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.35"/>
    </svg>`;
  }
  return `<svg width="${largura}" height="${h}" viewBox="0 0 ${largura} ${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${largura*0.2}" y1="20" x2="${largura*0.8}" y2="20" stroke="${c}" stroke-width="1" opacity="0.6"/>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZADORES DE TEXTO
   ═══════════════════════════════════════════════════════════ */
function renderTextoSecao(secao) {
  if (!secao || typeof secao !== 'object' || !Array.isArray(secao.linhas) || secao.linhas.length === 0) {
    return '<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">Conteúdo personalizado para este casal.</p>';
  }
  return secao.linhas.map(linha => {
    if (typeof linha !== 'string') return '';
    const texto = filtrarHexDoTexto(linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim());
    if (!texto) return '';
    if (linha.startsWith('### ')) return `<h3 style="font-family:var(--font-display);font-size:12pt;color:var(--color-primary);margin-top:12px;margin-bottom:5px;">${texto}</h3>`;
    if (linha.startsWith('- ') || linha.startsWith('* ')) return `<p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:4px;margin-left:10px;">&bull; ${texto}</p>`;
    return `<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${texto}</p>`;
  }).join('');
}

function renderTextoEditorial(secoesNormais) {
  if (!Array.isArray(secoesNormais) || secoesNormais.length === 0) {
    return '<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">Memorial do casamento.</p>';
  }
  const todasLinhas = [];
  for (const sec of secoesNormais) {
    if (!sec || !Array.isArray(sec.linhas)) continue;
    for (const linha of sec.linhas) {
      if (typeof linha !== 'string') continue;
      const limpa = filtrarHexDoTexto(linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim());
      if (limpa && !limpa.startsWith('##') && !limpa.startsWith('---')) todasLinhas.push(limpa);
    }
  }
  if (todasLinhas.length === 0) {
    return '<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">Memorial do casamento.</p>';
  }
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
   TEXTO INÉDITO POR SEÇÃO TEMÁTICA
   ═══════════════════════════════════════════════════════════ */
function gerarTextoIneditoSecao(tituloSecao, dados) {
  const estilo = String(dados?.estilo || 'classico').toLowerCase();
  const perfil = String(dados?.perfilCasal || estilo).toLowerCase();
  const n1 = capitalizarNome(dados?.nomePessoa1) || 'Noivo';
  const n2 = capitalizarNome(dados?.nomePessoa2) || 'Noiva';
  const flores = dados?.flores || 'flores variadas';
  const iluminacao = dados?.iluminacao || 'natural';
  const velas = dados?.velas || 'velas decorativas';
  const mobiliario = dados?.mobiliarioEspecial || 'mobiliário padrão';
  const tipoJantar = dados?.tipoJantar || 'a definir';
  const tipoBar = dados?.tipoBar || 'a definir';
  const musica = dados?.musicaFesta || 'a definir';
  const atividades = Array.isArray(dados?.atividadesEntretenimento) ? dados.atividadesEntretenimento.join(', ') : 'dança e celebração';
  const estiloVestido = dados?.estiloVestido || 'a definir';
  const formatoConvite = dados?.formatoConvite || 'a definir';
  const tipoCerimonia = dados?.tipoCerimonia || 'simbólica';
  const tipoLocal = dados?.tipoLocal || 'a definir';
  const horario = dados?.horarioCasamento || 'hora a definir';
  const totalConvidados = dados?.totalConvidados || 'a definir';
  const cidade = dados?.cidadeEvento || 'sua cidade';

  const textos = {
    'Identidade Visual': `A identidade visual deste casamento traduz a essência de ${n1} e ${n2} em cada elemento gráfico. O estilo ${estilo} guia todas as escolhas tipográficas e cromáticas, criando uma narrativa visual coesa desde o primeiro convite até a última lembrança. O monograma personalizado será o selo de autenticidade em todos os materiais, desde menus e plaquinhas até a assinatura digital. A paleta de cores foi escolhida para evocar ${perfil === 'romantico' ? 'ternura e delicadeza' : perfil === 'boho' ? 'liberdade e organicidade' : perfil === 'moderno' ? 'sofisticação e precisão' : perfil === 'rustico' ? 'acolhimento e raízes' : 'elegância atemporal'}. Cada fonte, cada espaçamento, cada textura foi pensado para que os convidados sintam a personalidade do casal antes mesmo de chegar ao local.`,

    'Cerimônia': `A cerimônia de ${n1} e ${n2} será um momento de profunda conexão e emoção. Realizada de forma ${tipoCerimonia}, em um ambiente ${tipoLocal}, às ${horario}, cada detalhe foi pensado para criar uma atmosfera ${perfil === 'romantico' ? 'etérea e sonhadora' : perfil === 'boho' ? 'livre e despojada' : perfil === 'moderno' ? 'limpa e impactante' : perfil === 'rustico' ? 'acolhedora e genuína' : 'elegante e atemporal'}. A entrada será marcada por uma trilha sonora cuidadosamente selecionada, e a decoração do altar refletirá a paleta de cores escolhida. Com ${totalConvidados} convidados, a cerimônia será ${totalConvidados === 'intimo' ? 'um momento íntimo e profundo' : totalConvidados === 'grande' ? 'uma celebração grandiosa e vibrante' : 'uma celebração equilibrada e acolhedora'}.`,

    'Decoração': `A decoração do casamento de ${n1} e ${n2} é um convite sensorial. Flores como ${flores} serão dispostas em arranjos que conversam com a iluminação ${iluminacao}, criando pontos de interesse em cada canto do espaço. ${velas !== 'Nenhuma' ? `As ${velas} adicionarão camadas de luz quente e acolhedora.` : 'A iluminação arquitetural será o protagonista da atmosfera.'} O mobiliário ${mobiliario} complementa o estilo ${estilo}, criando ambientes que convidam à permanência. Cada mesa, cada centro de mesa, cada cortina foi pensado para que os convidados se sintam imersos na narrativa visual do casal.`,

    'Mesa Posta': `A mesa posta é a primeira impressão que os convidados terão da experiência gastronômica. Com um jantar ${tipoJantar} e bar ${tipoBar}, cada detalhe da montagem das mesas foi pensado para elevar o momento. A louça, os talheres, as taças e os guardanapos foram selecionados para dialogar com o estilo ${estilo} e a paleta de cores do evento. Sousplats, porta-guardanapos personalizados e menus individuais transformam cada lugar à mesa em uma experiência única. A atenção aos detalhes da mesa posta reflete o cuidado que ${n1} e ${n2} têm com cada convidado.`,

    'Alimentação e Bebidas': `A experiência gastronômica do casamento de ${n1} e ${n2} é tão importante quanto a cerimônia. O jantar ${tipoJantar} será preparado com ingredientes selecionados, respeitando a estação e a região de ${cidade}. O bar ${tipoBar} oferecerá uma carta de bebidas que vai desde clássicos atemporais até criações exclusivas para a noite. A degustação prévia é fundamental para ajustar sabores e apresentação. A mesa de doces e o bolo serão o ponto alto do final da noite, com opções que agradam desde o paladar mais clássico até o mais moderno.`,

    'Entretenimento': `A festa de ${n1} e ${n2} será inesquecível. Com ${musica} animando a pista de dança e atividades como ${atividades}, cada momento foi pensado para criar memórias coletivas. A iluminação de pista, os efeitos especiais e a curadoria musical garantem que a energia se mantenha alta do início ao fim. ${atividades.includes('cabine-fotos') ? 'A cabine de fotos será um ponto de encontro para risadas e lembranças instantâneas.' : ''} ${atividades.includes('drone') ? 'Imagens aéreas capturarão a magnitude da celebração.' : ''} O entretenimento não é apenas diversão — é a celebração da união de duas famílias em uma só.`,

    'Vestuário e Beleza': `O visual de ${n1} e ${n2} no dia do casamento será ${estiloVestido === 'princesa' ? 'um conto de fadas contemporâneo' : estiloVestido === 'sereia' ? 'uma declaração de sensualidade elegante' : estiloVestido === 'minimalista' ? 'uma expressão de sofisticação discreta' : estiloVestido === 'boho' ? 'uma celebração da liberdade e do movimento' : 'uma expressão de elegância pessoal'}. A beleza será trabalhada para realçar traços naturais, com maquiagem e cabelo que resistam às emoções e às horas de festa. Os acessórios, o véu, o bouquet e os detalhes do traje do noivo completam um visual harmonioso e memorável. A prova final, agendada com antecedência, garante que tudo esteja perfeito.`,

    'Papelaria e Identidade': `A papelaria do casamento de ${n1} e ${n2} é a primeira pista que os convidados recebem sobre o que os espera. Os convites no formato ${formatoConvite} carregam o monograma do casal, a paleta de cores e a tipografia escolhida, criando uma expectativa visual coerente. Save the date, RSVP, mapa de localização, menu, plaquinhas de mesa e lembrancinhas formam um universo gráfico completo. Cada peça é uma oportunidade de surpreender e encantar, transformando informação em arte.`,
  };

  return textos[tituloSecao] || `Esta seção apresenta as decisões e referências de ${n1} e ${n2} para ${tituloSecao.toLowerCase()}. Cada detalhe foi pensado para criar uma experiência coesa e memorável no estilo ${estilo}.`;
}

/* ═══════════════════════════════════════════════════════════
   CARD TÉCNICO — dados do questionário
   ═══════════════════════════════════════════════════════════ */
function cardTecnico(tituloSecao, dados) {
  const campos = [];
  const add = (label, val) => { if (val) campos.push(`<<span style="display:inline-block;margin-right:8px;margin-bottom:2px;"><strong>${label}:</strong> ${val}</span>`); };

  if (tituloSecao === 'Cerimônia') {
    add('Tipo', dados?.tipoCerimonia);
    add('Local', dados?.tipoLocal);
    add('Horário', dados?.horarioCasamento);
    add('Convidados', dados?.totalConvidados);
  } else if (tituloSecao === 'Decoração') {
    add('Flores', dados?.flores);
    add('Iluminação', dados?.iluminacao);
    add('Velas', dados?.velas);
    add('Mobiliário', dados?.mobiliarioEspecial);
  } else if (tituloSecao === 'Mesa Posta') {
    add('Jantar', dados?.tipoJantar);
    add('Bar', dados?.tipoBar);
  } else if (tituloSecao === 'Alimentação e Bebidas') {
    add('Jantar', dados?.tipoJantar);
    add('Bar', dados?.tipoBar);
    add('Convidados', dados?.totalConvidados);
  } else if (tituloSecao === 'Entretenimento') {
    add('Música', dados?.musicaFesta);
    add('Atividades', Array.isArray(dados?.atividadesEntretenimento) ? dados.atividadesEntretenimento.join(', ') : '');
  } else if (tituloSecao === 'Vestuário e Beleza') {
    add('Vestido', dados?.estiloVestido);
  } else if (tituloSecao === 'Papelaria e Identidade') {
    add('Convite', dados?.formatoConvite);
  } else if (tituloSecao === 'Identidade Visual') {
    add('Estilo', dados?.estilo);
    add('Perfil', dados?.perfilCasal);
  }

  if (campos.length === 0) return '';
  return `<div class="info-box" style="margin-top:3mm;">
    <p style="font-size:9pt;line-height:1.5;margin-bottom:2px;"><strong style="color:var(--color-primary);">Dados do questionário</strong></p>
    <p style="font-size:9pt;line-height:1.5;">${campos.join('')}</p>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   MINI CHECKLIST DA SEÇÃO
   ═══════════════════════════════════════════════════════════ */
function miniChecklistSecao(tituloSecao, dados) {
  const checks = {
    'Cerimônia': ['Definir tipo de cerimônia', 'Reservar local', 'Contratar oficializante/celebrante', 'Escolher trilha sonora de entrada'],
    'Decoração': ['Definir paleta final', 'Contratar florista', 'Confirmar iluminação', 'Verificar mobiliário especial'],
    'Mesa Posta': ['Definir tipo de jantar', 'Escolher louças e talheres', 'Confirmar bar', 'Aprovar menu'],
    'Alimentação e Bebidas': ['Realizar degustação', 'Definir cardápio', 'Confirmar bar e bebidas', 'Verificar restrições alimentares'],
    'Entretenimento': ['Contratar música/entretenimento', 'Definir playlist', 'Confirmar atividades extras', 'Testar equipamento de som'],
    'Vestuário e Beleza': ['Provar vestido final', 'Agendar cabelo e maquiagem', 'Confirmar traje do noivo', 'Separar acessórios'],
    'Papelaria e Identidade': ['Aprovar design do convite', 'Definir lista de convidados', 'Enviar save the date', 'Confirmar gráfica'],
    'Identidade Visual': ['Aprovar monograma', 'Definir paleta final', 'Testar fontes em impressão', 'Criar guia de identidade'],
  };
  const items = checks[tituloSecao] || ['Definir detalhes', 'Contratar fornecedores', 'Confirmar prazos'];
  return `<div style="margin-top:3mm;padding:2mm;background:${dados?.paleta?.[2] || '#F9F7F4'}22;border-radius:2px;">
    <p style="font-size:9pt;color:var(--color-primary);margin-bottom:2px;"><strong>Mini-checklist</strong></p>
    ${items.map(i => `<div style="font-size:8.5pt;line-height:1.5;display:flex;align-items:center;gap:2mm;"><span style="color:#10B981;font-weight:bold;">í</span> ${i}</div>`).join('')}
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   DICAS POR SEÇÃO
   ═══════════════════════════════════════════════════════════ */
function dicaSecao(tituloSecao) {
  const dicas = {
    'Identidade Visual': 'Mantenha a coerência visual em todos os materiais. Teste as fontes em tamanhos pequenos antes de aprovar.',
    'Cerimônia': 'Chegue 30 minutos antes para acertos finais. Verifique a acústica do local com antecedência.',
    'Decoração': 'Reserve 10% do orçamento de decoração para itens de última hora. Flores frescas chegam no dia do evento.',
    'Mesa Posta': 'Confirme a quantidade de louças uma semana antes. Sousplats elevam o visual sem custos altos.',
    'Alimentação e Bebidas': 'Faça degustação com pelo menos 3 opções de menu. Reserve água e bebidas não alcoólicas generosamente.',
    'Entretenimento': 'Teste o equipamento de som no local. Prepare uma playlist de reserva caso o DJ precise.',
    'Vestuário e Beleza': 'Agende a prova final 2 semanas antes. Leve os sapatos para a prova de altura.',
    'Papelaria e Identidade': 'Imprima 10% a mais de convites para imprevistos. Envie save the date com 8 meses de antecedência.',
  };
  return dicas[tituloSecao] || 'Planeje com antecedência e mantenha uma lista de contatos atualizada.';
}

/* ═══════════════════════════════════════════════════════════
   FUNÇÃO PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
export function gerarTemplateHTML({ memorial, dadosEvento, qrCodeDataUri = null }) {
  const estilo = String(dadosEvento?.estilo || 'classico').toLowerCase();
  const perfil = String(dadosEvento?.perfilCasal || estilo).toLowerCase();
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

  const nome1 = capitalizarNome(dadosEvento?.nomePessoa1);
  const nome2 = capitalizarNome(dadosEvento?.nomePessoa2);
  const nomeCasal = (nome1 && nome2) ? `${nome1} & ${nome2}` : 'Nosso Casamento';
  const inicial1 = nome1 ? nome1.charAt(0) : 'N';
  const inicial2 = nome2 ? nome2.charAt(0) : 'N';
  const dataFormatada = formatarData(dadosEvento?.dataEvento);
  const cidade = String(dadosEvento?.cidadeEvento || '');
  const estado = String(dadosEvento?.estadoEvento || '');
  const localCompleto = (cidade && estado) ? `${cidade}, ${estado}` : (cidade || estado || 'Local a definir');

  const secoes = parsearMemorial(memorial);
  const secoesNormais = Array.isArray(secoes) ? secoes.filter(s => {
    if (!s || typeof s !== 'object') return false;
    const t = normalizar(s.titulo);
    return !t.includes('fornecedor') && !t.includes('orcamento') && !t.includes('checklist') && !t.includes('decisoes') && !t.includes('linha do tempo');
  }) : [];

  const checklist = extrairChecklist(secoes);
  const fornecedores = extrairFornecedores(secoes);
  const itensOrcamento = getItensOrcamento(cidade, estado);
  const dicasRegionais = getDicasRegionais(cidade, estado);

  const displayRegular = fonteToBase64(fonteDisplay, 'regular');
  const displayBold = fonteToBase64(fonteDisplay, 'bold');
  const corpoRegular = fonteToBase64(fonteCorpo, 'regular');
  const corpoBold = fonteToBase64(fonteCorpo, 'bold');
  const logoFont1 = fonteToBase64('DM Sans', 'light');
  const logoFont2 = fonteToBase64('Space Mono', 'italic');

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
  if (logoFont1) {
    fontFaceCss += `@font-face { font-family: 'LogoFont1'; src: url(data:font/woff2;base64,${logoFont1}) format('woff2'); font-weight: 300; font-style: normal; }`;
  } else {
    fontFaceCss += `@font-face { font-family: 'LogoFont1'; src: local('DM Sans'), local('Helvetica Neue'), local('Arial'); font-weight: 300; }`;
  }
  if (logoFont2) {
    fontFaceCss += `@font-face { font-family: 'LogoFont2'; src: url(data:font/woff2;base64,${logoFont2}) format('woff2'); font-weight: 400; font-style: italic; }`;
  } else {
    fontFaceCss += `@font-face { font-family: 'LogoFont2'; src: local('Space Mono'), local('Courier New'), local('monospace'); font-weight: 400; font-style: italic; }`;
  }

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
    if (typeof tituloBusca !== 'string') return null;
    const buscaNormalizada = normalizar(tituloBusca);
    if (!Array.isArray(secoesNormais)) return null;
    return secoesNormais.find(s => normalizar(s.titulo).includes(buscaNormalizada)) || null;
  };

  const grafico = gerarSvgPizza(itensOrcamento.slice(0, 8));
  const svgDeco = svgDecoracaoPerfil(perfil, corPrimaria);
  const svgMono = svgMonogramaPorPerfil(inicial1, inicial2, perfil, corContraste);
  const logoHtml = logoDescomplicaiHTML(corPrimaria, '#10B981');

  const secoesTematicas = [
    { titulo: 'Identidade Visual', imagens: imgDecoracao, layout: 0 },
    { titulo: 'Cerimônia', imagens: imgCerimonia, layout: 1 },
    { titulo: 'Decoração', imagens: imgFlores.length ? imgFlores : imgDecoracao, layout: 2 },
    { titulo: 'Mesa Posta', imagens: imgMesa, layout: 3 },
    { titulo: 'Alimentação e Bebidas', imagens: imgAlimentacao, layout: 0 },
    { titulo: 'Entretenimento', imagens: imgEntretenimento, layout: 1 },
    { titulo: 'Vestuário e Beleza', imagens: imgVestido.length ? imgVestido : imgBeleza, layout: 2 },
    { titulo: 'Papelaria e Identidade', imagens: imgPapelaria, layout: 3 },
  ];

  const renderPaginaSecao = (titulo, secao, imagens, layoutIdx) => {
    const textoInedito = gerarTextoIneditoSecao(titulo, dadosEvento);
    const layout = (layoutIdx % 4);
    let corpo = '';

    if (layout === 0) {
      const imgHero = (imagens && imagens[0]) ? `<img src="${imagens[0]}" style="width:100%;max-height:85mm;object-fit:cover;border-radius:3px;display:block;margin-bottom:5mm;"/>` : '';
      corpo = `
        ${imgHero}
        <div style="column-count:2;column-gap:5mm;font-size:10pt;line-height:1.65;">
          <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p>
        </div>
      `;
    } else if (layout === 1) {
      const imgLat = (imagens && imagens[0]) ? `<img src="${imagens[0]}" style="width:100%;max-height:200mm;object-fit:cover;border-radius:3px;display:block;"/>` : '';
      corpo = `
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:5mm;align-items:start;">
          <div><p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p></div>
          <div style="display:flex;align-items:flex-start;justify-content:center;">${imgLat}</div>
        </div>
      `;
    } else if (layout === 2) {
      const imgs = (imagens || []).slice(0, 4).map((imgSrc) => imgSrc ? `<img src="${imgSrc}" style="width:100%;height:55mm;object-fit:cover;border-radius:3px;display:block;"/>` : '').join('');
      corpo = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:4mm;">
          ${imgs}
        </div>
        <div style="font-size:10pt;line-height:1.65;"><p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p></div>
      `;
    } else {
      const imgBack = (imagens && imagens[0]) ? `background-image:url(${imagens[0]});background-size:cover;background-position:center;` : '';
      corpo = `
        <div style="position:relative;border-radius:3px;overflow:hidden;min-height:120mm;${imgBack}">
          <div style="background:rgba(249,247,244,0.88);padding:5mm;position:absolute;bottom:0;left:0;right:0;">
            <div style="font-size:10pt;line-height:1.65;"><p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p></div>
          </div>
        </div>
      `;
    }

    return `
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">${String(titulo || '')}</div>
  ${corpo}
  ${cardTecnico(titulo, dadosEvento)}
  <div class="info-box" style="margin-top:3mm;">
    <p style="font-size:9.5pt;line-height:1.6;"><span style="color:#10B981;font-weight:bold;font-size:11pt;margin-right:4px;">í</span><strong>Dica:</strong> ${dicaSecao(titulo)}</p>
  </div>
  ${miniChecklistSecao(titulo, dadosEvento)}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>`;
  };

  let paginasTematicas = '';
  secoesTematicas.forEach((sec, idx) => {
    paginasTematicas += renderPaginaSecao(sec.titulo, getSecao(sec.titulo), sec.imagens, idx);
  });

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
  .cover-monogram { margin-bottom: 8mm; }
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
  .toc-dots {
    flex: 1;
    border-bottom: 1pt dotted #C8BFB4;
    margin: 0 3mm 2mm 3mm;
    min-width: 10mm;
  }

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
    font-size: 3.2em;
    float: left;
    line-height: 0.85;
    margin-right: 0.08em;
    margin-top: 0.02em;
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

  .idv-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
  }
  .idv-monogram-repeat { margin: 4mm 0; opacity: 0.15; }
  .idv-monogram-main { margin: 2mm 0 6mm 0; }
  .idv-swatches {
    display: flex;
    gap: 8mm;
    justify-content: center;
    margin: 4mm 0;
  }
  .idv-swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .idv-swatch-box {
    width: 22mm;
    height: 22mm;
    border-radius: 3px;
    margin-bottom: 2mm;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .idv-swatch-name { font-size: 9pt; font-family: var(--font-body); }
  .idv-swatch-hex { font-size: 7.5pt; font-family: 'LogoFont2', monospace; color: var(--color-text-soft); }
  .idv-typo-sample {
    font-family: var(--font-display);
    font-size: 18pt;
    margin: 4mm 0;
    line-height: 1.3;
  }
  .idv-typo-body {
    font-family: var(--font-body);
    font-size: 10pt;
    line-height: 1.6;
    max-width: 140mm;
    margin: 0 auto;
  }
  .idv-elemento { margin: 4mm 0; }

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

  .timeline-horizontal {
    display: flex;
    gap: 4mm;
    margin-top: 4mm;
    overflow: visible;
  }
  .timeline-card {
    flex: 1;
    min-width: 0;
    border-radius: 3px;
    padding: 4mm;
    page-break-inside: avoid;
    position: relative;
  }
  .timeline-card::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -4mm;
    width: 4mm;
    height: 1pt;
    background: #C8BFB4;
  }
  .timeline-card:last-child::after { display: none; }
  .timeline-card h4 {
    font-family: var(--font-display);
    font-size: 11pt;
    margin-bottom: 2mm;
  }
  .timeline-card p {
    font-size: 9pt;
    line-height: 1.5;
    margin-bottom: 1px;
  }
  .timeline-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 3mm 0;
  }
  .timeline-connector-line {
    width: 100%;
    height: 2pt;
    background: linear-gradient(to right, #4CAF50, #FFC107, #FF9800, #F44336);
    border-radius: 1pt;
  }

  .calendario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3mm;
    margin-top: 4mm;
  }
  .calendario-mes {
    border: 0.5pt solid #E5E0D9;
    border-radius: 2px;
    padding: 3mm;
    page-break-inside: avoid;
  }
  .calendario-mes h5 {
    font-family: var(--font-display);
    font-size: 10pt;
    color: var(--color-primary);
    margin-bottom: 2mm;
    border-bottom: 0.5pt solid #E5E0D9;
    padding-bottom: 1mm;
  }
  .calendario-mes p {
    font-size: 8.5pt;
    line-height: 1.5;
    margin-bottom: 1px;
  }

  .budget-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 5mm;
    align-items: start;
    margin-bottom: 4mm;
  }
  .budget-chart svg { display: block; }

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

  .checklist-clean td { border-bottom: 0.5pt solid #E5E0D9; }
  .checklist-clean th { border-bottom: 1pt solid var(--color-primary); background: transparent; }
  .checklist-clean { border: none; }
  .checklist-clean tr:first-child th { border-top: 1pt solid var(--color-primary); }
  .check-icon {
    display: inline-block;
    width: 3mm;
    height: 3mm;
    border: 0.8pt solid var(--color-primary);
    border-radius: 1px;
    position: relative;
  }
  .check-icon::after {
    content: '';
    position: absolute;
    left: 0.6mm;
    top: -0.3mm;
    width: 1.2mm;
    height: 2mm;
    border: solid var(--color-primary);
    border-width: 0 0.8pt 0.8pt 0;
    transform: rotate(45deg);
    opacity: 0.3;
  }

  .dicas-clima-box {
    background: ${corSecundaria}15;
    border-left: 2.5pt solid var(--color-primary);
    padding: 3mm;
    margin: 3mm 0;
    border-radius: 2px;
  }
  .epoca-badge {
    display: inline-block;
    padding: 1mm 2mm;
    border-radius: 2px;
    font-size: 8.5pt;
    margin: 1mm;
    background: ${corSecundaria}33;
  }

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
    <span>${logoHtml}</span>
    <span>arxum.csstudios.site/descomplicai</span>
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
    ['O Memorial', 'Memorial'],
    ['Identidade Visual', 'Identidade Visual'],
    ['Cerimônia', 'Cerimônia'],
    ['Decoração', 'Decoração'],
    ['Mesa Posta', 'Mesa Posta'],
    ['Alimentação e Bebidas', 'Alimentação e Bebidas'],
    ['Entretenimento', 'Entretenimento'],
    ['Vestuário e Beleza', 'Vestuário e Beleza'],
    ['Papelaria e Identidade', 'Papelaria e Identidade'],
    ['Linha do Tempo', 'Linha do Tempo'],
    ['Calendário Mensal', 'Calendário Mensal'],
    ['Checklist de Decisões', 'Checklist'],
    ['Fornecedores', 'Fornecedores'],
    ['Orçamento Detalhado', 'Orçamento'],
    ['Dicas Regionais', 'Dicas Regionais'],
  ].map(([s, p]) => `<div class="toc-row"><span><strong>${s}</strong></span><span class="toc-dots"></span><span style="color:var(--color-text-soft);">${p}</span></div>`).join('')}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ EDITORIAL NARRATIVO -->
<div class="page">
  <div class="editorial-header">
    <h2>EDITORIAL</h2>
    <div class="sub">A história do casamento de ${nomeCasal}</div>
  </div>
  <div class="editorial-columns">
    ${renderTextoEditorial(secoesNormais)}
  </div>
  ${(imgDetalhes && imgDetalhes[0]) ? `
    <div class="editorial-image-inline" style="margin-top:5mm;">
      <img src="${imgDetalhes[0]}" alt="detalhes"/>
    </div>
  ` : ''}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

${(imgDetalhes && imgDetalhes[1]) ? `
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
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<!-- ═══════════════════════════════════════════════════ IDENTIDADE VISUAL — O ESPETÁCULO -->
<div class="page idv-page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDecoracaoPerfil(perfil, corPrimaria, 160)}</div>
  <div class="section-title" style="text-align:center;border:none;">Identidade Visual</div>
  
  <div class="idv-monogram-repeat">${svgMonogramaPorPerfil(inicial1, inicial2, perfil, corPrimaria, 80)}</div>
  <div class="idv-monogram-main">${svgMonogramaPorPerfil(inicial1, inicial2, perfil, corPrimaria, 180)}</div>
  <div class="idv-monogram-repeat">${svgMonogramaPorPerfil(inicial1, inicial2, perfil, corPrimaria, 80)}</div>
  
  <div style="font-family:var(--font-display);font-size:14pt;color:var(--color-primary);margin:3mm 0;">
    Estilo: <strong>${capitalizarNome(estilo)}</strong> &mdash; Perfil: <strong>${capitalizarNome(perfil)}</strong>
  </div>
  
  <div class="idv-swatches">
    ${paleta.map((cor, i) => `
      <div class="idv-swatch">
        <div class="idv-swatch-box" style="background:${cor};"></div>
        <div class="idv-swatch-name">${getNomeCor(cor)}</div>
        <div class="idv-swatch-hex">${cor.toUpperCase()}</div>
      </div>
    `).join('')}
  </div>
  
  <div class="idv-typo-sample">
    ABCĆČÇĎĐ &mdash; abcćčçďđ<br/>
    0123456789 &mdash; !?@#$%
  </div>
  <div class="idv-typo-body">
    <strong>Display:</strong> ${fonteDisplay} &mdash; <strong>Corpo:</strong> ${fonteCorpo}<br/>
    A tipografia foi escolhida para refletir o estilo ${estilo} do casal, garantindo legibilidade
    em todos os materiais e criando uma hierarquia visual elegante.
  </div>
  
  <div class="idv-elemento">
    ${svgDecoracaoPerfil(perfil, corPrimaria, 200)}
  </div>
  
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ SEÇÕES TEMÁTICAS (dinâmicas) -->
${paginasTematicas}

<!-- ═══════════════════════════════════════════════════ LINHA DO TEMPO -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Linha do Tempo</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:5mm;">O planejamento exige organização. Aqui está o cronograma ideal para ${nomeCasal}.</p>
  
  <div class="timeline-connector">
    <div class="timeline-connector-line"></div>
  </div>
  
  <div class="timeline-horizontal">
    ${[
      {meses:'12-8 meses',cor:'#4CAF50',tarefas:['Definir data e reservar local','Contratar cerimonialista','Iniciar lista de convidados','Definir estilo e paleta']},
      {meses:'7-4 meses',cor:'#FFC107',tarefas:['Fechar buffet e bebidas','Contratar fotógrafo e vídeo','Provar vestido e traje','Definir decoração e flores']},
      {meses:'3-1 mês',cor:'#FF9800',tarefas:['Enviar convites','Confirmar presenças','Ajustar detalhes decorativos','Prova de cabelo e maquiagem']},
      {meses:'Última semana',cor:'#F44336',tarefas:['Ensaio geral','Confirmar fornecedores','Separar itens do dia','Descansar e se hidratar']},
    ].map((item,i)=>`
      <div class="timeline-card" style="background:${item.cor}11;border-top:2.5pt solid ${item.cor};">
        <h4 style="color:${item.cor};">${item.meses}</h4>
        ${item.tarefas.map(t=>`<p>&bull; ${t}</p>`).join('')}
      </div>
    `).join('')}
  </div>
  
  <div style="display:flex;gap:6mm;margin-top:5mm;flex-wrap:wrap;justify-content:center;">
    ${[{c:'#4CAF50',l:'Tranquilo'},{c:'#FFC107',l:'Atenção'},{c:'#FF9800',l:'Urgente'},{c:'#F44336',l:'Crítico'}].map(x=>`
      <div style="display:flex;align-items:center;gap:2mm;">
        <div style="width:3mm;height:3mm;background:${x.c};border-radius:1px;"></div>
        <span style="font-size:9pt;">${x.l}</span>
      </div>
    `).join('')}
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CALENDÁRIO MENSAL -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Calendário Mensal</div>
  <div class="calendario-grid">
    ${[
      ['Mês 12','Definir data, reservar local, contratar cerimonialista'],
      ['Mês 11','Lista de convidados, definir estilo e paleta'],
      ['Mês 10','Save the date, procurar vestido e traje'],
      ['Mês 9','Contratar fotógrafo e vídeo, definir buffet'],
      ['Mês 8','Provar vestido, definir decoração e flores'],
      ['Mês 7','Contratar música/entretenimento, definir papelaria'],
      ['Mês 6','Degustação do buffet, prova de cabelo/maquiagem'],
      ['Mês 5','Definir bolo e doces, contratar transporte'],
      ['Mês 4','Enviar convites, confirmar fornecedores'],
      ['Mês 3','Ajustes finais de decoração, prova de vestido'],
      ['Mês 2','Confirmar presenças, reunião com cerimonialista'],
      ['Mês 1','Ensaio geral, separar itens do dia, relaxar'],
    ].map(([m,t])=>`
      <div class="calendario-mes">
        <h5>${m}</h5>
        <p>${t}</p>
      </div>
    `).join('')}
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CHECKLIST -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Checklist de Decisões</div>
  <table class="data-table checklist-clean">
    <tr><th>Decisão Pendente</th><th style="width:25mm;">Prazo</th><th style="width:10mm;"></th><th>Anotações</th></tr>
    ${checklist.slice(0,12).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.prazo}</td>
        <td style="text-align:center;"><span class="check-icon"></span></td>
        <td style="border-bottom:0.5pt dashed #D4CFC9;height:5mm;"></td>
      </tr>
    `).join('')}
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

${checklist.length > 12 ? `
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Checklist &mdash; Continuação</div>
  <table class="data-table checklist-clean">
    <tr><th>Decisão Pendente</th><th style="width:25mm;">Prazo</th><th style="width:10mm;"></th><th>Anotações</th></tr>
    ${checklist.slice(12).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.prazo}</td>
        <td style="text-align:center;"><span class="check-icon"></span></td>
        <td style="border-bottom:0.5pt dashed #D4CFC9;height:5mm;"></td>
      </tr>
    `).join('')}
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

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
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

${fornecedores.length > 14 ? `
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores &mdash; Continuação</div>
  <table class="data-table">
    <tr><th style="width:25mm;">Categoria</th><th>Nome</th><th style="width:22mm;">Telefone</th><th style="width:30mm;">E-mail</th><th style="width:15mm;">Status</th></tr>
    ${fornecedores.slice(14).map(f=>`
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
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores &mdash; Anotações de Valor e Prazo</div>
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
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO (páginas juntas) -->
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
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

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
    <p><span style="color:#10B981;font-weight:bold;font-size:11pt;margin-right:4px;">í</span><strong>Dica:</strong> reserve 10% do orçamento para imprevistos. Negocie pacotes completos com fornecedores para obter melhores condições.</p>
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ DICAS REGIONAIS -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Dicas Regionais</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:5mm;">Informações específicas para <strong>${localCompleto}</strong>.</p>
  
  <div class="section-subtitle">Clima Local</div>
  <div class="dicas-clima-box">
    <p style="font-size:10pt;line-height:1.6;">${dicasRegionais.clima}</p>
  </div>
  
  <div class="section-subtitle">Cuidados Especiais</div>
  ${dicasRegionais.cuidados.map(c=>`<p style="font-size:10pt;line-height:1.6;margin-bottom:2px;margin-left:3mm;">&bull; ${c}</p>`).join('')}
  
  <div class="section-subtitle" style="margin-top:5mm;">Melhores Épocas</div>
  <div style="margin:2mm 0;">
    ${dicasRegionais.melhoresEpocas.map(e=>`<span class="epoca-badge">${e}</span>`).join('')}
  </div>
  
  <div class="section-subtitle" style="margin-top:5mm;">Fornecedores Locais Recomendados</div>
  <p style="font-size:9.5pt;line-height:1.6;color:var(--color-text-soft);margin-left:3mm;">
    Consulte a lista de fornecedores verificados em ${cidade || 'sua região'}. 
    Prefira profissionais com experiência em casamentos no estilo ${estilo}.
  </p>
  
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
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
  <div style="margin-top:6mm;font-size:14pt;">${logoHtml}</div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span class="page-number"></span>
  </div>
</div>

</body>
</html>
  `;

  return html;
}