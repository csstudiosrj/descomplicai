// utils/pdfTemplate.js — Memorial descomplicaí v6 (Correções Cirúrgicas)

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
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '');
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
    return null;
  }
}

function getImagensMultiplas(categoria, chave, quantidade = 3) {
  const resultado = [];
  const chaveStr = String(chave || 'default').toLowerCase();
  const principal = getImagem(categoria, chaveStr);
  if (principal) {
    try { if (fs.existsSync(principal)) { const buf = fs.readFileSync(principal); resultado.push(`data:image/jpeg;base64,${buf.toString('base64')}`); } }
    catch (e) {}
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
   LOGO DESCOMPLECAÍ — HTML span com font-face (funcionava antes)
   ═══════════════════════════════════════════════════════════ */
function logoHTML(corDescomplica = '#8B6F5E', corI = '#10B981') {
  return `<span style="display:inline-flex;align-items:baseline;white-space:nowrap;font-size:1em;">
    <span style="font-family:'LogoFont1','DM Sans','Helvetica Neue',Arial,sans-serif;font-weight:300;color:${corDescomplica};vertical-align:baseline;">descomplica</span><span style="font-family:'LogoFont2','Space Mono','Courier New',monospace;font-weight:400;font-style:italic;font-size:1.08em;color:${corI};vertical-align:baseline;">í</span>
  </span>`;
}

/* ═══════════════════════════════════════════════════════════
   MONOGRAMAS POR PERFIL — designs criativos e impactantes
   ═══════════════════════════════════════════════════════════ */
function svgMonogramaPorPerfil(inicial1, inicial2, perfil, cor, tamanho = 200) {
  const i1 = String(inicial1 || 'N').charAt(0).toUpperCase();
  const i2 = String(inicial2 || 'N').charAt(0).toUpperCase();
  const c = String(cor || '#1A1714');
  const s = tamanho;
  const hs = s / 2;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
    <circle cx="${hs}" cy="${hs}" r="${s*0.45}" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.7"/>
    <circle cx="${hs}" cy="${hs}" r="${s*0.42}" fill="none" stroke="${c}" stroke-width="0.6" opacity="0.4"/>
    <text x="${s*0.30}" y="${s*0.58}" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="${s*0.34}" fill="${c}" text-anchor="middle" font-weight="bold">${i1}</text>
    <text x="${s*0.70}" y="${s*0.58}" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="${s*0.34}" fill="${c}" text-anchor="middle" font-weight="bold">${i2}</text>
    <text x="${hs}" y="${s*0.55}" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="${s*0.18}" fill="${c}" text-anchor="middle" opacity="0.8">&</text>
    <line x1="${s*0.12}" y1="${s*0.75}" x2="${s*0.42}" y2="${s*0.75}" stroke="${c}" stroke-width="0.8" opacity="0.5"/>
    <line x1="${s*0.58}" y1="${s*0.75}" x2="${s*0.88}" y2="${s*0.75}" stroke="${c}" stroke-width="0.8" opacity="0.5"/>
    <circle cx="${hs}" cy="${s*0.75}" r="${s*0.015}" fill="${c}" opacity="0.7"/>
  </svg>`;
}

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
   MINI CHECKLIST — checkbox real ☐
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
function gerarSvgPizza(itens, size = 280) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 18;
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
        <span style="font-family:var(--font-body);font-size:9px;color:var(--color-text);">${item.item} <strong>(${item.percentual}%)</strong></span>
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

  const grafico = gerarSvgPizza(itensOrcamento.slice(0, 8), 320);
  const svgDeco = svgElementoGrafico(perfil, corPrimaria, 200, 50);
  const svgDecoLarge = svgElementoGrafico(perfil, corContraste, 280, 70);
  const svgMono = svgMonogramaPorPerfil(inicial1, inicial2, perfil, corContraste, 200);
  const svgMonoLarge = svgMonogramaPorPerfil(inicial1, inicial2, perfil, corSecundaria, 260);
  const logoHtml = logoHTML('#8B6F5E', '#10B981');
  const logoHtmlSmall = logoHTML('#8B6F5E', '#10B981');

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
      const imgHero = (imagens && imagens[0]) ? `<img src="${imagens[0]}" style="width:100%;height:85mm;object-fit:cover;border-radius:4px;display:block;margin-bottom:5mm;"/>` : '';
      corpo = `
        ${imgHero}
        <div style="font-size:10.5pt;line-height:1.7;text-align:justify;">
          <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p>
        </div>
      `;
    } else if (layout === 'side') {
      const imgLat = (imagens && imagens[0]) ? `<img src="${imagens[0]}" style="width:100%;height:100%;min-height:80mm;object-fit:cover;border-radius:4px;display:block;"/>` : '';
      corpo = `
        <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:5mm;align-items:start;">
          <div style="font-size:10.5pt;line-height:1.7;text-align:justify;">
            <p style="font-family:var(--font-body);font-size:10.5pt;line-height:1.7;color:var(--color-text);margin-bottom:8px;">${textoInedito}</p>
          </div>
          <div style="min-height:80mm;">${imgLat}</div>
        </div>
      `;
    } else if (layout === 'grid') {
      const imgs = (imagens || []).slice(0, 4).map((imgSrc) => imgSrc ? `<div class="img-container"><img src="${imgSrc}" style="width:100%;height:55mm;object-fit:cover;border-radius:4px;display:block;"/></div>` : '').join('');
      corpo = `
        <div class="img-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:4mm;">
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
          <div style="background:rgba(249,247,244,0.92);padding:5mm;position:absolute;bottom:0;left:0;right:0;">
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
    <span>${logoHtmlSmall}</span>
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .palette-hex {
    font-size: 6.5pt;
    font-family: 'LogoFont2', monospace;
    color: ${corContraste};
    opacity: 0.9;
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
    font-size: 4.5em;
    float: left;
    line-height: 0.72;
    margin-right: 0.06em;
    margin-top: 0.06em;
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
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .idv-swatch-hex {
    font-size: 6.5pt;
    font-family: 'LogoFont2', monospace;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    font-weight: bold;
  }
  .idv-swatch-name { font-size: 9pt; font-family: var(--font-body); font-weight: 500; }
  .idv-swatch-role { font-size: 7.5pt; font-family: var(--font-body); color: var(--color-text-soft); margin-top: 1px; }
  .idv-typo-sample {
    font-family: var(--font-display);
    font-size: 22pt;
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
  .idv-typo-alphabet {
    font-size: 11pt;
    line-height: 1.8;
    margin: 3mm 0;
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
    break-inside: avoid;
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
    break-inside: avoid;
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
  .data-table tr { break-inside: avoid; }

  /* ═══ LINHA DO TEMPO (VERTICAL A4) ═══ */
  .timeline-vertical {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4mm;
    margin-top: 4mm;
  }
  .timeline-card {
    border-radius: 4px;
    padding: 4mm;
    break-inside: avoid;
    background: #fff;
    border: 0.5pt solid #E5E0D9;
    border-top: 3pt solid var(--color-primary);
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

  /* ═══ CALENDÁRIO (VERTICAL A4) ═══ */
  .calendario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4mm;
    margin-top: 4mm;
  }
  .calendario-mes {
    border: 0.5pt solid #E5E0D9;
    border-radius: 3px;
    padding: 4mm;
    break-inside: avoid;
    background: #fff;
    min-height: 50mm;
  }
  .calendario-mes h5 {
    font-family: var(--font-display);
    font-size: 11pt;
    color: var(--color-primary);
    margin-bottom: 2.5mm;
    border-bottom: 0.5pt solid #E5E0D9;
    padding-bottom: 1.5mm;
  }
  .calendario-mes p {
    font-size: 9.5pt;
    line-height: 1.5;
    margin-bottom: 1px;
    color: var(--color-text);
  }

  /* ═══ ORÇAMENTO ═══ */
  .budget-header {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6mm;
    align-items: start;
    margin-bottom: 4mm;
  }
  .budget-chart svg { display: block; }
  .budget-dicas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3mm;
    margin-top: 4mm;
  }
  .budget-dica-box {
    background: ${corSecundaria}15;
    border-left: 2pt solid var(--color-primary);
    padding: 2.5mm;
    border-radius: 2px;
    font-size: 9pt;
    line-height: 1.5;
    break-inside: avoid;
  }

  /* ═══ FORNECEDORES ═══ */
  .fornecedores-table th { font-size: 8.5pt; padding: 1.5mm 2mm; }
  .fornecedores-table td { font-size: 8.5pt; padding: 1.2mm 2mm; }

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
  .dica-box {
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
  .section-title, .section-subtitle, .info-box, .timeline-card, .calendario-mes, .data-table, img {
    break-inside: avoid;
  }
  .section-title, .section-subtitle {
    break-after: avoid;
  }
  .img-container, .img-grid {
    break-inside: avoid;
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
          <div class="palette-circle" style="background:${cor};">
            <span class="palette-hex">${cor.toUpperCase()}</span>
          </div>
          <div class="palette-name">${getNomeCor(cor)}</div>
          <div class="palette-role">${i===0?'Principal':i===1?'Secundária':'Terciária'}</div>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="cover-deco">${svgDecoLarge}</div>
  <div class="cover-footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
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
    <span>${logoHtmlSmall}</span>
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- Página 4 do Editorial — estrutura coerente -->
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ IDENTIDADE VISUAL -->
<div class="page idv-page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title" style="text-align:center;border:none;">Identidade Visual</div>

  <div class="idv-monogram-main" style="text-align:center;margin:20px 0;">
    <svg width="200" height="200" viewBox="0 0 200 200" style="display:block;margin:0 auto;">
      <circle cx="100" cy="100" r="90" fill="none" stroke="${corSecundaria}" stroke-width="1"/>
      <circle cx="100" cy="100" r="85" fill="none" stroke="${corSecundaria}" stroke-width="0.5"/>
      <text x="60" y="120" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="72" fill="${corPrimaria}" text-anchor="middle">${inicial1}</text>
      <text x="140" y="120" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="72" fill="${corPrimaria}" text-anchor="middle">${inicial2}</text>
      <text x="100" y="115" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="40" fill="${corSecundaria}" text-anchor="middle">&</text>
      <line x1="20" y1="155" x2="80" y2="155" stroke="${corSecundaria}" stroke-width="0.5"/>
      <line x1="120" y1="155" x2="180" y2="155" stroke="${corSecundaria}" stroke-width="0.5"/>
      <circle cx="100" cy="155" r="2" fill="${corSecundaria}"/>
    </svg>
  </div>

  <div style="font-family:var(--font-display);font-size:14pt;color:var(--color-primary);margin:3mm 0;">
    Estilo: <strong>${capitalizarNome(estilo)}</strong> &mdash; Perfil: <strong>${capitalizarNome(perfil)}</strong>
  </div>

  <div class="idv-swatches">
    ${paleta.map((cor, i) => `
      <div class="idv-swatch">
        <div class="idv-swatch-box" style="background:${cor};">
          <span class="idv-swatch-hex">${cor.toUpperCase()}</span>
        </div>
        <div class="idv-swatch-name">${getNomeCor(cor)}</div>
        <div class="idv-swatch-role">${i===0?'Principal':i===1?'Secundária':'Terciária'}</div>
      </div>
    `).join('')}
  </div>

  <div style="font-family:var(--font-display);font-size:32px;color:var(--color-primary);margin:4mm 0;text-align:center;">
    Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
  </div>
  <p style="font-size:10px;color:var(--color-text-soft);text-align:center;">
    <strong>Display:</strong> ${fonteDisplay} — títulos, nomes, destaques
  </p>
  <div style="font-family:var(--font-body);font-size:13px;color:var(--color-text);line-height:1.8;text-align:center;margin:3mm 0;">
    Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk — corpo de texto, parágrafos, descrições
  </div>
  <p style="font-size:10px;color:var(--color-text-soft);text-align:center;">
    <strong>Corpo:</strong> ${fonteCorpo} — textos corridos, tabelas, listas
  </p>

  <div style="text-align:center;padding:4mm;border:0.5pt solid var(--color-secondary);margin:4mm auto;max-width:130mm;">
    <div style="font-family:var(--font-display);font-size:28px;color:var(--color-primary);">
      ${nomeCasal}
    </div>
    <div style="font-family:var(--font-body);font-size:10px;color:var(--color-text-soft);letter-spacing:2px;margin-top:4px;">
      ${dataFormatada} · ${localCompleto}
    </div>
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ SEÇÕES TEMÁTICAS -->
${paginasTematicas}

<!-- ═══════════════════════════════════════════════════ LINHA DO TEMPO (A4 VERTICAL) -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Linha do Tempo</div>
  <p style="font-size:10.5pt;line-height:1.7;margin-bottom:5mm;">O planejamento exige organização. Aqui está o cronograma ideal para ${nomeCasal}.</p>

  <div class="timeline-connector">
    <div class="timeline-connector-line"></div>
  </div>

  <div class="timeline-vertical">
    ${[
      {meses:'12-8 meses',cor:'#4CAF50',tarefas:['Definir data e reservar local','Contratar cerimonialista','Iniciar lista de convidados','Definir estilo e paleta']},
      {meses:'7-4 meses',cor:'#FFC107',tarefas:['Fechar buffet e bebidas','Contratar fotógrafo e vídeo','Provar vestido e traje','Definir decoração e flores']},
      {meses:'3-1 mês',cor:'#FF9800',tarefas:['Enviar convites','Confirmar presenças','Ajustar detalhes decorativos','Prova de cabelo e maquiagem']},
      {meses:'Última semana',cor:'#F44336',tarefas:['Ensaio geral','Confirmar fornecedores','Separar itens do dia','Descansar e se hidratar']},
    ].map((item,i)=>`
      <div class="timeline-card" style="border-top-color:${item.cor};">
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CALENDÁRIO MENSAL (A4 VERTICAL) -->
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
    <span>${logoHtmlSmall}</span>
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
    <span>${logoHtmlSmall}</span>
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<!-- ═══════════════════════════════════════════════════ FORNECEDORES -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores</div>
  <table class="data-table fornecedores-table">
    <thead>
      <tr><th style="width:28mm;">Categoria</th><th style="width:45mm;">Nome</th><th style="width:28mm;">Telefone</th><th style="width:40mm;">E-mail</th><th style="width:18mm;">Status</th></tr>
    </thead>
    <tbody>
      ${fornecedores.slice(0,20).map(f=>`
        <tr>
          <td>${f.categoria}</td>
          <td>${f.nome}</td>
          <td>________________</td>
          <td>________________</td>
          <td>A definir</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

${fornecedores.length > 20 ? `
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores &mdash; Continuação</div>
  <table class="data-table fornecedores-table">
    <thead>
      <tr><th style="width:28mm;">Categoria</th><th style="width:45mm;">Nome</th><th style="width:28mm;">Telefone</th><th style="width:40mm;">E-mail</th><th style="width:18mm;">Status</th></tr>
    </thead>
    <tbody>
      ${fornecedores.slice(20).map(f=>`
        <tr>
          <td>${f.categoria}</td>
          <td>${f.nome}</td>
          <td>________________</td>
          <td>________________</td>
          <td>A definir</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Fornecedores &mdash; Anotações</div>
  <table class="data-table fornecedores-table">
    <thead>
      <tr><th style="width:28mm;">Categoria</th><th style="width:28mm;">Valor</th><th style="width:22mm;">Prazo</th><th>Anotações</th></tr>
    </thead>
    <tbody>
      ${fornecedores.slice(0,15).map(f=>`
        <tr>
          <td>${f.categoria}</td>
          <td>R$ ____________</td>
          <td>____________</td>
          <td style="border-bottom:0.5pt dashed #D4CFC9;height:6mm;"></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO — VISÃO GERAL -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Orçamento Detalhado</div>
  <p style="font-size:10.5pt;line-height:1.6;margin-bottom:4mm;">
    Esta estimativa foi regionalizada com base em <strong>${cidade || 'sua cidade'}</strong> / <strong>${estado || 'seu estado'}</strong>.
    Cada fatia do gráfico representa a proporção ideal do orçamento total para cada categoria.
    Use os valores como ponto de partida para suas negociações com fornecedores.
  </p>
  <div class="budget-header">
    <div class="budget-chart">${grafico.svg}</div>
    <div>
      <p style="font-size:10pt;line-height:1.5;margin-bottom:2mm;font-weight:bold;color:var(--color-primary);">Distribuição do Orçamento</p>
      ${grafico.legend}
    </div>
  </div>
  <div class="budget-dicas">
    <div class="budget-dica-box">
      <strong style="color:var(--color-primary);">Dica 1:</strong> Reserve 10% do orçamento total para imprevistos e gastos de última hora.
    </div>
    <div class="budget-dica-box">
      <strong style="color:var(--color-primary);">Dica 2:</strong> Negocie pacotes completos com fornecedores para obter descontos de 5-15%.
    </div>
    <div class="budget-dica-box">
      <strong style="color:var(--color-primary);">Dica 3:</strong> Priorize: buffet, espaço e fotografia são os itens que mais impactam a experiência.
    </div>
    <div class="budget-dica-box">
      <strong style="color:var(--color-primary);">Dica 4:</strong> Pague fornecedores-chave com antecedência para garantir disponibilidade.
    </div>
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO — TABELA -->
<div class="page">
  <div style="text-align:center;margin-bottom:3mm;">${svgDeco}</div>
  <div class="section-title">Orçamento &mdash; Tabela Completa</div>
  <table class="data-table">
    <thead>
      <tr><th>Item</th><th style="width:12mm;">%</th><th style="width:24mm;">Valor Est.</th><th style="width:24mm;">Valor Real</th></tr>
    </thead>
    <tbody>
      ${itensOrcamento.map(item=>`
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
    </tbody>
  </table>
  <div class="info-box" style="margin-top:3mm;">
    <p><span style="color:#10B981;font-weight:bold;font-size:10pt;margin-right:3px;">í</span><strong>Importante:</strong> os valores são estimativas regionalizadas. Solicite orçamentos detalhados de pelo menos 3 fornecedores por categoria.</p>
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
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

  <div class="section-subtitle" style="margin-top:5mm;">Dicas de Planejamento</div>
  <p style="font-size:9.5pt;line-height:1.6;color:var(--color-text-soft);margin-left:3mm;margin-top:2mm;">
    &bull; Solicite orçamentos detalhados com 8 meses de antecedência.<br/>
    &bull; Visite os espaços pessoalmente antes de fechar contrato.<br/>
    &bull; Verifique a disponibilidade de fornecedores para a data escolhida.<br/>
    &bull; Considere a logística de acesso para convidados de outras cidades.<br/>
    &bull; Reserve acomodações com antecedência se o evento for em cidade turística.
  </p>

  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
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
  <div style="margin-top:6mm;">${logoHtml}</div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

</body>
</html>
  `;

  return html;
}