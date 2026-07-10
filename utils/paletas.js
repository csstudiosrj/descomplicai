/**
 * ============================================================
 * utils/paletas.js — Source of Truth de Cores
 * Descomplicaí Memorial
 * ============================================================
 *
 * Este arquivo é a FONTE ÚNICA DA VERDADE para todas as
 * paletas de cores do sistema. Cada estilo de evento tem
 * 3 cores principais, com versões light/dark e RGB.
 *
 * Regras de uso:
 * 1. Sempre importar deste arquivo
 * 2. Nunca hardcodar cores hex em outros lugares
 * 3. Para novos estilos, adicionar aqui primeiro
 * ============================================================
 */

// ============================================================
// 1. DADOS BRUTOS — 14 estilos oficiais
// ============================================================
// Cada entrada: [nomeLegivel, [cor1, cor2, cor3]]

const RAW_PALETAS = {
    classico:   ['Clássico',    ['#F5F0EB', '#D4AF37', '#8B6F5E']],
    rustico:    ['Rústico',     ['#F4E4C1', '#8B6F5E', '#556B2F']],
    boho:       ['Boho',        ['#E8DCC8', '#C4A898', '#8B6F5E']],
    moderno:    ['Moderno',     ['#FFFFFF', '#1A1714', '#C8BFB4']],
    minimalista:['Minimalista', ['#FFFFFF', '#F3F0EC', '#1A1714']],
    industrial: ['Industrial',  ['#2C2C2C', '#8B6F5E', '#C8BFB4']],
    tropical:   ['Tropical',    ['#FF6B6B', '#4ECDC4', '#FFE66D']],
    romantico:  ['Romântico',   ['#F8E1E4', '#FFB7C5', '#8B6F5E']],
    gotico:     ['Gótico',      ['#1A1714', '#4A0E0E', '#C8BFB4']],
    vintage:    ['Vintage',     ['#E6E6FA', '#D8BFD8', '#8B6F5E']],
    artdeco:    ['Art Déco',    ['#0A0A0A', '#D4AF37', '#F5F0EB']],
    praia:      ['Praia',       ['#87CEEB', '#F5F5DC', '#4682B4']],
    jardim:     ['Jardim',      ['#228B22', '#F5F0EB', '#8B6F5E']],
    glam:       ['Glam',        ['#1A1714', '#D4AF37', '#FFFFFF']],
  };
  
  // ============================================================
  // 2. FUNÇÕES INTERNAS (auxiliares)
  // ============================================================
  
  /**
   * Valida se uma string é um hex válido (#RRGGBB).
   * @param {string} hex
   * @returns {boolean}
   */
  function isValidHex(hex) {
    return typeof hex === 'string' && /^#([0-9A-Fa-f]{6})$/.test(hex);
  }
  
  /**
   * Converte hex #RRGGBB para [r, g, b].
   * @param {string} hex
   * @returns {[number, number, number]}
   */
  function hexToRgb(hex) {
    if (!isValidHex(hex)) {
      console.warn(`[paletas] Cor hex inválida: "${hex}". Retornando [0,0,0].`);
      return [0, 0, 0];
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }
  
  /**
   * Converte [r, g, b] para hex #RRGGBB.
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {string}
   */
  function rgbToHex(r, g, b) {
    const toHex = (n) => {
      const clamped = Math.max(0, Math.min(255, Math.round(n)));
      return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  
  /**
   * Ajusta o brilho de uma cor hex.
   * factor > 0 → clareia (light)
   * factor < 0 → escurece (dark)
   *
   * @param {string} hex
   * @param {number} factor — valor entre -1 e 1
   * @returns {string}
   */
  function adjustBrightness(hex, factor) {
    const [r, g, b] = hexToRgb(hex);
    const adjust = (c) => c + (255 - c) * factor; // factor positivo clareia
    return rgbToHex(adjust(r), adjust(g), adjust(b));
  }
  
  /**
   * Gera versão light de uma cor (20% mais clara).
   * @param {string} hex
   * @returns {string}
   */
  function lighten(hex) {
    return adjustBrightness(hex, 0.20);
  }
  
  /**
   * Gera versão dark de uma cor (20% mais escura).
   * @param {string} hex
   * @returns {string}
   */
  function darken(hex) {
    return adjustBrightness(hex, -0.20);
  }
  
  // ============================================================
  // 3. CONSTRUÇÃO DO OBJETO PALETAS
  // ============================================================
  
  const PALETAS = {};
  
  for (const [slug, [nome, cores]] of Object.entries(RAW_PALETAS)) {
    const primaria = cores[0];
    const secundaria = cores[1];
    const terciaria = cores[2];
  
    PALETAS[slug] = {
      nome,
      cores: [...cores],
      primaria,
      secundaria,
      terciaria,
      light: lighten(primaria),
      dark: darken(primaria),
      rgb: cores.map(hexToRgb),
    };
  }
  
  // ============================================================
  // 4. FUNÇÕES EXPORTADAS
  // ============================================================
  
  /**
   * Retorna a paleta completa de um estilo.
   *
   * @param {string} estilo — slug do estilo (ex: 'boho', 'moderno')
   * @returns {Object} — objeto completo da paleta
   *
   * @example
   * import { getPaleta } from '../utils/paletas';
   * const paleta = getPaleta('boho');
   * // { nome: 'Boho', cores: ['#E8DCC8', ...], primaria: '#E8DCC8', light: '#F5F0EB', ... }
   */
  function getPaleta(estilo) {
    const slug = String(estilo).toLowerCase().trim();
  
    if (!(slug in PALETAS)) {
      console.warn(`[paletas] Estilo "${estilo}" não encontrado. Usando fallback 'classico'.`);
      return { ...PALETAS.classico };
    }
  
    return { ...PALETAS[slug] };
  }
  
  /**
   * Retorna uma cor específica pelo índice (0, 1 ou 2).
   *
   * @param {string} estilo — slug do estilo
   * @param {number} indice — 0 (primária), 1 (secundária), 2 (terciária)
   * @returns {string} — cor em hex
   *
   * @example
   * import { getCor } from '../utils/paletas';
   * const cor = getCor('moderno', 0); // '#FFFFFF'
   */
  function getCor(estilo, indice) {
    const paleta = getPaleta(estilo);
    const idx = Number(indice);
  
    if (!Number.isInteger(idx) || idx < 0 || idx > 2) {
      console.warn(`[paletas] Índice "${indice}" inválido. Use 0, 1 ou 2. Retornando primária.`);
      return paleta.primaria;
    }
  
    return paleta.cores[idx];
  }
  
  /**
   * Retorna o valor RGB de uma cor específica pelo índice.
   *
   * @param {string} estilo — slug do estilo
   * @param {number} indice — 0, 1 ou 2
   * @returns {[number, number, number]} — [r, g, b]
   *
   * @example
   * import { getRGB } from '../utils/paletas';
   * const [r, g, b] = getRGB('tropical', 1); // [78, 205, 196]
   */
  function getRGB(estilo, indice) {
    const paleta = getPaleta(estilo);
    const idx = Number(indice);
  
    if (!Number.isInteger(idx) || idx < 0 || idx > 2) {
      console.warn(`[paletas] Índice "${indice}" inválido. Retornando [0,0,0].`);
      return [0, 0, 0];
    }
  
    return [...paleta.rgb[idx]];
  }
  
  /**
   * Gera uma string de CSS custom properties (--paleta-*) para injetar inline.
   *
   * @param {string} estilo — slug do estilo
   * @returns {string} — string de CSS
   *
   * @example
   * import { getCSSVariables } from '../utils/paletas';
   * const css = getCSSVariables('boho');
   * // "--paleta-primaria: #E8DCC8; --paleta-secundaria: #C4A898; ..."
   * // Uso: <div style={css}> ou injetar em <style>
   */
  function getCSSVariables(estilo) {
    const p = getPaleta(estilo);
    return (
      `--paleta-primaria: ${p.primaria}; ` +
      `--paleta-secundaria: ${p.secundaria}; ` +
      `--paleta-terciaria: ${p.terciaria}; ` +
      `--paleta-light: ${p.light}; ` +
      `--paleta-dark: ${p.dark}; ` +
      `--paleta-rgb-0: ${p.rgb[0].join(', ')}; ` +
      `--paleta-rgb-1: ${p.rgb[1].join(', ')}; ` +
      `--paleta-rgb-2: ${p.rgb[2].join(', ')}`
    );
  }
  
  /**
   * Retorna lista de todos os estilos disponíveis.
   *
   * @returns {Array<{slug: string, nome: string}>}
   *
   * @example
   * import { getEstilos } from '../utils/paletas';
   * const estilos = getEstilos();
   * // [{ slug: 'classico', nome: 'Clássico' }, { slug: 'boho', nome: 'Boho' }, ...]
   */
  function getEstilos() {
    return Object.entries(PALETAS).map(([slug, data]) => ({
      slug,
      nome: data.nome,
    }));
  }
  
  /**
   * Retorna formato simplificado da paleta, ideal para geradores de PDF.
   *
   * @param {string} estilo — slug do estilo
   * @returns {Object} — { nome, cores, primaria, secundaria, terciaria }
   *
   * @example
   * import { getPaletaParaPDF } from '../utils/paletas';
   * const pdfData = getPaletaParaPDF('artdeco');
   * // { nome: 'Art Déco', cores: ['#0A0A0A', '#D4AF37', '#F5F0EB'], primaria: '#0A0A0A', ... }
   */
  function getPaletaParaPDF(estilo) {
    const p = getPaleta(estilo);
    return {
      nome: p.nome,
      cores: [...p.cores],
      primaria: p.primaria,
      secundaria: p.secundaria,
      terciaria: p.terciaria,
    };
  }
  
  // ============================================================
  // 5. EXPORTAÇÕES
  // ============================================================
  
  export {
    PALETAS,
    getPaleta,
    getCor,
    getRGB,
    getCSSVariables,
    getEstilos,
    getPaletaParaPDF,
  };
  
  export default PALETAS;
  
  // ============================================================
  // 6. EXEMPLOS DE USO (documentação inline)
  // ============================================================
  //
  // --- Objeto completo ---
  // import { getPaleta } from '../utils/paletas';
  // const paleta = getPaleta('boho');
  // console.log(paleta.primaria);  // '#E8DCC8'
  // console.log(paleta.light);     // '#F5F0EB' (auto-gerado)
  // console.log(paleta.dark);      // '#C4B8A8' (auto-gerado)
  //
  // --- Cor específica ---
  // import { getCor } from '../utils/paletas';
  // const destaque = getCor('moderno', 0);  // '#FFFFFF'
  // const contraste = getCor('moderno', 1);  // '#1A1714'
  //
  // --- RGB para canvas/manipulação ---
  // import { getRGB } from '../utils/paletas';
  // const [r, g, b] = getRGB('tropical', 1); // [78, 205, 196]
  //
  // --- CSS custom properties ---
  // import { getCSSVariables } from '../utils/paletas';
  // <div style={getCSSVariables('romantico')}>
  // // Injeta: --paleta-primaria: #F8E1E4; --paleta-secundaria: #FFB7C5; ...
  //
  // --- Lista de estilos ---
  // import { getEstilos } from '../utils/paletas';
  // getEstilos().map(e => e.nome); // ['Clássico', 'Rústico', 'Boho', ...]
  //
  // --- Para PDF ---
  // import { getPaletaParaPDF } from '../utils/paletas';
  // const data = getPaletaParaPDF('artdeco');
  // // { nome: 'Art Déco', cores: [...], primaria: '#0A0A0A', ... }
  //
  // --- Fallback seguro ---
  // getPaleta('estilo_inexistente'); // retorna paleta 'classico' + warn no console
  //
  // ============================================================