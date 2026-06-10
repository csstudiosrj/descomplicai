/**
 * Motor de sugestões automáticas baseadas no estado do memorial
 * @module utils/sugestoes
 */

const MAPA_ESTILO = {
  classico: {
    flores: ['Rosas', 'Orquídeas', 'Hortênsias brancas'],
    iluminacao: { tipo: 'Lustres de cristal + spots quentes', tom: 'quente' },
    velas: ['Castiçais de prata', 'Velas altas em candelabros'],
    mobiliario: { cadeiras: 'Chiavari', mesas: 'Redondas com toalhas longas' },
    toalha: 'Linho branco ou off-white com renda',
    loucas: 'Porcelana fina branca com filete dourado',
    talheres: 'Prata ou dourado clássico',
    tacas: 'Cristal fino transparente',
    centroMesa: 'Arranjo baixo em prata ou cristal',
    guardanapo: 'Linho branco dobrado clássico',
    bolo: 'Clássico branco com flores naturais e detalhes dourados',
    saboresBolo: ['Baunilha com buttercream', 'Nozes com chantilly', 'Limão siciliano'],
    embalagem: 'Caixa branca com fita de cetim e monograma dourado',
    vestido: ['Cauda longa', 'Renda francesa', 'Cetim estruturado'],
    fontes: [{ nome: 'Cormorant Garamond', uso: 'display' }, { nome: 'Playfair Display', uso: 'corpo' }],
    paleta: ['#F5F0EB', '#D4AF37', '#8B6F5E'],
  },
  rustico: {
    flores: ['Girassóis', 'Margaridas', 'Capins e folhagens'],
    iluminacao: { tipo: 'Gambiarra de luzes + velas', tom: 'quente' },
    velas: ['Velas em vidros', 'Lanternas de ferro'],
    mobiliario: { cadeiras: 'Madeira natural ou crossback', mesas: 'Retangulares de madeira rústica' },
    toalha: 'Juta ou linho cru sem toalha (mesa aparente)',
    loucas: 'Cerâmica artesanal ou louça de barro',
    talheres: 'Cobre ou madeira',
    tacas: 'Vidro mason jar ou taças de vidro grosso',
    centroMesa: 'Garrafas de vidro com flores silvestres',
    guardanapo: 'Guardanapo de pano com anel de corda',
    bolo: 'Naked cake com frutas vermelhas e flores comestíveis',
    saboresBolo: ['Naked cake de doce de leite', 'Chocolate com frutas vermelhas', 'Coco com maracujá'],
    embalagem: 'Saco de tecido de algodão com tag de madeira',
    vestido: ['Renda boho', 'Cauda leve', 'Tule natural'],
    fontes: [{ nome: 'Amatic SC', uso: 'display' }, { nome: 'Lora', uso: 'corpo' }],
    paleta: ['#F4E4C1', '#8B6F5E', '#556B2F'],
  },
  boho: {
    flores: ['Ranúnculos', 'Anêmonas', 'Flores secas'],
    iluminacao: { tipo: 'Fairy lights + velas suspensas', tom: 'quente' },
    velas: ['Velas em garrafas coloridas', 'Castiçais de latão'],
    mobiliario: { cadeiras: 'Mix de cadeiras vintage', mesas: 'Mesas baixas com tapetes e puffs' },
    toalha: 'Macramê ou tecido leve em camadas',
    loucas: 'Louça mix and match vintage',
    talheres: 'Dourado envelhecido ou cobre',
    tacas: 'Taças coloridas de vidro soprado',
    centroMesa: 'Arranjo alto e desconstruído em cerâmica artesanal',
    guardanapo: 'Guardanapo de linho com argola de rattan',
    bolo: 'Semi-naked com drip de caramelo e flores secas',
    saboresBolo: ['Lavanda com baunilha', 'Figo com mel', 'Frutas silvestres'],
    embalagem: 'Envelope de papel reciclado com selo de cera',
    vestido: ['Vestido fluido em crepe', 'Renda boho', 'Detalhes em franja'],
    fontes: [{ nome: 'Cormorant Garamond', uso: 'display' }, { nome: 'Josefin Sans', uso: 'corpo' }],
    paleta: ['#E8DCC8', '#C4A898', '#8B6F5E'],
  },
  moderno: {
    flores: ['Copo-de-leite', 'Orquídeas phalaenopsis', 'Folhagem estruturada'],
    iluminacao: { tipo: 'Spots frios + neon sutil', tom: 'frio' },
    velas: [],
    mobiliario: { cadeiras: 'Acrílico transparente ou design escandinavo', mesas: 'Retangulares brancas ou espelhadas' },
    toalha: 'Sem toalha — mesa de espelho ou superfície lisa',
    loucas: 'Louça de design contemporâneo (assimétrica)',
    talheres: 'Inox escovado ou preto fosco',
    tacas: 'Taças finas de cristal moderno',
    centroMesa: 'Escultura floral minimalista em vaso geométrico',
    guardanapo: 'Guardanapo de linho dobrado em formato geométrico',
    bolo: 'Bolo escultural com fondant liso e detalhes geométricos',
    saboresBolo: ['Pistache com chocolate branco', 'Matcha com limão', 'Caramelo salgado'],
    embalagem: 'Caixa preta fosca com hot stamping prata',
    vestido: ['Corte reto minimalista', 'Cetim pesado', 'Decote arquitetônico'],
    fontes: [{ nome: 'Montserrat', uso: 'display' }, { nome: 'Open Sans', uso: 'corpo' }],
    paleta: ['#FFFFFF', '#1A1714', '#C8BFB4'],
  },
  minimalista: {
    flores: ['Copo-de-leite', 'Folhagem única em vaso cerâmico'],
    iluminacao: { tipo: 'Luz natural amplificada', tom: 'neutro' },
    velas: [],
    mobiliario: { cadeiras: 'Madeira clara ou branco puro', mesas: 'Retangulares sem adornos' },
    toalha: 'Sem toalha — mesa de madeira clara aparente',
    loucas: 'Louça branca lisa sem bordas',
    talheres: 'Inox polido simples',
    tacas: 'Vidro fino transparente sem adornos',
    centroMesa: 'Galho único em vaso cilíndrico baixo',
    guardanapo: 'Guardanapo branco dobrado simples',
    bolo: 'Bolo branco liso com uma única flor',
    saboresBolo: ['Baunilha pura', 'Creme brûlée', 'Iogurte com limão'],
    embalagem: 'Papel kraft branco com tipografia minimalista',
    vestido: ['Corte clean em crepe', 'Sem renda', 'Silhueta minimalista'],
    fontes: [{ nome: 'Cormorant Garamond', uso: 'display' }, { nome: 'Inter', uso: 'corpo' }],
    paleta: ['#FFFFFF', '#F3F0EC', '#1A1714'],
  },
  industrial: {
    flores: ['Folhagens secas', 'Musgo', 'Proteas'],
    iluminacao: { tipo: 'Industrial spots + luz de filamento', tom: 'quente' },
    velas: ['Velas em moldes de concreto', 'Lanternas de ferro'],
    mobiliario: { cadeiras: 'Metal + madeira escura', mesas: 'Retangulares de madeira maciça com pés de ferro' },
    toalha: 'Sem toalha ou runner de couro',
    loucas: 'Louça cinza chumbo ou preta fosca',
    talheres: 'Metal escuro ou cobre enferrujado',
    tacas: 'Vidro fumê ou metal',
    centroMesa: 'Terrário com suculentas e velas',
    guardanapo: 'Guardanapo de linho cinza dobrado simples',
    bolo: 'Naked cake com drip de chocolate e flores escuras',
    saboresBolo: ['Chocolate amargo', 'Café com caramelo', 'Cacau com especiarias'],
    embalagem: 'Caixa de cartão kraft com cordel preto',
    vestido: ['Vestido em renda escura', 'Couro sintético', 'Detalhes em metal'],
    fontes: [{ nome: 'Oswald', uso: 'display' }, { nome: 'Roboto', uso: 'corpo' }],
    paleta: ['#2C2C2C', '#8B6F5E', '#C8BFB4'],
  },
  tropical: {
    flores: ['Antúrios', 'Helicônias', 'Costelas-de-adão'],
    iluminacao: { tipo: 'Color wash vibrante + spots quentes', tom: 'quente' },
    velas: [],
    mobiliario: { cadeiras: 'Rattan natural ou bambu', mesas: 'Redondas com toalhas leves' },
    toalha: 'Tecido leve colorido ou estampado tropical',
    loucas: 'Louça colorida artesanal',
    talheres: 'Bambu ou madeira natural',
    tacas: 'Taças de vidro colorido',
    centroMesa: 'Arranjo exuberante com folhagens grandes',
    guardanapo: 'Guardanapo de linho colorido com argola de bambu',
    bolo: 'Bolo branco com flores tropicais e frutas frescas',
    saboresBolo: ['Maracujá com coco', 'Manga com abacaxi', 'Frutas tropicais mistas'],
    embalagem: 'Caixa de palha com fita de tecido colorido',
    vestido: ['Vestido leve em chiffon', 'Detalhes em renda floral', 'Cauda leve'],
    fontes: [{ nome: 'Pacifico', uso: 'display' }, { nome: 'Nunito', uso: 'corpo' }],
    paleta: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
  },
  romantico: {
    flores: ['Rosas rosa', 'Peônias', 'Lisianthus'],
    iluminacao: { tipo: 'Castiçais + spots suaves', tom: 'quente' },
    velas: ['Velas em candelabros de cristal', 'Velas flutuantes'],
    mobiliario: { cadeiras: 'Chiavari branco ou transparente', mesas: 'Redondas com toalhas rosas' },
    toalha: 'Toalha rosa claro ou branco com renda',
    loucas: 'Porcelana branca com detalhes florais',
    talheres: 'Prata ou rosé gold',
    tacas: 'Cristal com pé colorido rosa',
    centroMesa: 'Arranjo baixo e redondo em tons de rosa',
    guardanapo: 'Guardanapo de linho rosa dobrado em leque',
    bolo: 'Bolo branco com flores de açúcar em tons de rosa',
    saboresBolo: ['Rosa com framboesa', 'Morango com champagne', 'Peônia com baunilha'],
    embalagem: 'Caixa rosa com fita de cetim e flor de seda',
    vestido: ['Princesa com saia volumosa', 'Renda de chantilly', 'Cauda longa'],
    fontes: [{ nome: 'Great Vibes', uso: 'display' }, { nome: 'Lora', uso: 'corpo' }],
    paleta: ['#F8E1E4', '#FFB7C5', '#8B6F5E'],
  },
  gotico: {
    flores: ['Rosas escuras', 'Dálias negras', 'Callas'],
    iluminacao: { tipo: 'Spots dramáticos + luzes frias', tom: 'frio' },
    velas: ['Velas pretas', 'Candelabros góticos'],
    mobiliario: { cadeiras: 'Preto veludo ou madeira escura entalhada', mesas: 'Retangulares em madeira escura' },
    toalha: 'Veludo preto ou cinza chumbo',
    loucas: 'Louça preta fosca ou cinza',
    talheres: 'Preto fosco ou prata envelhecida',
    tacas: 'Cristal escuro ou vidro fumê',
    centroMesa: 'Arranjo escuro com velas negras e rosas vermelhas',
    guardanapo: 'Guardanapo de linho cinza escuro',
    bolo: 'Bolo preto com drip de prata e flores escuras',
    saboresBolo: ['Chocolate negro com mirtilo', 'Ameixa com especiarias', 'Veludo negro'],
    embalagem: 'Caixa preta com fita de veludo e selo de cera negra',
    vestido: ['Vestido escuro em renda', 'Detalhes em veludo', 'Cauda dramática'],
    fontes: [{ nome: 'Cinzel Decorative', uso: 'display' }, { nome: 'Crimson Text', uso: 'corpo' }],
    paleta: ['#1A1714', '#4A0E0E', '#C8BFB4'],
  },
  vintage: {
    flores: ['Lavanda', 'Ranúnculos', 'Gypsofila'],
    iluminacao: { tipo: 'Edison bulbs + spots quentes', tom: 'quente' },
    velas: ['Velas em castiçais de latão antigo', 'Lanternas vintage'],
    mobiliario: { cadeiras: 'Cadeiras mistas vintage', mesas: 'Redondas com toalhas de renda' },
    toalha: 'Renda ou linho envelhecido',
    loucas: 'Porcelana vintage com estampa floral',
    talheres: 'Prata antiga ou dourado envelhecido',
    tacas: 'Cristal vintage colorido',
    centroMesa: 'Arranjo em vaso de porcelana antiga',
    guardanapo: 'Guardanapo de linho com renda e anel vintage',
    bolo: 'Bolo branco com detalhes em renda comestível e flores vintage',
    saboresBolo: ['Bem-casado', 'Creme de confeiteiro com amêndoas', 'Baunilha com caramelo'],
    embalagem: 'Caixa de papel envelhecido com renda e tag vintage',
    vestido: ['Renda vintage', 'Cauda leve', 'Detalhes em pérolas'],
    fontes: [{ nome: 'Cormorant Garamond', uso: 'display' }, { nome: 'EB Garamond', uso: 'corpo' }],
    paleta: ['#E6E6FA', '#D8BFD8', '#8B6F5E'],
  },
};

/**
 * Sugere flores com base no estilo escolhido
 * @param {string} estilo
 * @returns {string[]}
 */
export function sugerirFlores(estilo) {
  return MAPA_ESTILO[estilo]?.flores || [];
}

/**
 * Sugere iluminação com base no estilo e horário
 * @param {string} estilo
 * @param {string} horario — 'diurno' | 'por-do-sol' | 'noturno'
 * @returns {{tipo: string, tom: string}}
 */
export function sugerirIluminacao(estilo, horario) {
  const base = MAPA_ESTILO[estilo]?.iluminacao || { tipo: 'Spots quentes', tom: 'quente' };
  if (horario === 'diurno') return { ...base, tipo: `${base.tipo} (complementar à luz natural)` };
  if (horario === 'por-do-sol') return { ...base, tipo: `${base.tipo} (golden hour integrado)` };
  return base;
}

/**
 * Sugere tipos de velas com base no estilo
 * @param {string} estilo
 * @returns {string[]}
 */
export function sugerirVelas(estilo) {
  return MAPA_ESTILO[estilo]?.velas || [];
}

/**
 * Sugere mobiliário com base no estilo
 * @param {string} estilo
 * @returns {{cadeiras: string, mesas: string}}
 */
export function sugerirMobiliario(estilo) {
  return MAPA_ESTILO[estilo]?.mobiliario || { cadeiras: 'Padrão', mesas: 'Padrão' };
}

/**
 * Sugere toalha com base no estilo e paleta
 * @param {string} estilo
 * @param {string[]} paleta
 * @returns {string}
 */
export function sugerirToalha(estilo, paleta) {
  return MAPA_ESTILO[estilo]?.toalha || 'Toalha branca clássica';
}

/**
 * Sugere louças com base no estilo
 * @param {string} estilo
 * @returns {string}
 */
export function sugerirLoucas(estilo) {
  return MAPA_ESTILO[estilo]?.loucas || 'Louça branca padrão';
}

/**
 * Sugere talheres com base na paleta (temperatura das cores)
 * @param {string[]} paleta
 * @returns {string}
 */
export function sugerirTalheres(paleta) {
  if (!paleta || paleta.length === 0) return 'Talheres em inox';
  const corBase = paleta[0].toLowerCase();
  if (corBase.includes('ff') || corBase.includes('d4af') || corBase.includes('c8a')) return 'Dourado';
  if (corBase.includes('00') || corBase.includes('1a17') || corBase.includes('2c2c')) return 'Preto fosco';
  return 'Inox polido';
}

/**
 * Sugere taças com base no estilo
 * @param {string} estilo
 * @returns {string}
 */
export function sugerirTacas(estilo) {
  return MAPA_ESTILO[estilo]?.tacas || 'Taças de cristal';
}

/**
 * Sugere centro de mesa com base no estilo e pé direito
 * @param {string} estilo
 * @param {boolean} peeDireito — se o local tem pé direito alto
 * @returns {string}
 */
export function sugerirCentroMesa(estilo, peeDireito) {
  const base = MAPA_ESTILO[estilo]?.centroMesa || 'Arranjo floral clássico';
  if (peeDireito) return `${base} (arranjo alto permitido pelo pé direito)`;
  return `${base} (arranjo baixo para conversação)`;
}

/**
 * Sugere guardanapo com base no estilo
 * @param {string} estilo
 * @returns {string}
 */
export function sugerirGuardanapo(estilo) {
  return MAPA_ESTILO[estilo]?.guardanapo || 'Guardanapo de linho branco';
}

/**
 * Sugere bolo com base no estilo
 * @param {string} estilo
 * @returns {string}
 */
export function sugerirBolo(estilo) {
  return MAPA_ESTILO[estilo]?.bolo || 'Bolo branco clássico';
}

/**
 * Sugere sabores de bolo com base no estilo
 * @param {string} estilo
 * @returns {string[]}
 */
export function sugerirSaboresBolo(estilo) {
  return MAPA_ESTILO[estilo]?.saboresBolo || [];
}

/**
 * Sugere embalagem para bem-casados com base no estilo
 * @param {string} estilo
 * @returns {string}
 */
export function sugerirEmbalagem(estilo) {
  return MAPA_ESTILO[estilo]?.embalagem || 'Caixa branca clássica';
}

/**
 * Sugere opções de vestido/traje com base no estilo e perfil do casal
 * @param {string} estilo
 * @param {string} perfilCasal — 'noiva-noivo' | 'duas-noivas' | 'dois-noivos' | 'nao-especificar'
 * @returns {string[]}
 */
export function sugerirVestido(estilo, perfilCasal) {
  const base = MAPA_ESTILO[estilo]?.vestido || ['Clássico'];
  if (perfilCasal === 'dois-noivos') {
    return ['Terno slim', 'Smoking moderno', 'Traje de linho (se praia)'];
  }
  if (perfilCasal === 'duas-noivas') {
    return [...base, 'Vestido complementar para segunda noiva'];
  }
  return base;
}

/**
 * Sugere fontes com base no estilo
 * @param {string} estilo
 * @returns {{nome: string, uso: 'display'|'corpo'}[]}
 */
export function sugerirFontes(estilo) {
  return MAPA_ESTILO[estilo]?.fontes || [{ nome: 'Cormorant Garamond', uso: 'display' }, { nome: 'DM Sans', uso: 'corpo' }];
}

/**
 * Sugere paleta de 3 cores com base no estilo
 * @param {string} estilo
 * @returns {string[]}
 */
export function sugerirPaleta(estilo) {
  return MAPA_ESTILO[estilo]?.paleta || ['#FFFFFF', '#F3F0EC', '#1A1714'];
}