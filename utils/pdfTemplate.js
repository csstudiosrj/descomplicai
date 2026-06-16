// utils/pdfTemplate.js — Memorial descomplicaí v7 (Reescrita Completa)
// Foco: zero vazamento, IDV em 1 página, layouts compactos, quebras controladas

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
  let t = texto.replace(/#[0-9A-Fa-f]{3,8}\b/gi, '');
  // Remove pontuação órfã deixada pela remoção dos hex
  t = t.replace(/[,;.]\s*(?=[,;.\s])/g, ' ');
  t = t.replace(/\s{2,}/g, ' ');
  t = t.replace(/[,;.]\s*$/g, '');
  t = t.replace(/^\s*[,;.]/g, '');
  return t.trim();
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
   LOGO DESCOMPLECAÍ — HTML span com font-face
   ═══════════════════════════════════════════════════════════ */
function logoHTML(corDescomplica = '#8B6F5E', corI = '#10B981') {
  return `<span style="display:inline-flex;align-items:baseline;white-space:nowrap;font-size:1em;">
    <span style="font-family:'LogoFont1','DM Sans','Helvetica Neue',Arial,sans-serif;font-weight:300;color:${corDescomplica};">descomplica</span>
    <span style="font-family:'LogoFont2','Space Mono','Courier New',monospace;font-weight:400;font-style:italic;font-size:1.08em;color:${corI};margin-left:0.02em;">í</span>
  </span>`;
}

/* ═══════════════════════════════════════════════════════════
   MONOGRAMA ELEGANTE (estilo Claude)
   ═══════════════════════════════════════════════════════════ */
function svgMonogramaElegante(inicial1, inicial2, corPrimaria, corSecundaria, size = 160) {
  const i1 = String(inicial1 || 'N').charAt(0).toUpperCase();
  const i2 = String(inicial2 || 'N').charAt(0).toUpperCase();
  const c1 = String(corPrimaria || '#1A1714');
  const c2 = String(corSecundaria || '#8B6F5E');
  const s = size;
  const hs = s / 2;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
    <circle cx="${hs}" cy="${hs}" r="${s*0.45}" fill="none" stroke="${c2}" stroke-width="1"/>
    <circle cx="${hs}" cy="${hs}" r="${s*0.42}" fill="none" stroke="${c2}" stroke-width="0.5"/>
    <text x="${s*0.30}" y="${s*0.58}" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="${s*0.35}" fill="${c1}" text-anchor="middle" font-weight="bold">${i1}</text>
    <text x="${s*0.70}" y="${s*0.58}" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="${s*0.35}" fill="${c1}" text-anchor="middle" font-weight="bold">${i2}</text>
    <text x="${hs}" y="${s*0.55}" font-family="DisplayFont, Georgia, 'Times New Roman', serif" font-size="${s*0.20}" fill="${c2}" text-anchor="middle">&</text>
    <line x1="${s*0.15}" y1="${s*0.75}" x2="${s*0.42}" y2="${s*0.75}" stroke="${c2}" stroke-width="0.5"/>
    <line x1="${s*0.58}" y1="${s*0.75}" x2="${s*0.85}" y2="${s*0.75}" stroke="${c2}" stroke-width="0.5"/>
    <circle cx="${hs}" cy="${s*0.75}" r="${s*0.012}" fill="${c2}"/>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   ELEMENTO GRÁFICO NO TOPO (linhas duplas simples)
   ═══════════════════════════════════════════════════════════ */
function svgElementoTopo(cor, largura = '100%') {
  return `<svg width="${largura}" height="16" style="display:block;margin:0 auto 10px auto;" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="4" x2="100%" y2="4" stroke="${cor}" stroke-width="1"/>
    <line x1="0" y1="9" x2="100%" y2="9" stroke="${cor}" stroke-width="0.4"/>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   ELEMENTO GRÁFICO DO PERFIL (para IDV e capa)
   ═══════════════════════════════════════════════════════════ */
function svgElementoGraficoPerfil(perfil, cor, largura = 200, altura = 50) {
  const c = String(cor || '#1A1714');
  return `<svg width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
    <line x1="${largura*0.15}" y1="${altura*0.5}" x2="${largura*0.85}" y2="${altura*0.5}" stroke="${c}" stroke-width="1.2" opacity="0.5"/>
    <line x1="${largura*0.25}" y1="${altura*0.62}" x2="${largura*0.75}" y2="${altura*0.62}" stroke="${c}" stroke-width="0.8" opacity="0.3"/>
  </svg>`;
}

/* ═══════════════════════════════════════════════════════════
   TEXTO INÉDITO POR SEÇÃO (compacto, sem overflow)
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

  const vibe = perfil === 'romantico' ? 'ternura e delicadeza' : perfil === 'boho' ? 'liberdade e organicidade' : perfil === 'moderno' ? 'sofisticação e precisão' : perfil === 'rustico' ? 'acolhimento e raízes' : 'elegância atemporal';

  const textos = {
    'Identidade Visual': `A identidade visual traduz a essência de ${n1} e ${n2} em cada elemento. O estilo ${estilo} guia tipografia e cores, criando coesão do convite às lembranças. A paleta evoca ${vibe}. Cada detalhe foi pensado para que os convidados sintam a personalidade do casal antes de chegar.`,
    'Cerimônia': `Cerimônia ${tipoCerimonia} em ${tipoLocal}, às ${horario}. Cada detalhe cria uma atmosfera ${vibe}. Com ${totalConvidados} convidados, a celebração será ${totalConvidados === 'intimo' ? 'íntima e profunda' : totalConvidados === 'grande' ? 'grandiosa e vibrante' : 'equilibrada e acolhedora'}.`,
    'Decoração': `Flores como ${flores} e iluminação ${iluminacao} criam pontos de interesse. ${velas !== 'Nenhuma' ? `As ${velas} adicionam luz quente.` : 'A iluminação arquitetural protagoniza a atmosfera.'} O mobiliário ${mobiliario} complementa o estilo ${estilo}.`,
    'Mesa Posta': `Jantar ${tipoJantar} e bar ${tipoBar}. Louça, talheres e taças dialogam com o estilo ${estilo}. Sousplats e menus individuais transformam cada lugar em experiência única.`,
    'Alimentação e Bebidas': `Jantar ${tipoJantar} preparado com ingredientes da estação e região de ${cidade}. O bar ${tipoBar} oferece clássicos e criações exclusivas. A degustação prévia ajusta sabores e apresentação.`,
    'Entretenimento': `Música por ${musica} e atividades como ${atividades}. A iluminação de pista e curadoria musical mantêm a energia do início ao fim. O entretenimento celebra a união de duas famílias.`,
    'Vestuário e Beleza': `Visual ${estiloVestido === 'princesa' ? 'de conto de fadas' : estiloVestido === 'sereia' ? 'de sensualidade elegante' : estiloVestido === 'minimalista' ? 'de sofisticação discreta' : estiloVestido === 'boho' ? 'de liberdade e movimento' : 'de elegância pessoal'}. Beleza que realça traços naturais e resiste às emoções da festa.`,
    'Papelaria e Identidade': `Convites no formato ${formatoConvite} carregam o monograma e a paleta. Save the date, RSVP, menu e plaquinhas formam um universo gráfico coeso e surpreendente.`,
  };
  return textos[tituloSecao] || `Decisões de ${n1} e ${n2} para ${tituloSecao.toLowerCase()}, pensadas para criar experiência coesa no estilo ${estilo}.`;
}

/* ═══════════════════════════════════════════════════════════
   CARD TÉCNICO COMPACTO
   ═══════════════════════════════════════════════════════════ */
function cardTecnicoCompacto(tituloSecao, dados, corPrimaria, corSecundaria) {
  const campos = [];
  const add = (label, val) => {
    const v = sanitizarValor(val);
    if (v && v !== 'a definir' && v !== 'Não' && v !== '') campos.push(`<strong style="color:${corPrimaria};">${label}:</strong> ${v}`);
  };
  if (tituloSecao === 'Cerimônia') {
    add('Tipo', dados?.tipoCerimonia); add('Local', dados?.tipoLocal); add('Horário', dados?.horarioCasamento); add('Convidados', dados?.totalConvidados);
  } else if (tituloSecao === 'Decoração') {
    add('Flores', dados?.flores); add('Iluminação', dados?.iluminacao); add('Velas', dados?.velas); add('Mobiliário', dados?.mobiliarioEspecial);
  } else if (tituloSecao === 'Mesa Posta') {
    add('Jantar', dados?.tipoJantar); add('Bar', dados?.tipoBar);
  } else if (tituloSecao === 'Alimentação e Bebidas') {
    add('Jantar', dados?.tipoJantar); add('Bar', dados?.tipoBar); add('Convidados', dados?.totalConvidados);
  } else if (tituloSecao === 'Entretenimento') {
    add('Música', dados?.musicaFesta); add('Atividades', Array.isArray(dados?.atividadesEntretenimento) ? dados.atividadesEntretenimento.join(', ') : '');
  } else if (tituloSecao === 'Vestuário e Beleza') {
    add('Vestido', dados?.estiloVestido);
  } else if (tituloSecao === 'Papelaria e Identidade') {
    add('Convite', dados?.formatoConvite);
  } else if (tituloSecao === 'Identidade Visual') {
    add('Estilo', dados?.estilo); add('Perfil', dados?.perfilCasal);
  }
  if (campos.length === 0) return '';
  return `<div style="margin-top:2mm;padding:2mm 3mm;background:${corSecundaria}15;border-left:2pt solid ${corPrimaria};border-radius:2px;font-size:8.5pt;line-height:1.5;">
    ${campos.join(' &nbsp;•&nbsp; ')}
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   MINI CHECKLIST COMPACTO
   ═══════════════════════════════════════════════════════════ */
function miniChecklistCompacto(tituloSecao, dados) {
  const checks = {
    'Identidade Visual': ['Aprovar monograma','Definir paleta final','Testar fontes em impressão'],
    'Cerimônia': ['Definir tipo de cerimônia','Reservar local','Contratar celebrante','Escolher trilha sonora'],
    'Decoração': ['Definir paleta final','Contratar florista','Confirmar iluminação','Verificar mobiliário'],
    'Mesa Posta': ['Definir tipo de jantar','Escolher louças','Confirmar bar','Aprovar menu'],
    'Alimentação e Bebidas': ['Realizar degustação','Definir cardápio','Confirmar bar','Verificar restrições'],
    'Entretenimento': ['Contratar música','Definir playlist','Confirmar atividades','Testar som'],
    'Vestuário e Beleza': ['Provar vestido final','Agendar cabelo/maquiagem','Confirmar traje','Separar acessórios'],
    'Papelaria e Identidade': ['Aprovar design do convite','Definir lista','Enviar save the date','Confirmar gráfica'],
  };
  const items = checks[tituloSecao] || ['Definir detalhes','Contratar fornecedores','Confirmar prazos'];
  return `<div style="margin-top:2mm;display:grid;grid-template-columns:1fr 1fr;gap:1mm 3mm;">
    ${items.map(i => `<div style="font-size:8pt;line-height:1.5;display:flex;align-items:center;gap:1.5mm;">
      <span style="width:2.5mm;height:2.5mm;border:0.6pt solid #10B981;border-radius:1px;flex-shrink:0;display:inline-block;"></span>
      <span>${i}</span>
    </div>`).join('')}
  </div>`;
}

/* ═══════════════════════════════════════════════════════════
   DICAS POR SEÇÃO
   ═══════════════════════════════════════════════════════════ */
function dicaSecao(tituloSecao) {
  const dicas = {
    'Identidade Visual': 'Mantenha coerência visual em todos os materiais. Teste fontes em tamanhos pequenos antes de aprovar.',
    'Cerimônia': 'Chegue 30 minutos antes para acertos finais. Verifique a acústica do local com antecedência.',
    'Decoração': 'Reserve 10% do orçamento de decoração para itens de última hora. Flores frescas chegam no dia do evento.',
    'Mesa Posta': 'Confirme a quantidade de louças uma semana antes. Sousplats elevam o visual sem custos altos.',
    'Alimentação e Bebidas': 'Faça degustação com pelo menos 3 opções. Reserve água e bebidas não alcoólicas generosamente.',
    'Entretenimento': 'Teste o equipamento de som no local. Prepare uma playlist de reserva para o DJ.',
    'Vestuário e Beleza': 'Agende a prova final 2 semanas antes. Leve os sapatos para a prova de altura.',
    'Papelaria e Identidade': 'Imprima 10% a mais de convites para imprevistos. Envie save the date com 8 meses de antecedência.',
  };
  return dicas[tituloSecao] || 'Planeje com antecedência e mantenha uma lista de contatos atualizada.';
}

/* ═══════════════════════════════════════════════════════════
   GRÁFICO PIZZA SVG
   ═══════════════════════════════════════════════════════════ */
function gerarSvgPizza(itens, size = 220) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 14;
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
    legendHtml += `<div style="display:flex;align-items:center;margin-bottom:3px;gap:5px;"><div style="width:10px;height:10px;background:${cor};border-radius:2px;flex-shrink:0;"></div><span style="font-family:var(--font-body);font-size:8.5px;color:var(--color-text);">${item.item} <strong>(${item.percentual}%)</strong></span></div>`;
    startAngle = endAngle;
  });
  return { svg: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;display:block;">${paths}</svg>`, legend: legendHtml };
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZADORES DE TEXTO
   ═══════════════════════════════════════════════════════════ */
function renderTextoSecao(secao) {
  if (!secao || typeof secao !== 'object' || !Array.isArray(secao.linhas) || secao.linhas.length === 0) {
    return '<p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;">Conteúdo personalizado para este casal.</p>';
  }
  return secao.linhas.map(linha => {
    if (typeof linha !== 'string') return '';
    const texto = filtrarHexDoTexto(linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim());
    if (!texto) return '';
    if (linha.startsWith('### ')) return `<h3 style="font-family:var(--font-display);font-size:11pt;color:var(--color-primary);margin-top:8px;margin-bottom:4px;">${texto}</h3>`;
    if (linha.startsWith('- ') || linha.startsWith('* ')) return `<p style="font-family:var(--font-body);font-size:9.5pt;line-height:1.5;color:var(--color-text);margin-bottom:3px;margin-left:8px;">&bull; ${texto}</p>`;
    return `<p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;">${texto}</p>`;
  }).join('');
}

function renderTextoEditorial(secoesNormais) {
  if (!Array.isArray(secoesNormais) || secoesNormais.length === 0) {
    return '<p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;">Memorial do casamento.</p>';
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
    return '<p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;">Memorial do casamento.</p>';
  }
  let html = '';
  const primeiro = todasLinhas[0];
  const resto = todasLinhas.slice(1);
  html += `<p class="editorial-dropcap" style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;text-align:justify;">${primeiro}</p>`;
  for (const par of resto) {
    html += `<p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;text-align:justify;">${par}</p>`;
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
  const imgDecoracao = getImagensMultiplas('decoracao', estilo, 2);
  const imgCerimonia = getImagensMultiplas('cerimonia', estilo, 2);
  const imgFlores = getImagensMultiplas('flores', dadosEvento?.flores || estilo, 2);
  const imgMesa = getImagensMultiplas('mesa', estilo, 2);
  const imgAlimentacao = getImagensMultiplas('alimentacao', estilo, 2);
  const imgEntretenimento = getImagensMultiplas('entretenimento', estilo, 2);
  const imgVestido = getImagensMultiplas('vestidos', dadosEvento?.estiloVestido || estilo, 2);
  const imgPapelaria = getImagensMultiplas('papelaria', estilo, 2);
  const imgBeleza = getImagensMultiplas('beleza', estilo, 2);
  const imgDetalhes = getImagensMultiplas('detalhes', estilo, 2);

  const getSecao = (tituloBusca) => {
    if (typeof tituloBusca !== 'string') return null;
    const buscaNormalizada = normalizar(tituloBusca);
    if (!Array.isArray(secoesNormais)) return null;
    return secoesNormais.find(s => normalizar(s.titulo).includes(buscaNormalizada)) || null;
  };

  const grafico = gerarSvgPizza(itensOrcamento.slice(0, 8), 200);
  const svgTopo = svgElementoTopo(corPrimaria);
  const svgMonoCapa = svgMonogramaElegante(inicial1, inicial2, corContraste, corContraste, 180);
  const svgMonoIDV = svgMonogramaElegante(inicial1, inicial2, corPrimaria, corSecundaria, 150);
  const logoHtml = logoHTML('#8B6F5E', '#10B981');
  const logoHtmlSmall = logoHTML('#8B6F5E', '#10B981');

  const secoesTematicas = [
    { titulo: 'Identidade Visual', imagens: imgDecoracao, layout: 'grid' },
    { titulo: 'Cerimônia', imagens: imgCerimonia, layout: 'side' },
    { titulo: 'Decoração', imagens: imgFlores.length ? imgFlores : imgDecoracao, layout: 'grid' },
    { titulo: 'Mesa Posta', imagens: imgMesa, layout: 'side' },
    { titulo: 'Alimentação e Bebidas', imagens: imgAlimentacao, layout: 'grid' },
    { titulo: 'Entretenimento', imagens: imgEntretenimento, layout: 'side' },
    { titulo: 'Vestuário e Beleza', imagens: imgVestido.length ? imgVestido : imgBeleza, layout: 'grid' },
    { titulo: 'Papelaria e Identidade', imagens: imgPapelaria, layout: 'side' },
  ];

  const renderPaginaSecao = (titulo, secao, imagens, layout) => {
    const textoInedito = gerarTextoIneditoSecao(titulo, dadosEvento);
    let imgHtml = '';
    let textoHtml = '';

    if (layout === 'side' && imagens?.[0]) {
      imgHtml = `<div style="display:grid;grid-template-columns:1.3fr 1fr;gap:4mm;margin-bottom:3mm;align-items:start;">
        <div style="font-size:9.5pt;line-height:1.55;text-align:justify;">${textoInedito}</div>
        <div><img src="${imagens[0]}" style="width:100%;height:48mm;object-fit:cover;border-radius:3px;display:block;"/></div>
      </div>`;
    } else if (layout === 'grid' && imagens?.length) {
      const imgs = imagens.slice(0, 2).map(imgSrc => `<img src="${imgSrc}" style="width:100%;height:32mm;object-fit:cover;border-radius:3px;display:block;"/>`).join('');
      imgHtml = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:3mm;">${imgs}</div>`;
      textoHtml = `<div style="font-size:9.5pt;line-height:1.55;text-align:justify;margin-bottom:3mm;">${textoInedito}</div>`;
    } else {
      textoHtml = `<div style="font-size:9.5pt;line-height:1.55;text-align:justify;margin-bottom:3mm;">${textoInedito}</div>`;
    }

    return `<div class="page">
  ${svgTopo}
  <div class="section-title">${titulo}</div>
  ${imgHtml}
  ${textoHtml}
  ${cardTecnicoCompacto(titulo, dadosEvento, corPrimaria, corSecundaria)}
  <div style="margin-top:2mm;padding:2mm 3mm;background:#10B98108;border-radius:2px;font-size:8.5pt;line-height:1.5;">
    <span style="color:#10B981;font-weight:bold;">í</span> <strong>Dica:</strong> ${dicaSecao(titulo)}
  </div>
  ${miniChecklistCompacto(titulo, dadosEvento)}
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
  @page { size: A4 portrait; margin: 0; }
  body { font-family: var(--font-body); color: var(--color-text); counter-reset: pagina; }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 12mm 16mm 18mm 16mm;
    position: relative;
    page-break-after: always;
    overflow: visible;
    counter-increment: pagina;
  }
  .page:last-child { page-break-after: auto; }

  .footer {
    position: absolute;
    bottom: 6mm;
    left: 16mm;
    right: 16mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.5pt solid #C8BFB4;
    padding-top: 2mm;
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
    padding: 25mm 18mm;
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
  .cover-monogram { margin-bottom: 5mm; }
  .cover-title {
    font-family: var(--font-display);
    font-size: 40pt;
    margin-bottom: 2mm;
    letter-spacing: 1px;
    line-height: 1.05;
    font-weight: bold;
  }
  .cover-subtitle {
    font-family: var(--font-body);
    font-size: 10pt;
    letter-spacing: 5px;
    text-transform: uppercase;
    margin-bottom: 6mm;
    opacity: 0.95;
  }
  .cover-local {
    font-family: var(--font-body);
    font-size: 12pt;
    margin-bottom: 1mm;
    opacity: 0.9;
  }
  .cover-date {
    font-family: var(--font-body);
    font-size: 11pt;
    margin-bottom: 6mm;
    opacity: 0.85;
  }
  .cover-palette {
    display: flex;
    gap: 6mm;
    justify-content: center;
    margin-top: 4mm;
  }
  .palette-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .palette-circle {
    width: 10mm;
    height: 10mm;
    border-radius: 50%;
    border: 1.5pt solid ${corContraste};
    margin-bottom: 1.5mm;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .palette-hex {
    font-size: 5.5pt;
    font-family: 'LogoFont2', monospace;
    color: ${corContraste};
    opacity: 0.9;
  }
  .palette-name { font-size: 7.5pt; font-family: var(--font-body); font-weight: 500; }
  .palette-role { font-size: 6.5pt; opacity: 0.8; font-family: var(--font-body); }
  .cover-deco {
    position: absolute;
    bottom: 20mm;
    left: 0; right: 0;
    z-index: 2;
    display: flex;
    justify-content: center;
  }
  .cover-footer {
    position: absolute;
    bottom: 6mm;
    left: 16mm;
    right: 16mm;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.5pt solid ${corContraste};
    padding-top: 2mm;
    font-size: 8pt;
    color: ${corContraste};
  }

  /* ═══ ÍNDICE ═══ */
  .toc-intro {
    font-size: 10pt;
    line-height: 1.6;
    margin-bottom: 4mm;
    font-style: italic;
    color: var(--color-text-soft);
    text-align: center;
  }
  .toc-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2mm 0;
    font-size: 10pt;
    line-height: 1.3;
  }
  .toc-row strong { color: var(--color-primary); }
  .toc-dots {
    flex: 1;
    border-bottom: 1pt dotted #C8BFB4;
    margin: 0 2mm 1mm 2mm;
    min-width: 10mm;
  }

  /* ═══ EDITORIAL ═══ */
  .editorial-header {
    text-align: center;
    margin-bottom: 6mm;
  }
  .editorial-header h2 {
    font-family: var(--font-display);
    font-size: 24pt;
    color: var(--color-primary);
    margin-bottom: 1mm;
  }
  .editorial-header .sub {
    font-size: 9pt;
    color: var(--color-text-soft);
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .editorial-body {
    column-count: 2;
    column-gap: 5mm;
    column-rule: 0.5pt solid #E5E0D9;
  }
  .editorial-body p {
    font-family: var(--font-body);
    font-size: 10pt;
    line-height: 1.6;
    color: var(--color-text);
    margin-bottom: 6px;
    text-align: justify;
  }
  .editorial-dropcap::first-letter {
    font-family: var(--font-display);
    font-size: 3.2em;
    float: left;
    line-height: 0.85;
    margin-right: 0.05em;
    margin-top: 0.04em;
    color: var(--color-primary);
    font-weight: bold;
  }
  .editorial-image-inline {
    break-inside: avoid;
    margin: 4mm 0;
  }
  .editorial-image-inline img {
    width: 100%;
    max-height: 55mm;
    object-fit: cover;
    border-radius: 3px;
    display: block;
  }

  /* ═══ IDENTIDADE VISUAL (1 página) ═══ */
  .idv-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
  }
  .idv-monogram-main { margin: 2mm 0 3mm 0; }
  .idv-swatches {
    display: flex;
    gap: 8mm;
    justify-content: center;
    margin: 3mm 0 4mm 0;
  }
  .idv-swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .idv-swatch-box {
    width: 15mm;
    height: 15mm;
    border-radius: 2px;
    margin-bottom: 1.5mm;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .idv-swatch-hex {
    font-size: 6pt;
    font-family: 'LogoFont2', monospace;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    font-weight: bold;
  }
  .idv-swatch-name { font-size: 8pt; font-family: var(--font-body); font-weight: 500; }
  .idv-swatch-role { font-size: 6.5pt; font-family: var(--font-body); color: var(--color-text-soft); margin-top: 1px; }
  .idv-typo-display {
    font-family: var(--font-display);
    font-size: 26pt;
    line-height: 1.3;
    color: var(--color-primary);
    margin: 2mm 0;
    text-align: center;
  }
  .idv-typo-body {
    font-family: var(--font-body);
    font-size: 11pt;
    line-height: 1.4;
    color: var(--color-text);
    margin: 2mm 0;
    text-align: center;
  }
  .idv-typo-label {
    font-size: 8pt;
    color: var(--color-text-soft);
    text-align: center;
    margin-bottom: 2mm;
  }
  .idv-exemplo-box {
    border: 0.5pt solid var(--color-secondary);
    border-radius: 3px;
    padding: 3mm 5mm;
    margin: 3mm 0;
    text-align: center;
    max-width: 130mm;
  }
  .idv-exemplo-display {
    font-family: var(--font-display);
    font-size: 20pt;
    color: var(--color-primary);
  }
  .idv-exemplo-body {
    font-family: var(--font-body);
    font-size: 10pt;
    color: var(--color-text-soft);
    margin-top: 1mm;
  }
  .idv-explanation {
    font-family: var(--font-body);
    font-size: 9pt;
    line-height: 1.55;
    max-width: 140mm;
    margin: 2mm auto 3mm auto;
    text-align: center;
    color: var(--color-text);
  }

  /* ═══ SEÇÕES TEMÁTICAS ═══ */
  .section-title {
    font-family: var(--font-display);
    font-size: 20pt;
    color: var(--color-primary);
    margin-bottom: 3mm;
    padding-bottom: 2mm;
    border-bottom: 1.5pt solid var(--color-secondary);
    line-height: 1.15;
  }

  /* ═══ TABELAS ═══ */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2mm;
    font-size: 8.5pt;
  }
  .data-table th {
    text-align: left;
    padding: 1.5mm 2mm;
    border-bottom: 1pt solid var(--color-primary);
    background: ${corSecundaria}18;
    font-family: var(--font-body);
    font-weight: 600;
    color: var(--color-primary);
    font-size: 8pt;
  }
  .data-table td {
    padding: 1.2mm 2mm;
    border-bottom: 0.4pt solid #E5E0D9;
    font-family: var(--font-body);
    vertical-align: top;
    font-size: 8.5pt;
  }
  .data-table tr { break-inside: avoid; }

  /* ═══ LINHA DO TEMPO (vertical A4, cards horizontais) ═══ */
  .timeline-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3mm;
    margin-top: 3mm;
  }
  .timeline-card {
    border-radius: 3px;
    padding: 3mm;
    background: #fff;
    border: 0.5pt solid #E5E0D9;
    border-top: 2.5pt solid var(--color-primary);
    break-inside: avoid;
  }
  .timeline-card h4 {
    font-family: var(--font-display);
    font-size: 10pt;
    margin-bottom: 1.5mm;
    color: var(--color-primary);
  }
  .timeline-card p {
    font-size: 8pt;
    line-height: 1.45;
    margin-bottom: 1px;
    color: var(--color-text);
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
  .timeline-legend {
    display: flex;
    gap: 5mm;
    margin-top: 4mm;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* ═══ CALENDÁRIO ═══ */
  .calendario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5mm;
    margin-top: 3mm;
  }
  .calendario-mes {
    border: 0.5pt solid #E5E0D9;
    border-radius: 2px;
    padding: 2.5mm;
    break-inside: avoid;
    background: #fff;
  }
  .calendario-mes h5 {
    font-family: var(--font-display);
    font-size: 9pt;
    color: var(--color-primary);
    margin-bottom: 1.5mm;
    border-bottom: 0.5pt solid #E5E0D9;
    padding-bottom: 1mm;
  }
  .calendario-mes p {
    font-size: 8pt;
    line-height: 1.4;
    color: var(--color-text);
  }

  /* ═══ ORÇAMENTO ═══ */
  .budget-header {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 5mm;
    align-items: start;
    margin-bottom: 3mm;
  }
  .budget-dicas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5mm;
    margin-top: 3mm;
  }
  .budget-dica-box {
    background: ${corSecundaria}12;
    border-left: 1.5pt solid var(--color-primary);
    padding: 2mm;
    border-radius: 2px;
    font-size: 8.5pt;
    line-height: 1.45;
    break-inside: avoid;
  }

  /* ═══ FORNECEDORES ═══ */
  .fornecedores-table th { font-size: 8pt; padding: 1.5mm 2mm; }
  .fornecedores-table td { font-size: 8.5pt; padding: 1.2mm 2mm; }

  /* ═══ CHECKLIST ═══ */
  .checklist-clean td { border-bottom: 0.5pt solid #E5E0D9; }
  .checklist-clean th { border-bottom: 1pt solid var(--color-primary); background: transparent; }
  .checklist-clean { border: none; }
  .checklist-clean tr:first-child th { border-top: 1pt solid var(--color-primary); }
  .check-icon {
    display: inline-block;
    width: 3mm;
    height: 3mm;
    border: 0.7pt solid var(--color-primary);
    border-radius: 1px;
    position: relative;
  }
  .check-icon::after {
    content: '';
    position: absolute;
    left: 0.6mm;
    top: -0.3mm;
    width: 1mm;
    height: 1.8mm;
    border: solid var(--color-primary);
    border-width: 0 0.7pt 0.7pt 0;
    transform: rotate(45deg);
    opacity: 0.3;
  }

  /* ═══ DICAS REGIONAIS ═══ */
  .dicas-clima-box {
    background: ${corSecundaria}15;
    border-left: 2pt solid var(--color-primary);
    padding: 2.5mm;
    margin: 2mm 0;
    border-radius: 2px;
  }
  .epoca-badge {
    display: inline-block;
    padding: 1mm 2mm;
    border-radius: 2px;
    font-size: 8pt;
    margin: 1mm;
    background: ${corSecundaria}25;
    color: var(--color-text);
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
    font-size: 22pt;
    color: var(--color-primary);
    margin-bottom: 4mm;
    line-height: 1.2;
  }
  .cta-text {
    font-size: 10pt;
    line-height: 1.6;
    max-width: 130mm;
    margin-bottom: 3mm;
  }
  .cta-quote {
    font-family: var(--font-display);
    font-size: 12pt;
    color: var(--color-primary);
    font-style: italic;
    margin: 3mm 0;
  }
  .cta-qr {
    width: 28mm;
    height: 28mm;
    margin-top: 3mm;
  }

  /* Quebras de conteúdo */
  .section-title, .timeline-card, .calendario-mes, .data-table, img {
    break-inside: avoid;
  }
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════ CAPA -->
<div class="page cover">
  <div class="cover-bg" style="background-image:url(${imgCapa || ''});"></div>
  <div class="cover-overlay"></div>
  <div class="cover-content">
    <div class="cover-monogram">${svgMonoCapa}</div>
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
  <div class="cover-deco">${svgElementoGraficoPerfil(perfil, corContraste, 220, 55)}</div>
  <div class="cover-footer">
    <span>${nomeCasal}</span>
    <span>${logoHtml}</span>
    <span>arxum.csstudios.site/descomplicai</span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ÍNDICE -->
<div class="page">
  ${svgTopo}
  <div class="section-title" style="font-size:16pt;text-align:center;border:none;">Bem-vindos ao seu Memorial</div>
  <p class="toc-intro">
    Este memorial foi criado exclusivamente para <strong>${nomeCasal}</strong> pelo descomplicaí.
    Reúne decisões, referências visuais e orientações práticas para tornar o planejamento
    leve, organizado e inesquecível.
  </p>
  <div class="section-title" style="font-size:14pt;margin-top:4mm;">Índice</div>
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
    <div class="editorial-image-inline" style="margin-top:4mm;">
      <img src="${imgDetalhes[0]}" alt="detalhes"/>
    </div>
  ` : ''}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- Página 4 do Editorial -->
<div class="page">
  ${svgTopo}
  <div class="section-title" style="font-size:16pt;text-align:center;border:none;">A Visão do Casal</div>
  <div class="editorial-body">
    <p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;text-align:justify;">
      Cada detalhe deste memorial reflete a personalidade única de ${nomeCasal}.
      Das cores às flores, da cerimônia à festa, tudo converge para uma experiência
      autêntica. O estilo ${estilo} permeia cada decisão e fornecedor escolhido.
    </p>
    <p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;text-align:justify;">
      Use este documento como guia visual e prático. Compartilhe com fornecedores
      e familiares para que todos estejam alinhados com a visão do casal.
      A consistência visual transforma um evento em experiência imersiva.
    </p>
    <p style="font-family:var(--font-body);font-size:10pt;line-height:1.6;color:var(--color-text);margin-bottom:6px;text-align:justify;">
      A jornada começa agora. Cada página é um passo em direção ao dia mais especial
      de suas vidas. Organização, inspiração e praticidade — tudo em um só lugar.
    </p>
  </div>
  ${(imgDetalhes && imgDetalhes[1]) ? `
    <div class="editorial-image-inline" style="margin-top:4mm;">
      <img src="${imgDetalhes[1]}" alt="detalhes"/>
    </div>
  ` : ''}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ IDENTIDADE VISUAL (1 página) -->
<div class="page idv-page">
  ${svgTopo}
  <div class="section-title" style="text-align:center;border:none;font-size:18pt;">Identidade Visual</div>

  <div class="idv-monogram-main">${svgMonoIDV}</div>

  <div style="font-family:var(--font-display);font-size:11pt;color:var(--color-primary);margin:2mm 0;">
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

  <div class="idv-typo-display">
    Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
  </div>
  <div class="idv-typo-label">
    Display: ${fonteDisplay} — títulos, nomes, destaques
  </div>

  <div class="idv-typo-body">
    Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
  </div>
  <div class="idv-typo-label">
    Corpo: ${fonteCorpo} — textos corridos, tabelas, listas
  </div>

  <div class="idv-exemplo-box">
    <div class="idv-exemplo-display">${nomeCasal}</div>
    <div class="idv-exemplo-body">${dataFormatada} &mdash; ${localCompleto}</div>
  </div>

  <div class="idv-explanation">
    Use o monograma em selos e menus. Aplique a paleta hierarquicamente: a cor principal
    domina destaques, a secundária cria contraste em detalhes, e a terciária ilumina fundos.
    A tipografia display serve para títulos; a fonte de corpo garante legibilidade.
  </div>

  <div style="margin-top:auto;margin-bottom:3mm;">${svgElementoGraficoPerfil(perfil, corPrimaria, 180, 45)}</div>

  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ SEÇÕES TEMÁTICAS -->
${paginasTematicas}

<!-- ═══════════════════════════════════════════════════ LINHA DO TEMPO (A4 VERTICAL, cards horizontais) -->
<div class="page">
  ${svgTopo}
  <div class="section-title">Linha do Tempo</div>
  <p style="font-size:10pt;line-height:1.5;margin-bottom:3mm;">Cronograma ideal para ${nomeCasal}.</p>

  <div class="timeline-connector">
    <div class="timeline-connector-line"></div>
  </div>

  <div class="timeline-container">
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

  <div class="timeline-legend">
    ${[{c:'#4CAF50',l:'Tranquilo'},{c:'#FFC107',l:'Atenção'},{c:'#FF9800',l:'Urgente'},{c:'#F44336',l:'Crítico'}].map(x=>`
      <div style="display:flex;align-items:center;gap:1.5mm;">
        <div style="width:3mm;height:3mm;background:${x.c};border-radius:1.5px;"></div>
        <span style="font-size:8.5pt;">${x.l}</span>
      </div>
    `).join('')}
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ CALENDÁRIO MENSAL -->
<div class="page">
  ${svgTopo}
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
  ${svgTopo}
  <div class="section-title">Checklist de Decisões</div>
  <table class="data-table checklist-clean">
    <tr><th>Decisão Pendente</th><th style="width:22mm;">Prazo</th><th style="width:10mm;"></th><th>Anotações</th></tr>
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

${checklist.length > 12 ? `
<div class="page">
  ${svgTopo}
  <div class="section-title">Checklist &mdash; Continuação</div>
  <table class="data-table checklist-clean">
    <tr><th>Decisão Pendente</th><th style="width:22mm;">Prazo</th><th style="width:10mm;"></th><th>Anotações</th></tr>
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<!-- ═══════════════════════════════════════════════════ FORNECEDORES -->
<div class="page">
  ${svgTopo}
  <div class="section-title">Fornecedores</div>
  <table class="data-table fornecedores-table">
    <tr><th style="width:24mm;">Categoria</th><th style="width:40mm;">Nome</th><th style="width:24mm;">Telefone</th><th style="width:36mm;">E-mail</th><th style="width:16mm;">Status</th></tr>
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

${fornecedores.length > 14 ? `
<div class="page">
  ${svgTopo}
  <div class="section-title">Fornecedores &mdash; Continuação</div>
  <table class="data-table fornecedores-table">
    <tr><th style="width:24mm;">Categoria</th><th style="width:40mm;">Nome</th><th style="width:24mm;">Telefone</th><th style="width:36mm;">E-mail</th><th style="width:16mm;">Status</th></tr>
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<div class="page">
  ${svgTopo}
  <div class="section-title">Fornecedores &mdash; Anotações</div>
  <table class="data-table fornecedores-table">
    <tr><th style="width:24mm;">Categoria</th><th style="width:26mm;">Valor</th><th style="width:20mm;">Prazo</th><th>Anotações</th></tr>
    ${fornecedores.slice(0,12).map(f=>`
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO (gráfico + legendas + dicas) -->
<div class="page">
  ${svgTopo}
  <div class="section-title">Orçamento Detalhado</div>
  <p style="font-size:9.5pt;line-height:1.5;margin-bottom:3mm;">Estimativa regionalizada para <strong>${cidade || 'sua cidade'}</strong> / <strong>${estado || 'seu estado'}</strong>.</p>
  <div class="budget-header">
    <div class="budget-chart">${grafico.svg}</div>
    <div>
      <p style="font-size:9pt;line-height:1.45;margin-bottom:2mm;"><strong>Como ler:</strong> cada fatia representa a proporção ideal do orçamento total para cada categoria.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5mm;">
        ${grafico.legend}
      </div>
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

<!-- ═══════════════════════════════════════════════════ ORÇAMENTO TABELA -->
<div class="page">
  ${svgTopo}
  <div class="section-title">Orçamento &mdash; Tabela</div>
  <table class="data-table">
    <tr><th>Item</th><th style="width:10mm;">%</th><th style="width:22mm;">Valor Est.</th><th style="width:22mm;">Valor Real</th></tr>
    ${itensOrcamento.slice(0,12).map(item=>`
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
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>

${itensOrcamento.length > 12 ? `
<div class="page">
  ${svgTopo}
  <div class="section-title">Orçamento &mdash; Continuação</div>
  <table class="data-table">
    <tr><th>Item</th><th style="width:10mm;">%</th><th style="width:22mm;">Valor Est.</th><th style="width:22mm;">Valor Real</th></tr>
    ${itensOrcamento.slice(12,24).map(item=>`
      <tr>
        <td>${item.item}</td>
        <td>${item.percentual}%</td>
        <td>R$ ${item.valor.toLocaleString('pt-BR')}</td>
        <td>R$ ____________</td>
      </tr>
    `).join('')}
    ${itensOrcamento.length <= 24 ? `
    <tr style="border-top:1.5pt solid var(--color-primary);font-weight:bold;">
      <td>TOTAL ESTIMADO</td>
      <td>100%</td>
      <td>R$ ${itensOrcamento.reduce((s,i)=>s+i.valor,0).toLocaleString('pt-BR')}</td>
      <td>R$ ____________</td>
    </tr>
    ` : ''}
  </table>
  ${itensOrcamento.length <= 24 ? `
  <div style="margin-top:2mm;padding:2mm 3mm;background:#10B98108;border-radius:2px;font-size:8.5pt;line-height:1.5;">
    <span style="color:#10B981;font-weight:bold;">í</span> <strong>Importante:</strong> os valores são estimativas regionalizadas. Solicite orçamentos detalhados de pelo menos 3 fornecedores por categoria.
  </div>
  ` : ''}
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

${itensOrcamento.length > 24 ? `
<div class="page">
  ${svgTopo}
  <div class="section-title">Orçamento &mdash; Continuação</div>
  <table class="data-table">
    <tr><th>Item</th><th style="width:10mm;">%</th><th style="width:22mm;">Valor Est.</th><th style="width:22mm;">Valor Real</th></tr>
    ${itensOrcamento.slice(24).map(item=>`
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
  <div style="margin-top:2mm;padding:2mm 3mm;background:#10B98108;border-radius:2px;font-size:8.5pt;line-height:1.5;">
    <span style="color:#10B981;font-weight:bold;">í</span> <strong>Importante:</strong> os valores são estimativas regionalizadas. Solicite orçamentos detalhados de pelo menos 3 fornecedores por categoria.
  </div>
  <div class="footer">
    <span>${nomeCasal}</span>
    <span>${logoHtmlSmall}</span>
    <span class="page-number"></span>
  </div>
</div>
` : ''}

<!-- ═══════════════════════════════════════════════════ DICAS REGIONAIS -->
<div class="page">
  ${svgTopo}
  <div class="section-title">Dicas Regionais</div>
  <p style="font-size:10pt;line-height:1.5;margin-bottom:3mm;">Informações específicas para <strong>${localCompleto}</strong>.</p>

  <div style="font-family:var(--font-display);font-size:12pt;color:var(--color-primary);margin-bottom:2mm;">Clima Local</div>
  <div class="dicas-clima-box">
    <p style="font-size:9.5pt;line-height:1.5;">${dicasRegionais.clima}</p>
  </div>

  <div style="font-family:var(--font-display);font-size:12pt;color:var(--color-primary);margin-top:3mm;margin-bottom:2mm;">Cuidados Especiais</div>
  ${dicasRegionais.cuidados.map(c=>`<p style="font-size:9.5pt;line-height:1.5;margin-bottom:1px;margin-left:2mm;">&bull; ${c}</p>`).join('')}

  <div style="font-family:var(--font-display);font-size:12pt;color:var(--color-primary);margin-top:3mm;margin-bottom:2mm;">Melhores Épocas</div>
  <div style="margin:1mm 0;">
    ${dicasRegionais.melhoresEpocas.map(e=>`<span class="epoca-badge">${e}</span>`).join('')}
  </div>

  <div style="font-family:var(--font-display);font-size:12pt;color:var(--color-primary);margin-top:3mm;margin-bottom:2mm;">Dicas de Planejamento</div>
  <p style="font-size:9pt;line-height:1.5;color:var(--color-text-soft);margin-left:2mm;">
    &bull; Solicite orçamentos com 8 meses de antecedência.<br/>
    &bull; Visite os espaços pessoalmente antes de fechar contrato.<br/>
    &bull; Verifique a disponibilidade de fornecedores para a data.<br/>
    &bull; Considere a logística de acesso para convidados de outras cidades.<br/>
    &bull; Reserve acomodações com antecedência se for cidade turística.
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
  <div style="font-size:8pt;color:var(--color-text-soft);margin-bottom:4mm;">&mdash; Honoré de Balzac</div>
  ${qrCodeDataUri ? `<img src="${qrCodeDataUri}" class="cta-qr" alt="QR Code"/>` : ''}
  <div style="font-size:9pt;color:var(--color-primary);margin-top:2mm;">arxum.csstudios.site/descomplicai</div>
  <div style="margin-top:4mm;">${logoHtml}</div>
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