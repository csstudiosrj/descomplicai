// utils/getBreathConfig.js
// Configuração de respiro contextual por estilo e bloco do memorial

import { getTermos } from './linguagemCasal';

export const BREATH_CONFIG = {
  classico: {
    backgroundImage: '/images/breath/breath-classico.jpg',
    overlayColor: 'rgba(139, 111, 94, 0.50)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathArabescos',
    textColor: '#FFFFFF',
    duration: 700,
  },
  romantico: {
    backgroundImage: '/images/breath/breath-romantico.jpg',
    overlayColor: 'rgba(196, 168, 152, 0.50)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathArabescos',
    textColor: '#FFFFFF',
    duration: 700,
  },
  boho: {
    backgroundImage: '/images/breath/breath-boho.jpg',
    overlayColor: 'rgba(168, 139, 111, 0.50)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathFolhagem',
    textColor: '#FFFFFF',
    duration: 700,
  },
  industrial: {
    backgroundImage: '/images/breath/breath-industrial.jpg',
    overlayColor: 'rgba(92, 83, 74, 0.55)',
    fontFamily: 'var(--font-mono)',
    svgComponent: 'BreathGeometria',
    textColor: '#FFFFFF',
    duration: 700,
  },
  minimalista: {
    backgroundImage: '/images/breath/breath-minimalista.jpg',
    overlayColor: 'rgba(243, 240, 236, 0.40)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathGeometria',
    textColor: '#1A1714',
    duration: 700,
  },
  tropical: {
    backgroundImage: '/images/breath/breath-tropical.jpg',
    overlayColor: 'rgba(74, 124, 95, 0.50)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathFolhagem',
    textColor: '#FFFFFF',
    duration: 700,
  },
  rustico: {
    backgroundImage: '/images/breath/breath-rustico.jpg',
    overlayColor: 'rgba(92, 61, 46, 0.50)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathFolhagem',
    textColor: '#FFFFFF',
    duration: 700,
  },
  moderno: {
    backgroundImage: '/images/breath/breath-moderno.jpg',
    overlayColor: 'rgba(61, 107, 140, 0.50)',
    fontFamily: 'var(--font-mono)',
    svgComponent: 'BreathGeometria',
    textColor: '#FFFFFF',
    duration: 700,
  },
  vintage: {
    backgroundImage: '/images/breath/breath-vintage.jpg',
    overlayColor: 'rgba(139, 111, 94, 0.50)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathArabescos',
    textColor: '#FFFFFF',
    duration: 700,
  },
  praia: {
    backgroundImage: '/images/breath/breath-praia.jpg',
    overlayColor: 'rgba(61, 107, 140, 0.45)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathOndas',
    textColor: '#FFFFFF',
    duration: 700,
  },
  jardim: {
    backgroundImage: '/images/breath/breath-jardim.jpg',
    overlayColor: 'rgba(74, 124, 95, 0.45)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathFolhagem',
    textColor: '#FFFFFF',
    duration: 700,
  },
  glam: {
    backgroundImage: '/images/breath/breath-glam.jpg',
    overlayColor: 'rgba(139, 111, 94, 0.50)',
    fontFamily: 'var(--font-display)',
    svgComponent: 'BreathGlam',
    textColor: '#FFFFFF',
    duration: 700,
  },
};

export const BREATH_CONFIG_BY_BLOCK = {
  A: { defaultStyle: 'classico', label: 'Perfil do Casal' },
  B: { defaultStyle: 'romantico', label: 'Cerimônia' },
  C: { defaultStyle: 'praia', label: 'Local e Estrutura' },
  D: { defaultStyle: 'boho', label: 'Identidade Visual' },
  E: { defaultStyle: 'boho', label: 'Decoração' },
  F: { defaultStyle: 'rustico', label: 'Mesa Posta' },
  G: { defaultStyle: 'romantico', label: 'Cerimônia Detalhada' },
  H: { defaultStyle: 'praia', label: 'Recepção' },
  I: { defaultStyle: 'vintage', label: 'Papelaria' },
  J: { defaultStyle: 'glam', label: 'Vestuário e Beleza' },
  K: { defaultStyle: 'moderno', label: 'Fornecedores' },
  L: { defaultStyle: 'industrial', label: 'Logística' },
  M: { defaultStyle: 'tropical', label: 'Pós-casamento' },
  N: { defaultStyle: 'minimalista', label: 'Documentação' },
};

export function getBreathConfig(estilo, bloco, perfilCasal) {
  const termos = getTermos(perfilCasal);
  const config = BREATH_CONFIG[estilo] || BREATH_CONFIG['classico'];
  const blockConfig = BREATH_CONFIG_BY_BLOCK[bloco] || {};

  return {
    ...config,
    blockLabel: blockConfig.label || '',
    blockLetter: bloco,
    termos,
  };
}

export default { getBreathConfig, BREATH_CONFIG, BREATH_CONFIG_BY_BLOCK };
