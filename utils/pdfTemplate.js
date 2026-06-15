// utils/pdfTemplate.js — Memorial descomplicaí v5 (Reescrito do Zero)
// Princípio: impacto visual, coerência de branding, zero vazamento de conteúdo.

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

function filtrarHexDoTexto(texto) {
  if (!texto || typeof texto !== 'string') return texto;
  return texto.replace(/#[0-9A-Fa-f]{3,8}\b/g, '').replace(/\s{2,}/g, ' ').trim();
}

function sanitizarValor(val) {
  if (val === true || val === 'true') return 'Sim';
  if (val === false || val === 'false') return 'Não';
  if (val === null || val === undefined) return '';
  return String(val);
}

/* ═══════════════════════════════════════════════════════════
   FONTES BASE64
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
   IMAGENS BASE64
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
    try { if (fs.existsSync(principal)) { const buf = fs.readFileSync(principal); resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`); } }
    catch (e) { console.warn('Img principal falhou:', categoria, chaveStr, e.message); }
  }
  if (resultado.length === 0) {
    const fallback = getImagem(categoria, 'default');
    if (fallback) {
      try { if (fs.existsSync(fallback)) { const buf = fs.readFileSync(fallback); resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`); } }
      catch (e) {}
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
      try { if (fs.existsSync(candidato)) { const buf = fs.readFileSync(candidato); resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`); } }
      catch (e) {}
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
      try { if (fs.existsSync(candidato)) { const buf = fs.readFileSync(candidato); resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`); } }
      catch (e) {}
    }
  }
  return resultado;
}

/* ═══════════════════════════════════════════════════════════
   LOGO DESCOMPLECAÍ — SVG inline (garantia de renderização)
   ═══════════════════════════════════════════════════════════ */
function logoSVG(corDescomplica = '#8B6F5E', corI = '#10B981', height = 24) {
  // SVG inline com font-family fallback. Se as fontes não carregarem, o texto ainda aparece.
  return `<svg xmlns="http://www.w3.org/2000/svg" height="${height}" viewBox="0 0 260 36" style="display:inline-block;vertical-align:middle;">
    <text x="0" y="26" font-family="'DM Sans', 'Helvetica Neue', Arial, sans-serif" font-weight="300" font-size="28" fill="${corDescomplica}">descomplica</text>
    <text x="186" y="26" font-family="'Space Mono', 'Courier New', monospace" font-weight="400" font-style="italic" font-size="30" fill="${corI}">í</text>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   MONOGRAMAS POR PERFIL — criativos e impactantes
   ═══════════════════════════════════════════════════════════ */
function svgMonogramaPorPerfil(inicial1, inicial2, perfil, cor, tamanho = 160) {
  const i1 = String(inicial1 || 'N').charAt(0).toUpperCase();
  const i2 = String(inicial2 || 'N').charAt(0).toUpperCase();
  const c = String(cor || '#1A1714');
  const p = String(perfil || 'minimalista').toLowerCase();
  const s = tamanho;
  const hs = s / 2;

  if (p === 'classico') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${s*0.08}" y="${s*0.08}" width="${s*0.84}" height="${s*0.84}" fill="none" stroke="${c}" stroke-width="${s*0.012}" opacity="0.25"/>
      <rect x="${s*0.15}" y="${s*0.15}" width="${s*0.70}" height="${s*0.70}" fill="none" stroke="${c}" stroke-width="${s*0.006}" opacity="0.15"/>
      <text x="${hs}" y="${s*0.58}" text-anchor="middle" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="${s*0.38}" fill="${c}" letter-spacing="${s*0.01}">${i1}<tspan font-size="${s*0.22}" dy="${-s*0.04}">&</tspan>${i2}</text>
      <line x1="${s*0.22}" y1="${s*0.72}" x2="${s*0.78}" y2="${s*0.72}" stroke="${c}" stroke-width="${s*0.008}" opacity="0.4"/>
      <line x1="${s*0.28}" y1="${s*0.76}" x2="${s*0.72}" y2="${s*0.76}" stroke="${c}" stroke-width="${s*0.004}" opacity="0.25"/>
    </svg>`;
  }
  if (p === 'boho') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${hs}" cy="${hs}" r="${s*0.42}" fill="none" stroke="${c}" stroke-width="${s*0.01}" opacity="0.2" stroke-dasharray="${s*0.06} ${s*0.04}"/>
      <path d="M${s*0.15},${s*0.82} Q${s*0.30},${s*0.65} ${s*0.45},${s*0.78} Q${s*0.60},${s*0.62} ${s*0.75},${s*0.80} Q${s*0.88},${s*0.70} ${s*0.92},${s*0.82}" fill="none" stroke="${c}" stroke-width="${s*0.008}" opacity="0.35"/>
      <path d="M${s*0.20},${s*0.86} Q${s*0.35},${s*0.72} ${s*0.50},${s*0.84} Q${s*0.65},${s*0.70} ${s*0.80},${s*0.86}" fill="none" stroke="${c}" stroke-width="${s*0.005}" opacity="0.25"/>
      <text x="${hs}" y="${s*0.56}" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="${s*0.34}" fill="${c}" letter-spacing="${s*0.008}">${i1}<tspan font-size="${s*0.20}" dy="${-s*0.03}">&</tspan>${i2}</text>
      <circle cx="${s*0.30}" cy="${s*0.75}" r="${s*0.018}" fill="${c}" opacity="0.3"/>
      <circle cx="${s*0.70}" cy="${s*0.78}" r="${s*0.014}" fill="${c}" opacity="0.25"/>
    </svg>`;
  }
  if (p === 'moderno') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${s*0.12}" y="${s*0.12}" width="${s*0.76}" height="${s*0.76}" fill="none" stroke="${c}" stroke-width="${s*0.015}" opacity="0.35"/>
      <rect x="${s*0.22}" y="${s*0.22}" width="${s*0.56}" height="${s*0.56}" fill="none" stroke="${c}" stroke-width="${s*0.008}" opacity="0.2"/>
      <line x1="${s*0.12}" y1="${hs}" x2="${s*0.88}" y2="${hs}" stroke="${c}" stroke-width="${s*0.006}" opacity="0.15"/>
      <line x1="${hs}" y1="${s*0.12}" x2="${hs}" y2="${s*0.88}" stroke="${c}" stroke-width="${s*0.006}" opacity="0.15"/>
      <text x="${hs}" y="${s*0.58}" text-anchor="middle" font-family="DisplayFont, 'Helvetica Neue', Arial, sans-serif" font-size="${s*0.32}" fill="${c}" font-weight="bold" letter-spacing="${s*0.02}">${i1} / ${i2}</text>
    </svg>`;
  }
  if (p === 'rustico') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${hs}" cy="${hs}" r="${s*0.40}" fill="none" stroke="${c}" stroke-width="${s*0.014}" opacity="0.25"/>
      <text x="${hs}" y="${s*0.56}" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="${s*0.34}" fill="${c}" letter-spacing="${s*0.01}">${i1} + ${i2}</text>
      <path d="M${s*0.12},${s*0.78} Q${s*0.30},${s*0.62} ${s*0.50},${s*0.76} Q${s*0.70},${s*0.60} ${s*0.88},${s*0.78}" fill="none" stroke="${c}" stroke-width="${s*0.01}" opacity="0.3"/>
      <path d="M${s*0.18},${s*0.84} Q${s*0.35},${s*0.70} ${s*0.50},${s*0.82} Q${s*0.65},${s*0.68} ${s*0.82},${s*0.84}" fill="none" stroke="${c}" stroke-width="${s*0.006}" opacity="0.2"/>
      <circle cx="${s*0.28}" cy="${s*0.70}" r="${s*0.016}" fill="${c}" opacity="0.25"/>
      <circle cx="${s*0.72}" cy="${s*0.68}" r="${s*0.012}" fill="${c}" opacity="0.2"/>
    </svg>`;
  }
  if (p === 'romantico') {
    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${hs},${s*0.18} C${hs-s*0.10},${s*0.06} ${hs-s*0.22},${s*0.14} ${hs-s*0.22},${s*0.26} C${hs-s*0.22},${s*0.38} ${hs},${s*0.52} ${hs},${s*0.52} C${hs},${s*0.52} ${hs+s*0.22},${s*0.38} ${hs+s*0.22},${s*0.26} C${hs+s*0.22},${s*0.14} ${hs+s*0.10},${s*0.06} ${hs},${s*0.18}" fill="none" stroke="${c}" stroke-width="${s*0.012}" opacity="0.3"/>
      <text x="${hs}" y="${s*0.68}" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="${s*0.30}" fill="${c}" letter-spacing="${s*0.008}">${i1} & ${i2}</text>
      <path d="M${s*0.10},${s*0.82} Q${s*0.35},${s*0.72} ${hs},${s*0.82} Q${s*0.65},${s*0.72} ${s*0.90},${s*0.82}" fill="none" stroke="${c}" stroke-width="${s*0.006}" opacity="0.25"/>
    </svg>`;
  }
  // Minimalista fallback
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${s*0.10}" y1="${hs}" x2="${s*0.90}" y2="${hs}" stroke="${c}" stroke-width="${s*0.01}" opacity="0.4"/>
    <text x="${hs}" y="${s*0.54}" text-anchor="middle" font-family="DisplayFont, Georgia, serif" font-size="${s*0.36}" fill="${c}" letter-spacing="${s*0.015}">${i1} & ${i2}</text>
    <line x1="${s*0.10}" y1="${s*0.56}" x2="${s*0.90}" y2="${s*0.56}" stroke="${c}" stroke-width="${s*0.005}" opacity="0.2"/>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   ELEMENTO GRÁFICO REAL DO PERFIL — arabesco/folha/geometria/flor
   ═══════════════════════════════════════════════════════════ */
function svgElementoGrafico(perfil, cor, largura = 200, altura = 60) {
  const p = String(perfil || 'minimalista').toLowerCase();
  const c = String(cor || '#1A1714');
  const w = largura;
  const h = altura;
  if (p === 'classico') {
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,${h*0.55} Q${w*0.20},${h*0.15} ${w*0.35},${h*0.45} Q${w*0.50},${h*0.10} ${w*0.65},${h*0.45} Q${w*0.80},${h*0.15} ${w},${h*0.55}" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.45"/>
      <path d="M${w*0.08},${h*0.65} Q${w*0.25},${h*0.30} ${w*0.40},${h*0.55} Q${w*0.55},${h*0.25} ${w*0.70},${h*0.55} Q${w*0.85},${h*0.30} ${w*0.92},${h*0.65}" fill="none" stroke="${c}" stroke-width="1" opacity="0.3"/>
      <circle cx="${w*0.35}" cy="${h*0.35}" r="3" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.35"/>
      <circle cx="${w*0.65}" cy="${h*0.32}" r="2.5" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.3"/>
    </svg>`;
  }
  if (p === 'boho') {
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${w*0.05},${h*0.70} C${w*0.15},${h*0.20} ${w*0.25},${h*0.60} ${w*0.35},${h*0.30} C${w*0.45},${h*0.55} ${w*0.55},${h*0.15} ${w*0.65},${h*0.50} C${w*0.75},${h*0.25} ${w*0.85},${h*0.65} ${w*0.95},${h*0.35}" fill="none" stroke="${c}" stroke-width="1.4" opacity="0.4"/>
      <path d="M${w*0.10},${h*0.80} C${w*0.20},${h*0.40} ${w*0.30},${h*0.75} ${w*0.40},${h*0.45} C${w*0.50},${h*0.70} ${w*0.60},${h*0.35} ${w*0.70},${h*0.65} C${w*0.80},${h*0.40} ${w*0.90},${h*0.75} ${w*0.95},${h*0.50}" fill="none" stroke="${c}" stroke-width="1" opacity="0.25"/>
      <circle cx="${w*0.35}" cy="${h*0.28}" r="2" fill="${c}" opacity="0.25"/>
      <circle cx="${w*0.65}" cy="${h*0.45}" r="2" fill="${c}" opacity="0.25"/>
    </svg>`;
  }
  if (p === 'moderno') {
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${w*0.08}" y="${h*0.25}" width="${w*0.18}" height="${h*0.35}" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.4"/>
      <rect x="${w*0.32}" y="${h*0.18}" width="${w*0.28}" height="${h*0.50}" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.4"/>
      <rect x="${w*0.66}" y="${h*0.25}" width="${w*0.26}" height="${h*0.35}" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.4"/>
      <line x1="0" y1="${h*0.82}" x2="${w}" y2="${h*0.82}" stroke="${c}" stroke-width="2" opacity="0.5"/>
    </svg>`;
  }
  if (p === 'rustico') {
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${w*0.04},${h*0.65} Q${w*0.18},${h*0.25} ${w*0.32},${h*0.55} Q${w*0.46},${h*0.20} ${w*0.60},${h*0.55} Q${w*0.74},${h*0.25} ${w*0.88},${h*0.60} Q${w*0.96},${h*0.40} ${w*0.98},${h*0.70}" fill="none" stroke="${c}" stroke-width="1.6" opacity="0.4"/>
      <path d="M${w*0.12},${h*0.78} Q${w*0.24},${h*0.40} ${w*0.38},${h*0.68} Q${w*0.52},${h*0.35} ${w*0.66},${h*0.68} Q${w*0.80},${h*0.40} ${w*0.92},${h*0.75}" fill="none" stroke="${c}" stroke-width="1" opacity="0.25"/>
      <circle cx="${w*0.32}" cy="${h*0.38}" r="2.5" fill="${c}" opacity="0.2"/>
      <circle cx="${w*0.66}" cy="${h*0.42}" r="2" fill="${c}" opacity="0.2"/>
    </svg>`;
  }
  if (p === 'romantico') {
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${w*0.48},${h*0.15} C${w*0.38},${h*0.02} ${w*0.28},${h*0.10} ${w*0.28},${h*0.22} C${w*0.28},${h*0.34} ${w*0.48},${h*0.48} ${w*0.48},${h*0.48} C${w*0.48},${h*0.48} ${w*0.68},${h*0.34} ${w*0.68},${h*0.22} C${w*0.68},${h*0.10} ${w*0.58},${h*0.02} ${w*0.48},${h*0.15}" fill="none" stroke="${c}" stroke-width="1.3" opacity="0.35"/>
      <path d="M0,${h*0.72} Q${w*0.30},${h*0.55} ${w*0.48},${h*0.72} Q${w*0.66},${h*0.55} ${w},${h*0.72}" fill="none" stroke="${c}" stroke-width="0.9" opacity="0.3"/>
      <path d="M${w*0.15},${h*0.82} Q${w*0.35},${h*0.68} ${w*0.48},${h*0.82} Q${w*0.61},${h*0.68} ${w*0.85},${h*0.82}" fill="none" stroke="${c}" stroke-width="0.7" opacity="0.2"/>
    </svg>`;
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${w*0.20}" y1="${h*0.50}" x2="${w*0.80}" y2="${h*0.50}" stroke="${c}" stroke-width="1.2" opacity="0.5"/>
  </svg>`;
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
   CARD TÉCNICO — dados do questionário formatados elegantemente
   ═══════════════════════════════════════════════════════════ */
function cardTecnico(tituloSecao, dados) {
  const campos = [];
  const add = (label, val) => {
    const v = sanitizarValor(val);
    if (v && v !== 'a definir' && v !== 'Não' && v !== '') campos.push(`<span style="display:inline-block;margin-right:10px;margin-bottom:3px;"><strong style="color:var(--color-primary);">${label}:</strong> <span style="color:var(--color-text);">${v}</span></span>`);
  };

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
  return `<div class="info-box" style="margin-top:4mm;">
    <p style="font-size:9pt;line-height:1.5;margin-bottom:3px;color:var(--color-primary);"><strong>Dados do questionário</strong></p>
    <p style="font-size:9pt;line-height:1.5;">${campos.join('')}</p>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   MINI CHECKLIST — checkbox real ☑, não o í da logo
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
  const corCheck = '#10B981';
  return `<div style="margin-top:4mm;padding:3mm;background:${dados?.paleta?.[2] || '#F9F7F4'}22;border-radius:3px;">
    <p style="font-size:9pt;color:var(--color-primary);margin-bottom:3px;"><strong>Mini-checklist</strong></p>
    ${items.map(i => `<div style="font-size:8.5pt;line-height:1.6;display:flex;align-items:center;gap:2mm;margin-bottom:1.5mm;">
      <span style="display:inline-block;width:3mm;height:3mm;border:0.8pt solid ${corCheck};border-radius:1px;flex-shrink:0;position:relative;top:0.5mm;"></span>
      <span>${i}</span>
    </div>`).join('')}
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
   GRÁFICO PIZZA SVG
   ═══════════════════════════════════════════════════════════ */
function gerarSvgPizza(itens, size = 220) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 16;
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
      <div style="display:flex;align-items:center;margin-bottom:5px;gap:6px;">
        <div style="width:12px;height:12px;background:${cor};border-radius:2px;flex-shrink:0;"></div>
        <span style="font-family:var(--font-body);font-size:9.5px;color:var(--color-text);">${item.item} <strong>(${item.percentual}%)</strong></span>
      </div>
    `;
    startAngle = endAngle;
  });

  return { svg: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;">${paths}</svg>`, legend: legendHtml };
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
  // Drop-cap ajustado para 3 linhas de altura
  html += `<p class="editorial-dropcap" style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;text-align:justify;">${primeiro}</p>`;
  for (const par of resto) {
    html += `<p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;text-align:justify;">${par}</p>`;
  }
  return html;
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
  const svgDeco = svgElementoGrafico(perfil, corPrimaria, 200, 50);
  const svgDecoLarge = svgElementoGrafico(perfil, corContraste, 280, 70);
  const svgMono = svgMonogramaPorPerfil(inicial1, inicial2, perfil, corContraste, 160);
  const svgMonoLarge = svgMonogramaPorPerfil(inicial1, inicial2, perfil, corContraste, 220);
  const logoSvg = logoSVG('#8B6F5E', '#10B981', 22);
  const logoSvgSmall = logoSVG('#8B6F5E', '#10B981', 16);

  const secoesTematicas = [
    { titulo: 'Identidade Visual', imagens: imgDecoracao, layout: 'hero' },
    { titulo: 'Cerimônia', imagens: imgCerimonia, layout: 'side' },
    { titulo: 'Decoração', imagens: imgFlores.length ? imgFlores : imgDecoracao, layout: 'grid' },
    { titulo: 'Mesa Posta', imagens: imgMesa, layout: 'overlay' },
    { titulo: 'Alimentação e Bebidas', imagens: imgAlimentacao, layout: 'hero' },
    { titulo: 'Entretenimento', imagens: imgEntretenimento, layout: 'side' },
    { titulo: 'Vestuário e Beleza', imagens: imgVestido.length ? imgVestido : imgBeleza, layout: 'grid' },
    { titulo: 'Papelaria e Identidade', imagens: imgPapelaria, layout: 'overlay' },
  ];

  const renderPaginaSecao = (titulo, secao, imagens, layout) => {
    const textoInedito = gerarTextoIneditoSecao(titulo, dadosEvento);
    let corpo = '';

    if (layout === 'hero') {
      const imgHero = (imagens && imagens[0]) ? `<img src="${imagens[0]}" style="width:100%;height:90mm;object-fit:cover;border-radius:4px;display:block;margin-bottom:5mm;"/>` : '';
      corpo = `
        ${imgHero}
        <div style="font-size:10.5pt;line-height:1.7;text-align:justify;">
          <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p>
        </div>
      `;
    } else if (layout === 'side') {
      const imgLat = (imagens && imagens[0]) ? `<img src="${imagens[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;display:block;"/>` : '';
      corpo = `
        <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:5mm;align-items:start;height:calc(100% - 20mm);">
          <div style="font-size:10.5pt;line-height:1.7;text-align:justify;">
            <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p>
          </div>
          <div style="height:100%;min-height:80mm;">${imgLat}</div>
        </div>
      `;
    } else if (layout === 'grid') {
      const imgs = (imagens || []).slice(0, 4).map((imgSrc) => imgSrc ? `<img src="${imgSrc}" style="width:100%;height:55mm;object-fit:cover;border-radius:4px;display:block;"/>` : '').join('');
      corpo = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:4mm;">
          ${imgs}
        </div>
        <div style="font-size:10.5pt;line-height:1.7;text-align:justify;">
          <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p>
        </div>
      `;
    } else {
      const imgBack = (imagens && imagens[0]) ? `background-image:url(${imagens[0]});background-size:cover;background-position:center;` : '';
      corpo = `
        <div style="position:relative;border-radius:4px;overflow:hidden;min-height:120mm;${imgBack}">
          <div style="background:rgba(249,247,244,0.90);padding:5mm;position:absolute;bottom:0;left:0;right:0;">
            <div style="font-size:10.5pt;line-height:1.7;text-align:justify;">
              <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p>
            </div>
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
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>`;
  };

  let paginasTematicas = '';
  secoesTematicas.forEach((sec) => {
    paginasTematicas += renderPaginaSecao(sec.titulo, getSecao(sec.titulo), sec.imagens, sec.layout);
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
    --font-display: 'DisplayFont', Georgia, 'Times New Roman', serif;
    --font-body: 'BodyFont', Helvetica, Arial, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  @page landscape { size: A4 landscape; margin: 0; }
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

  .page-landscape {
    width: 297mm;
    min-height: 210mm;
    padding: 14mm 18mm 18mm 18mm;
    position: relative;
    page-break-after: always;
    overflow: visible;
    counter-increment: pagina;
    page: landscape;
  }
  .page-landscape:last-child { page-break-after: auto; }

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

  /* ═══ CAPA ═══ */
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
    background: linear-gradient(to bottom, rgba(26,23,20,0.40) 0%, rgba(26,23,20,0.75) 100%);
    z-index: 1;
  }
  .cover-content {
    position: relative;
    z-index: 2;
    color: ${corContraste};
    width: 100%;
    max-width: 170mm;
  }
  .cover-monogram { margin-bottom: 6mm; }
  .cover-monogram svg { display: block; margin: 0 auto; }
  .cover-title {
    font-family: var(--font-display);
    font-size: 46pt;
    margin-bottom: 3mm;
    letter-spacing: 1px;
    line-height: 1.05;
    font-weight: bold;
  }
  .cover-subtitle {
    font-family: var(--font-body);
    font-size: 11pt;
    letter-spacing: 6px;
    text-transform: uppercase;
    margin-bottom: 8mm;
    opacity: 0.95;
  }
  .cover-local {
    font-family: var(--font-body);
    font-size: 13pt;
    margin-bottom: 2mm;
    opacity: 0.9;
  }
  .cover-date {
    font-family: var(--font-body);
    font-size: 12pt;
    margin-bottom: 8mm;
    opacity: 0.85;
  }
  .cover-palette {
    display: flex;
    gap: 8mm;
    justify-content: center;
    margin-top: 6mm;
  }
  .palette-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .palette-circle {
    width: 12mm;
    height: 12mm;
    border-radius: 50%;
    border: 2pt solid ${corContraste};
    margin-bottom: 2mm;
  }
  .palette-name { font-size: 8.5pt; font-family: var(--font-body); font-weight: 500; }
  .palette-role { font-size: 7.5pt; opacity: 0.8; font-family: var(--font-body); }
  .cover-deco {
    position: absolute;
    bottom: 22mm;
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

  /* ═══ ÍNDICE ═══ */
  .toc-intro {
    font-size: 11pt;
    line-height: 1.7;
    margin-bottom: 6mm;
    font-style: italic;
    color: var(--color-text-soft);
    text-align: center;
  }
  .toc-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2.5mm 0;
    font-size: 10.5pt;
    line-height: 1.4;
  }
  .toc-row strong { color: var(--color-primary); }
  .toc-dots {
    flex: 1;
    border-bottom: 1pt dotted #C8BFB4;
    margin: 0 3mm 1.5mm 3mm;
    min-width: 10mm;
  }

  /* ═══ EDITORIAL ═══ */
  .editorial-header {
    text-align: center;
    margin-bottom: 8mm;
  }
  .editorial-header h2 {
    font-family: var(--font-display);
    font-size: 28pt;
    color: var(--color-primary);
    margin-bottom: 2mm;
  }
  .editorial-header .sub {
    font-size: 10pt;
    color: var(--color-text-soft);
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .editorial-body {
    column-count: 2;
    column-gap: 6mm;
    column-rule: 0.5pt solid #E5E0D9;
  }
  .editorial-body p {
    font-family: var(--font-body);
    font-size: 10.5pt;
    line-height: 1.7;
    color: var(--color-text);
    margin-bottom: 8px;
    text-align: justify;
  }
  .editorial-dropcap::first-letter {
    font-family: var(--font-display);
    font-size: 3.4em;
    float: left;
    line-height: 0.82;
    margin-right: 0.06em;
    margin-top: 0.04em;
    color: var(--color-primary);
    font-weight: bold;
  }
  .editorial-image-inline {
    break-inside: avoid;
    margin: 5mm 0;
  }
  .editorial-image-inline img {
    width: 100%;
    max-height: 70mm;
    object-fit: cover;
    border-radius: 4px;
    display: block;
  }

  /* ═══ IDENTIDADE VISUAL ═══ */
  .idv-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
  }
  .idv-monogram-main { margin: 2mm 0 5mm 0; }
  .idv-swatches {
    display: flex;
    gap: 10mm;
    justify-content: center;
    margin: 4mm 0 6mm 0;
  }
  .idv-swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .idv-swatch-box {
    width: 18mm;
    height: 18mm;
    border-radius: 3px;
    margin-bottom: 2mm;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .idv-swatch-name { font-size: 9pt; font-family: var(--font-body); font-weight: 500; }
  .idv-swatch-role { font-size: 7.5pt; font-family: var(--font-body); color: var(--color-text-soft); margin-top: 1px; }
  .idv-typo-sample {
    font-family: var(--font-display);
    font-size: 20pt;
    margin: 4mm 0;
    line-height: 1.4;
    color: var(--color-primary);
  }
  .idv-typo-body {
    font-family: var(--font-body);
    font-size: 10pt;
    line-height: 1.6;
    max-width: 140mm;
    margin: 0 auto 4mm auto;
    text-align: center;
  }
  .idv-explanation {
    font-family: var(--font-body);
    font-size: 10pt;
    line-height: 1.7;
    max-width: 150mm;
    margin: 3mm auto 4mm auto;
    text-align: justify;
    color: var(--color-text);
  }
  .idv-elemento { margin: 4mm 0; }

  /* ═══ SEÇÕES TEMÁTICAS ═══ */
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
    background: ${corSecundaria}18;
    border-left: 2.5pt solid var(--color-primary);
    padding: 3mm;
    margin: 3mm 0;
    border-radius: 3px;
    page-break-inside: avoid;
  }
  .info-box p {
    font-size: 9.5pt;
    line-height: 1.6;
    margin-bottom: 2px;
  }

  /* ═══ TABELAS ═══ */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 3mm;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  .data-table th {
    text-align: left;
    padding: 2mm 2.5mm;
    border-bottom: 1pt solid var(--color-primary);
    background: ${corSecundaria}22;
    font-family: var(--font-body);
    font-weight: 600;
    color: var(--color-primary);
    font-size: 8.5pt;
  }
  .data-table td {
    padding: 1.8mm 2.5mm;
    border-bottom: 0.4pt solid #E5E0D9;
    font-family: var(--font-body);
    vertical-align: top;
    font-size: 9pt;
  }
  .data-table tr { page-break-inside: avoid; }

  /* ═══ LINHA DO TEMPO (LANDSCAPE) ═══ */
  .timeline-landscape {
    display: flex;
    gap: 5mm;
    margin-top: 4mm;
    align-items: stretch;
  }
  .timeline-card {
    flex: 1;
    min-width: 0;
    border-radius: 4px;
    padding: 4mm;
    page-break-inside: avoid;
    position: relative;
    background: #fff;
    border: 0.5pt solid #E5E0D9;
  }
  .timeline-card h4 {
    font-family: var(--font-display);
    font-size: 11pt;
    margin-bottom: 2mm;
    color: var(--color-primary);
  }
  .timeline-card p {
    font-size: 9pt;
    line-height: 1.5;
    margin-bottom: 1px;
    color: var(--color-text);
  }
  .timeline-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4mm 0;
  }
  .timeline-connector-line {
    width: 100%;
    height: 2.5pt;
    background: linear-gradient(to right, #4CAF50, #FFC107, #FF9800, #F44336);
    border-radius: 1.5pt;
  }

  /* ═══ CALENDÁRIO (LANDSCAPE) ═══ */
  .calendario-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3mm;
    margin-top: 4mm;
  }
  .calendario-mes {
    border: 0.5pt solid #E5E0D9;
    border-radius: 3px;
    padding: 3mm;
    page-break-inside: avoid;
    background: #fff;
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
    color: var(--color-text);
  }

  /* ═══ ORÇAMENTO (LANDSCAPE) ═══ */
  .budget-landscape {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6mm;
    align-items: start;
    margin-bottom: 4mm;
  }
  .budget-chart svg { display: block; }

  /* ═══ FORNECEDORES (LANDSCAPE) ═══ */
  .fornecedores-table th { font-size: 9pt; padding: 2.5mm; }
  .fornecedores-table td { font-size: 9pt; padding: 2mm 2.5mm; }

  /* ═══ CHECKLIST ═══ */
  .checklist-clean td { border-bottom: 0.5pt solid #E5E0D9; }
  .checklist-clean th { border-bottom: 1pt solid var(--color-primary); background: transparent; }
  .checklist-clean { border: none; }
  .checklist-clean tr:first-child th { border-top: 1pt solid var(--color-primary); }
  .check-icon {
    display: inline-block;
    width: 3.5mm;
    height: 3.5mm;
    border: 0.8pt solid var(--color-primary);
    border-radius: 1px;
    position: relative;
  }
  .check-icon::after {
    content: '';
    position: absolute;
    left: 0.7mm;
    top: -0.3mm;
    width: 1.2mm;
    height: 2.2mm;
    border: solid var(--color-primary);
    border-width: 0 0.8pt 0.8pt 0;
    transform: rotate(45deg);
    opacity: 0.3;
  }

  /* ═══ DICAS REGIONAIS ═══ */
  .dicas-clima-box {
    background: ${corSecundaria}18;
    border-left: 2.5pt solid var(--color-primary);
    padding: 3mm;
    margin: 3mm 0;
    border-radius: 3px;
  }
  .epoca-badge {
    display: inline-block;
    padding: 1.2mm 2.5mm;
    border-radius: 3px;
    font-size: 8.5pt;
    margin: 1.5mm;
    background: ${corSecundaria}33;
    color: var(--color-text);
  }
  .fornecedor-local {
    display: inline-block;
    padding: 1.2mm 2.5mm;
    border-radius: 3px;
    font-size: 8.5pt;
    margin: 1.5mm;
    background: ${corPrimaria}15;
    color: var(--color-primary);
    border: 0.5pt solid ${corPrimaria}40;
  }

  /* ═══ CTA ═══ */
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

  /* Quebras de conteúdo */
  .section-title, .section-subtitle, .info-box, .timeline-card, .calendario-mes, .data-table {
    page-break-inside: avoid;
  }
  .section-title, .section-subtitle {
    page-break-after: avoid;
  }
  img {
    page-break-inside: avoid;
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════ CAPA -->
<div class="page cover">
  <div class="cover-bg" style="background-image:url(${imgCapa || ''});"></div>
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div class="cover-monogram">${svgMonoLarge}</div>
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
  <div class="cover-deco">${svgDecoLarge}</div>
  <div class="cover-footer">
    <span>${nomeCasal}</span>
    <span>${logoSvg}</span>
    <span>arxum.csstudios.site/descomplicai</span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ÍNDICE -->
<div class="page">
  <div style="text-align:center;margin-bottom:4mm;">${svgDeco}</div>
  <div class="section-title" style="font-size:18pt;text-align:center;border:none;">Bem-vindos ao seu Memorial</div>
  <p class="toc-intro">
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
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ EDITORIAL -->
<div class="page">
  <div class="editorial-header">
    <h2>EDITORIAL</h2>
    <div class="sub">A história do casamento de ${nomeCasal}</div>
  </div>
  <div class="editorial-body">
    ${renderTextoEditorial(secoesNormais)}
  </div>
  ${(imgDetalhes && imgDetalhes[0]) ? `
    <div class="editorial-image-inline" style="margin-top:5mm;">
      <img src="${imgDetalhes[0]}" alt="detalhes"/>
    </div>
  ` : ''}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- Página 4 do Editorial — estrutura coerente, sem float maluco -->
<div class="page">
  <div style="text-align:center;margin-bottom:4mm;">${svgDeco}</div>
  <div class="section-title" style="font-size:18pt;text-align:center;border:none;">A Visão do Casal</div>
  <div class="editorial-body">
    <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;text-align:justify;">
      Cada detalhe deste memorial foi pensado para refletir a personalidade única de ${nomeCasal}.
      Das cores à escolha das flores, da cerimônia à festa, tudo converge para uma experiência
      autêntica e inesquecível. O estilo ${estilo} não é apenas uma etiqueta — é a essência
      que permeia cada decisão, cada fornecedor escolhido, cada momento planejado.
    </p>
    <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;text-align:justify;">
      Use este documento como guia visual e prático durante todo o planejamento.
      Compartilhe com fornecedores, padrinhos e familiares para que todos estejam alinhados
      com a visão do casal. A consistência visual é o que transforma um evento em uma experiência imersiva.
    </p>
    <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;text-align:justify;">
      A jornada começa agora. Cada página deste memorial é um passo em direção ao dia mais especial
      de suas vidas. Organização, inspiração e praticidade — tudo em um só lugar, criado com carinho
      pelo descomplicaí.
    </p>
  </div>
  ${(imgDetalhes && imgDetalhes[1]) ? `
    <div class="editorial-image-inline" style="margin-top:5mm;">
      <img src="${imgDetalhes[1]}" alt="detalhes"/>
    </div>
  ` : ''}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ IDENTIDADE VISUAL -->
<div class="page idv-page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title" style="text-align:center;border:none;">Identidade Visual</div>

  <div class="idv-monogram-main">${svgMonogramaPorPerfil(inicial1, inicial2, perfil, corPrimaria, 180)}</div>

  <div style="font-family:var(--font-display);font-size:14pt;color:var(--color-primary);margin:3mm 0;">
    Estilo: <strong>${capitalizarNome(estilo)}</strong> &mdash; Perfil: <strong>${capitalizarNome(perfil)}</strong>
  </div>

  <div class="idv-swatches">
    ${paleta.map((cor, i) => `
      <div class="idv-swatch">
        <div class="idv-swatch-box" style="background:${cor};"></div>
        <div class="idv-swatch-name">${getNomeCor(cor)}</div>
        <div class="idv-swatch-role">${i===0?'Principal':i===1?'Secundária':'Terciária'}</div>
      </div>
    `).join('')}
  </div>

  <div class="idv-typo-sample">
    Aa Bb Cc Dd Ee Ff Gg
  </div>
  <div class="idv-typo-body">
    <strong>Display:</strong> ${fonteDisplay} &mdash; <strong>Corpo:</strong> ${fonteCorpo}
  </div>

  <div class="idv-explanation">
    A identidade visual deste casamento foi construída para ser reconhecível em todas as peças de comunicação.
    Use o monograma em selos, menus e plaquinhas. Aplique a paleta de forma hierárquica: a cor principal
    domina os elementos grandes (capa, convite), a secundária cria contraste em detalhes e bordas,
    e a terciária ilumina fundos e espaços em branco. A tipografia display deve ser usada em títulos
    e nomes; a fonte de corpo garante legibilidade em textos longos. O elemento gráfico abaixo pode
    ser repetido em cantos de página, divisórias e materiais impressos para reforçar a coesão visual.
  </div>

  <div class="idv-elemento">
    ${svgElementoGrafico(perfil, corPrimaria, 240, 70)}
  </div>

  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ SEÇÕES TEMÁTICAS -->
${paginasTematicas}

<!-- ═══════════════════════════════════════════════════ LINHA DO TEMPO (LANDSCAPE) -->
<div class="page-landscape">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Linha do Tempo</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:5mm;">O planejamento exige organização. Aqui está o cronograma ideal para ${nomeCasal}.</p>

  <div class="timeline-connector">
    <div class="timeline-connector-line"></div>
  </div>

  <div class="timeline-landscape">
    ${[
      {meses:'12-8 meses',cor:'#4CAF50',tarefas:['Definir data e reservar local','Contratar cerimonialista','Iniciar lista de convidados','Definir estilo e paleta']},
      {meses:'7-4 meses',cor:'#FFC107',tarefas:['Fechar buffet e bebidas','Contratar fotógrafo e vídeo','Provar vestido e traje','Definir decoração e flores']},
      {meses:'3-1 mês',cor:'#FF9800',tarefas:['Enviar convites','Confirmar presenças','Ajustar detalhes decorativos','Prova de cabelo e maquiagem']},
      {meses:'Última semana',cor:'#F44336',tarefas:['Ensaio geral','Confirmar fornecedores','Separar itens do dia','Descansar e se hidratar']},
    ].map((item,i)=>`
      <div class="timeline-card" style="border-top:3pt solid ${item.cor};">
        <h4 style="color:${item.cor};">${item.meses}</h4>
        ${item.tarefas.map(t=>`<p>&bull; ${t}</p>`).join('')}
      </div>
    `).join('')}
  </div>

  <div style="display:flex;gap:8mm;margin-top:6mm;flex-wrap:wrap;justify-content:center;">
    ${[{c:'#4CAF50',l:'Tranquilo'},{c:'#FFC107',l:'Atenção'},{c:'#FF9800',l:'Urgente'},{c:'#F44336',l:'Crítico'}].map(x=>`
      <div style="display:flex;align-items:center;gap:2mm;">
        <div style="width:4mm;height:4mm;background:${x.c};border-radius:2px;"></div>
        <span style="font-size:9pt;">${x.l}</span>
      </div>
    `).join('')}
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CALENDÁRIO MENSAL (LANDSCAPE) -->
<div class="page-landscape">
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
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CHECKLIST -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Checklist de Decisões</div>
  <table class="data-table checklist-clean">
    <tr><th>Decisão Pendente</th><th style="width:25mm;">Prazo</th><th style="width:12mm;"></th><th>Anotações</th></tr>
    ${checklist.slice(0,16).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.prazo}</td>
        <td style="text-align:center;"><span class="check-icon"></span></td>
        <td style="border-bottom:0.5pt dashed #D4CFC9;height:6mm;"></td>
      </tr>
    `).join('')}
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

${checklist.length > 16 ? `
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Checklist &mdash; Continuação</div>
  <table class="data-table checklist-clean">
    <tr><th>Decisão Pendente</th><th style="width:25mm;">Prazo</th><th style="width:12mm;"></th><th>Anotações</th></tr>
    ${checklist.slice(16).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.prazo}</td>
        <td style="text-align:center;"><span class="check-icon"></span></td>
        <td style="border-bottom:0.5pt dashed #D4CFC9;height:6mm;"></td>
      </tr>
    `).join('')}
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<!-- ═══════════════════════════════════════════════════ FORNECEDORES (LANDSCAPE) -->
<div class="page-landscape">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores</div>
  <table class="data-table fornecedores-table">
    <tr><th style="width:28mm;">Categoria</th><th style="width:45mm;">Nome</th><th style="width:28mm;">Telefone</th><th style="width:40mm;">E-mail</th><th style="width:18mm;">Status</th></tr>
    ${fornecedores.slice(0,20).map(f=>`
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
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

${fornecedores.length > 20 ? `
<div class="page-landscape">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores &mdash; Continuação</div>
  <table class="data-table fornecedores-table">
    <tr><th style="width:28mm;">Categoria</th><th style="width:45mm;">Nome</th><th style="width:28mm;">Telefone</th><th style="width:40mm;">E-mail</th><th style="width:18mm;">Status</th></tr>
    ${fornecedores.slice(20).map(f=>`
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
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<div class="page-landscape">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores &mdash; Anotações de Valor e Prazo</div>
  <table class="data-table fornecedores-table">
    <tr><th style="width:28mm;">Categoria</th><th style="width:28mm;">Valor</th><th style="width:22mm;">Prazo</th><th>Anotações</th></tr>
    ${fornecedores.slice(0,15).map(f=>`
      <tr>
        <td>${f.categoria}</td>
        <td>R$ ____________</td>
        <td>____________</td>
        <td style="border-bottom:0.5pt dashed #D4CFC9;height:6mm;"></td>
      </tr>
    `).join('')}
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO (LANDSCAPE, JUNTO) -->
<div class="page-landscape">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Orçamento Detalhado</div>
  <p style="font-size:10pt;line-height:1.6;margin-bottom:4mm;">Esta estimativa foi regionalizada com base em <strong>${cidade || 'sua cidade'}</strong> / <strong>${estado || 'seu estado'}</strong>.</p>
  <div class="budget-landscape">
    <div class="budget-chart">${grafico.svg}</div>
    <div>${grafico.legend}</div>
  </div>
  <table class="data-table">
    <tr><th>Item</th><th style="width:12mm;">%</th><th style="width:22mm;">Valor Est.</th><th style="width:22mm;">Valor Real</th></tr>
    ${itensOrcamento.slice(0,20).map(item=>`
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
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<div class="page-landscape">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Orçamento &mdash; Continuação</div>
  <table class="data-table">
    <tr><th>Item</th><th style="width:12mm;">%</th><th style="width:22mm;">Valor Est.</th><th style="width:22mm;">Valor Real</th></tr>
    ${itensOrcamento.slice(20).map(item=>`
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
    <span>${logoSvgSmall}</span>
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

  <div class="section-subtitle" style="margin-top:5mm;">Melhores Épocas para Casar</div>
  <div style="margin:2mm 0;">
    ${dicasRegionais.melhoresEpocas.map(e=>`<span class="epoca-badge">${e}</span>`).join('')}
  </div>

  <div class="section-subtitle" style="margin-top:5mm;">Fornecedores Locais Recomendados</div>
  <div style="margin:2mm 0;">
    <span class="fornecedor-local">Espaços &amp; Venues</span>
    <span class="fornecedor-local">Buffet &amp; Bar</span>
    <span class="fornecedor-local">Fotografia</span>
    <span class="fornecedor-local">Decoração &amp; Flores</span>
    <span class="fornecedor-local">Música &amp; DJ</span>
    <span class="fornecedor-local">Beleza &amp; Vestido</span>
    <span class="fornecedor-local">Papelaria</span>
    <span class="fornecedor-local">Cerimonialista</span>
  </div>
  <p style="font-size:9.5pt;line-height:1.6;color:var(--color-text-soft);margin-left:3mm;margin-top:2mm;">
    Consulte a lista de fornecedores verificados em ${cidade || 'sua região'}. 
    Prefira profissionais com experiência em casamentos no estilo ${estilo}.
    Solicite orçamentos detalhados com 8 meses de antecedência e visite os espaços pessoalmente antes de fechar contrato.
  </p>

  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
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
  <div style="margin-top:6mm;">${logoSvg}</div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoSvgSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

</body>
</html>
  `;

  return html;
} novo 