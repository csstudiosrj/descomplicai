// utils/sugestoes.js — Sugestões por estilo com múltiplos pares de fontes

import { getPaleta as getPaletaFromPaletas } from './paletas';

// ============================================================
// MAPA_ESTILO — Cada estilo tem 3-6 opções de pares de fontes
// O casal escolhe a combinação que mais gosta
// ============================================================
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
    fontes: [
      {
        id: 'classico-1',
        nome: 'Elegância Real',
        display: { nome: 'Cormorant Garamond', uso: 'display' },
        corpo: { nome: 'Playfair Display', uso: 'corpo' },
      },
      {
        id: 'classico-2',
        nome: 'Tradição Atemporal',
        display: { nome: 'EB Garamond', uso: 'display' },
        corpo: { nome: 'Crimson Text', uso: 'corpo' },
      },
      {
        id: 'classico-3',
        nome: 'Sofisticação Clássica',
        display: { nome: 'Cormorant Garamond', uso: 'display' },
        corpo: { nome: 'Libre Baskerville', uso: 'corpo' },
      },
      {
        id: 'classico-4',
        nome: 'Refinamento Editorial',
        display: { nome: 'Playfair Display', uso: 'display' },
        corpo: { nome: 'Source Serif 4', uso: 'corpo' },
      },
      {
        id: 'classico-5',
        nome: 'Alta Costura',
        display: { nome: 'Italiana', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
      {
        id: 'classico-6',
        nome: 'Herança Real',
        display: { nome: 'Cinzel', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('classico').cores,
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
    fontes: [
      {
        id: 'rustico-1',
        nome: 'Campestre Autêntico',
        display: { nome: 'Amatic SC', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'rustico-2',
        nome: 'Floresta Encantada',
        display: { nome: 'Dancing Script', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'rustico-3',
        nome: 'Jardim Secreto',
        display: { nome: 'Parisienne', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'rustico-4',
        nome: 'Carta do Campo',
        display: { nome: 'Sacramento', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'rustico-5',
        nome: 'Piquenique',
        display: { nome: 'Satisfy', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('rustico').cores,
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
    fontes: [
      {
        id: 'boho-1',
        nome: 'Alma Livre',
        display: { nome: 'Cormorant Garamond', uso: 'display' },
        corpo: { nome: 'Josefin Sans', uso: 'corpo' },
      },
      {
        id: 'boho-2',
        nome: 'Brisa do Deserto',
        display: { nome: 'Dancing Script', uso: 'display' },
        corpo: { nome: 'Josefin Sans', uso: 'corpo' },
      },
      {
        id: 'boho-3',
        nome: 'Pétalas ao Vento',
        display: { nome: 'Parisienne', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'boho-4',
        nome: 'Maré Boho',
        display: { nome: 'Satisfy', uso: 'display' },
        corpo: { nome: 'Josefin Sans', uso: 'corpo' },
      },
      {
        id: 'boho-5',
        nome: 'Free Spirit',
        display: { nome: 'Sacramento', uso: 'display' },
        corpo: { nome: 'Plus Jakarta Sans', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('boho').cores,
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
    fontes: [
      {
        id: 'moderno-1',
        nome: 'Linhas Puras',
        display: { nome: 'Montserrat', uso: 'display' },
        corpo: { nome: 'Open Sans', uso: 'corpo' },
      },
      {
        id: 'moderno-2',
        nome: 'Contraste Bold',
        display: { nome: 'Oswald', uso: 'display' },
        corpo: { nome: 'Roboto', uso: 'corpo' },
      },
      {
        id: 'moderno-3',
        nome: 'Nordico Clean',
        display: { nome: 'Montserrat', uso: 'display' },
        corpo: { nome: 'Inter', uso: 'corpo' },
      },
      {
        id: 'moderno-4',
        nome: 'Arquitetura Viva',
        display: { nome: 'Bebas Neue', uso: 'display' },
        corpo: { nome: 'Outfit', uso: 'corpo' },
      },
      {
        id: 'moderno-5',
        nome: 'Design Contemporâneo',
        display: { nome: 'Yeseva One', uso: 'display' },
        corpo: { nome: 'Plus Jakarta Sans', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('moderno').cores,
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
    fontes: [
      {
        id: 'minimalista-1',
        nome: 'Essência',
        display: { nome: 'Cormorant Garamond', uso: 'display' },
        corpo: { nome: 'Inter', uso: 'corpo' },
      },
      {
        id: 'minimalista-2',
        nome: 'Geometria Pura',
        display: { nome: 'Montserrat', uso: 'display' },
        corpo: { nome: 'Inter', uso: 'corpo' },
      },
      {
        id: 'minimalista-3',
        nome: 'Silencio Visual',
        display: { nome: 'Oswald', uso: 'display' },
        corpo: { nome: 'Open Sans', uso: 'corpo' },
      },
      {
        id: 'minimalista-4',
        nome: 'Essência Digital',
        display: { nome: 'Outfit', uso: 'display' },
        corpo: { nome: 'Inter', uso: 'corpo' },
      },
      {
        id: 'minimalista-5',
        nome: 'Linha Fina',
        display: { nome: 'Poiret One', uso: 'display' },
        corpo: { nome: 'Outfit', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('minimalista').cores,
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
    fontes: [
      {
        id: 'industrial-1',
        nome: 'Fabrica Raw',
        display: { nome: 'Oswald', uso: 'display' },
        corpo: { nome: 'Roboto', uso: 'corpo' },
      },
      {
        id: 'industrial-2',
        nome: 'Metal e Tinta',
        display: { nome: 'Montserrat', uso: 'display' },
        corpo: { nome: 'Roboto', uso: 'corpo' },
      },
      {
        id: 'industrial-3',
        nome: 'Estilo Loft',
        display: { nome: 'Oswald', uso: 'display' },
        corpo: { nome: 'Open Sans', uso: 'corpo' },
      },
      {
        id: 'industrial-4',
        nome: 'Estúdio Raw',
        display: { nome: 'Bebas Neue', uso: 'display' },
        corpo: { nome: 'Roboto', uso: 'corpo' },
      },
      {
        id: 'industrial-5',
        nome: 'Concreto e Aço',
        display: { nome: 'Yeseva One', uso: 'display' },
        corpo: { nome: 'Roboto', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('industrial').cores,
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
    fontes: [
      {
        id: 'tropical-1',
        nome: 'Onda Tropical',
        display: { nome: 'Pacifico', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'tropical-2',
        nome: 'Brisa de Verão',
        display: { nome: 'Dancing Script', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'tropical-3',
        nome: 'Coqueiro ao Vento',
        display: { nome: 'Great Vibes', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'tropical-4',
        nome: 'Pôr do Sol',
        display: { nome: 'Sacramento', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'tropical-5',
        nome: 'Praia Viva',
        display: { nome: 'Satisfy', uso: 'display' },
        corpo: { nome: 'Quicksand', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('tropical').cores,
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
    fontes: [
      {
        id: 'romantico-1',
        nome: 'Amor Eterno',
        display: { nome: 'Great Vibes', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'romantico-2',
        nome: 'Carta de Amor',
        display: { nome: 'Parisienne', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'romantico-3',
        nome: 'Sonho de Princesa',
        display: { nome: 'Dancing Script', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'romantico-4',
        nome: 'Conto de Fadas',
        display: { nome: 'Great Vibes', uso: 'display' },
        corpo: { nome: 'Libre Baskerville', uso: 'corpo' },
      },
      {
        id: 'romantico-5',
        nome: 'Jardim de Rosas',
        display: { nome: 'Sacramento', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'romantico-6',
        nome: 'Sonho Dourado',
        display: { nome: 'Satisfy', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('romantico').cores,
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
    fontes: [
      {
        id: 'gotico-1',
        nome: 'Noite Eterna',
        display: { nome: 'Cinzel Decorative', uso: 'display' },
        corpo: { nome: 'Crimson Text', uso: 'corpo' },
      },
      {
        id: 'gotico-2',
        nome: 'Castelo Sombrio',
        display: { nome: 'Cinzel Decorative', uso: 'display' },
        corpo: { nome: 'EB Garamond', uso: 'corpo' },
      },
      {
        id: 'gotico-3',
        nome: 'Veludo Negro',
        display: { nome: 'Oswald', uso: 'display' },
        corpo: { nome: 'Crimson Text', uso: 'corpo' },
      },
      {
        id: 'gotico-4',
        nome: 'Catedral Noturna',
        display: { nome: 'UnifrakturMaguntia', uso: 'display' },
        corpo: { nome: 'Crimson Text', uso: 'corpo' },
      },
      {
        id: 'gotico-5',
        nome: 'Mistério Medieval',
        display: { nome: 'Cinzel', uso: 'display' },
        corpo: { nome: 'EB Garamond', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('gotico').cores,
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
    fontes: [
      {
        id: 'vintage-1',
        nome: 'Tempo de Ouro',
        display: { nome: 'Cormorant Garamond', uso: 'display' },
        corpo: { nome: 'EB Garamond', uso: 'corpo' },
      },
      {
        id: 'vintage-2',
        nome: 'Poeira de Estrelas',
        display: { nome: 'Playfair Display', uso: 'display' },
        corpo: { nome: 'Crimson Text', uso: 'corpo' },
      },
      {
        id: 'vintage-3',
        nome: 'Memoria de Lavanda',
        display: { nome: 'Cormorant Garamond', uso: 'display' },
        corpo: { nome: 'Libre Baskerville', uso: 'corpo' },
      },
      {
        id: 'vintage-4',
        nome: 'Hollywood Dourada',
        display: { nome: 'Limelight', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
      {
        id: 'vintage-5',
        nome: 'Art Deco Revival',
        display: { nome: 'Poiret One', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('vintage').cores,
  },
  artdeco: {
    flores: ['Orquídeas brancas', 'Rosas de jardim', 'Anémonas'],
    iluminacao: { tipo: 'Lustres art deco + velas douradas', tom: 'quente' },
    velas: ['Castiçais geométricos dourados', 'Velas altas em candelabros'],
    mobiliario: { cadeiras: 'Veludo com costura channel', mesas: 'Redondas com toalhas seda' },
    toalha: 'Seda ou cetim com bordado geométrico',
    loucas: 'Porcelana branca com filete preto e dourado',
    talheres: 'Dourado art deco com cabo geométrico',
    tacas: 'Cristal com corte diamante',
    centroMesa: 'Arranjo baixo em vasos geométricos dourados',
    guardanapo: 'Seda dobrado em leque',
    bolo: 'Branco com detalhes geométricos dourados e espelhados',
    saboresBolo: ['Champagne', 'Baunilha com ouro comestível', 'Framboesa'],
    embalagem: 'Caixa preta com hot stamping dourado geométrico',
    vestido: ['Corte sereia em cetim', 'Decote profundo nas costas', 'Detalhes em franja art deco'],
    fontes: [
      {
        id: 'artdeco-1',
        nome: 'Gatsby',
        display: { nome: 'Limelight', uso: 'display' },
        corpo: { nome: 'Poiret One', uso: 'corpo' },
      },
      {
        id: 'artdeco-2',
        nome: 'Grande Hotel',
        display: { nome: 'Poiret One', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('artdeco').cores,
  },
  praia: {
    flores: ['Orquídeas brancas', 'Estrelas-do-mar secas', 'Folhagens tropicais'],
    iluminacao: { tipo: 'Lanternas de papel + luzes de corda', tom: 'quente' },
    velas: ['Velas em conchas', 'Lanternas de vidro com areia'],
    mobiliario: { cadeiras: 'Cadeiras de bambu ou madeira clara', mesas: 'Mesas redondas com toalhas leves' },
    toalha: 'Linho cru ou gaze branca',
    loucas: 'Louça branca com detalhes azul-mar',
    talheres: 'Bambu ou madeira natural',
    tacas: 'Taças de vidro fino transparente',
    centroMesa: 'Arranjo com conchas e velas flutuantes em garrafas de vidro com ramos de folhagem',
    guardanapo: 'Guardanapo de linho branco com argola de corda',
    bolo: 'Bolo branco com detalhes em azul-mar e conchas de açúcar',
    saboresBolo: ['Coco com abacaxi', 'Limão com maracujá', 'Baunilha com frutas tropicais'],
    embalagem: 'Caixa de palha com fita de juta e concha',
    vestido: ['Vestido leve em chiffon', 'Cauda curta', 'Detalhes em renda'],
    fontes: [
      {
        id: 'praia-1',
        nome: 'Brisa do Mar',
        display: { nome: 'Great Vibes', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'praia-2',
        nome: 'Onda Suave',
        display: { nome: 'Dancing Script', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'praia-3',
        nome: 'Pôr do Sol',
        display: { nome: 'Sacramento', uso: 'display' },
        corpo: { nome: 'Quicksand', uso: 'corpo' },
      },
      {
        id: 'praia-4',
        nome: 'Coqueiro',
        display: { nome: 'Satisfy', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'praia-5',
        nome: 'Tropical Breeze',
        display: { nome: 'Pacifico', uso: 'display' },
        corpo: { nome: 'Quicksand', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('praia').cores,
  },
  jardim: {
    flores: ['Hortênsias', 'Peônias', 'Rosas inglesas', 'Folhagens diversas'],
    iluminacao: { tipo: 'Fairy lights em árvores + velas em garrafas', tom: 'quente' },
    velas: ['Velas em potes de vidro com musgo', 'Lanternas de ferro enferrujado'],
    mobiliario: { cadeiras: 'Cadeiras de ferro branco ou madeira natural', mesas: 'Mesas redondas com toalhas de linho verde' },
    toalha: 'Linho verde-claro ou branco com estampa floral',
    loucas: 'Louça branca com detalhes em verde',
    talheres: 'Prata antiga ou dourado envelhecido',
    tacas: 'Cristal fino com pé verde',
    centroMesa: 'Arranjo alto em vaso de cerâmica artesanal com terrário de suculentas e velas',
    guardanapo: 'Guardanapo de linho verde com argola de rattan',
    bolo: 'Bolo branco com flores naturais comestíveis e folhagem',
    saboresBolo: ['Limão com hortelã', 'Baunilha com flores', 'Chá verde com maracujá'],
    embalagem: 'Caixa de papel reciclado com semente de flor e fita de juta',
    vestido: ['Vestido em renda floral', 'Cauda leve com folhagem', 'Tule natural'],
    fontes: [
      {
        id: 'jardim-1',
        nome: 'Jardim Secreto',
        display: { nome: 'Parisienne', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'jardim-2',
        nome: 'Flores ao Vento',
        display: { nome: 'Sacramento', uso: 'display' },
        corpo: { nome: 'Josefin Sans', uso: 'corpo' },
      },
      {
        id: 'jardim-3',
        nome: 'Bosque Encantado',
        display: { nome: 'Satisfy', uso: 'display' },
        corpo: { nome: 'Lora', uso: 'corpo' },
      },
      {
        id: 'jardim-4',
        nome: 'Primavera',
        display: { nome: 'Dancing Script', uso: 'display' },
        corpo: { nome: 'Nunito', uso: 'corpo' },
      },
      {
        id: 'jardim-5',
        nome: 'Orvalho',
        display: { nome: 'Great Vibes', uso: 'display' },
        corpo: { nome: 'Josefin Sans', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('jardim').cores,
  },
  glam: {
    flores: ['Orquídeas phalaenopsis brancas', 'Rosas vermelhas', 'Lírios'],
    iluminacao: { tipo: 'Lustres de cristal + spots dourados + velas em candelabros', tom: 'quente' },
    velas: ['Velas altas em candelabros de cristal', 'Velas flutuantes em espelhos'],
    mobiliario: { cadeiras: 'Cadeiras de veludo dourado ou acrílico transparente', mesas: 'Mesas redondas com toalhas de cetim dourado' },
    toalha: 'Cetim dourado ou preto com bordado em ouro',
    loucas: 'Porcelana branca com filete dourado e detalhes em cristal',
    talheres: 'Dourado brilhante ou rosé gold',
    tacas: 'Cristal com corte diamante e pé dourado',
    centroMesa: 'Arranjo alto em vasos de vidro espelhado com candelabros de cristal e velas',
    guardanapo: 'Guardanapo de seda dourado dobrado em leque',
    bolo: 'Bolo branco com drip de ouro comestível e flores de açúcar',
    saboresBolo: ['Champagne', 'Baunilha com ouro', 'Framboesa com chocolate branco'],
    embalagem: 'Caixa preta com hot stamping dourado e fita de cetim',
    vestido: ['Vestido de sereia em cetim', 'Decote profundo', 'Detalhes em cristais'],
    fontes: [
      {
        id: 'glam-1',
        nome: 'Hollywood',
        display: { nome: 'Cinzel Decorative', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
      {
        id: 'glam-2',
        nome: 'Tapete Vermelho',
        display: { nome: 'Limelight', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
      {
        id: 'glam-3',
        nome: 'Alta Costura',
        display: { nome: 'Playfair Display', uso: 'display' },
        corpo: { nome: 'EB Garamond', uso: 'corpo' },
      },
      {
        id: 'glam-4',
        nome: 'Diamante',
        display: { nome: 'Italiana', uso: 'display' },
        corpo: { nome: 'Cormorant Infant', uso: 'corpo' },
      },
      {
        id: 'glam-5',
        nome: 'Oscar',
        display: { nome: 'Yeseva One', uso: 'display' },
        corpo: { nome: 'Playfair Display', uso: 'corpo' },
      },
    ],
    paleta: getPaletaFromPaletas('glam').cores,
  },
};

// ============================================================
// SUGESTOES_APROFUNDAMENTO — Sugestões para nós específicos do memorial
// ============================================================

const SUGESTOES_APROFUNDAMENTO = {
  // MÚSICA
  musicaEntretenimento: {
    tipos: ['DJ profissional', 'Banda ao vivo', 'Playlist própria com som contratado', 'String quartet', 'DJ + banda híbrido'],
    equipamento: ['Som completo com iluminação', 'Som básico', 'Som + iluminação de pista', 'Som + projeção'],
    horario: ['Durante toda a festa', 'Apenas na pista', 'Durante o coquetel', 'Apenas no jantar'],
  },
  musicaCerimonia: {
    entrada: ['Marcha nupcial clássica', 'Música escolhida pelo casal', 'Violinista solo', 'Coral', 'Harpa'],
    saida: ['Música alegre e festiva', 'Marcha nupcial', 'Música escolhida', 'Banda'],
    trocaAliancas: ['Silêncio', 'Música suave', 'Violino', 'Harpa'],
  },
  // PALCO E ESTRUTURA
  palco: {
    tipo: ['Palco tradicional', 'Palco circular', 'Palco em T', 'Sem palco (pista aberta)', 'Palco suspenso'],
    iluminacao: ['Spots coloridos', 'Luz branca', 'Projeção mapeada', 'Fairy lights', 'Nenhuma (luz ambiente)'],
  },
  // GASTRONOMIA
  buffet: {
    tipoServico: ['Servido à mesa', 'Estação (buffet)', 'Finger food / coquetel', 'Rodízio', 'Mix (servido + estação)'],
    degustacao: ['Sim, com menu definido', 'Sim, menu a definir', 'Não'],
    cardapio: ['Clássico brasileiro', 'Internacional', 'Regional', 'Vegetariano/Vegano', 'Fusion'],
  },
  mesaDoces: {
    tipo: ['Mesa tradicional com doces finos', 'Candy bar colorido', 'Mesa de sobremesas', 'Mesa de queijos', 'Sem mesa de doces'],
    estilo: ['Clássico', 'Moderno', 'Temático', 'Minimalista'],
  },
  // FOTO & FILME
  fotografia: {
    estilo: ['Fotossocial (clássico)', 'Fine art (artístico)', 'Documental (jornalístico)', 'Editorial (moda)', 'Lifestyle (natural)'],
    servicos: ['Pré-wedding', 'Making-of noivo', 'Making-of noiva', 'Ensaio pós-casamento', 'Álbum físico', 'Revelação em canvas'],
  },
  filmagem: {
    estilo: ['Cinematic (cinema)', 'Documental', 'Same-day edit', 'Teaser para redes', 'Filme longo (20+ min)'],
    extras: ['Drone', 'Making-of', 'Entrevistas com convidados', 'Projeção durante a festa'],
  },
  // VESTUÁRIO
  vestidoNoiva: {
    estilo: ['Sereia', 'Princesa (volumosa)', 'Evasê', 'Slip dress', 'Corte reto', 'Curto'],
    tecido: ['Renda', 'Cetim', 'Tule', 'Crepe', 'Organza', 'Mikado'],
    cor: ['Branco puro', 'Off-white', 'Champagne', 'Rosé', 'Azul claro'],
    cauda: ['Longa (2m+)', 'Média (1m)', 'Curta', 'Removível', 'Sem cauda'],
  },
  trajeNoivo: {
    estilo: ['Smoking clássico', 'Fraque', 'Terno slim', 'Terno tradicional', 'Esporte fino'],
    cor: ['Preto', 'Azul marinho', 'Cinza', 'Bege', 'Branco'],
    acessorio: ['Gravata', 'Laço', 'Sem gravata', 'Suspensório', 'Lenço de bolso'],
  },
  // DECORAÇÃO
  decoracao: {
    estilo: ['Suspensa (lustres, flores pendentes)', 'Mesa (centros, runners)', 'Parede (painel, backdrop)', 'Piso (tapetes, petalas)', 'Mix completo'],
    material: ['Flores naturais', 'Flores secas', 'Velas', 'Tecidos', 'Luzes', 'Papel / papelaria'],
  },
  // LOGÍSTICA
  transporteNoivos: {
    tipo: ['Carro clássico', 'Limousine', 'Carro esportivo', 'Carroça', 'Barco', 'Helicóptero', 'Carro próprio'],
    decoracao: ['Flores naturais', 'Fitas', 'Placa personalizada', 'Sem decoração'],
  },
  transporteConvidados: {
    tipo: ['Ônibus fretado', 'Van', 'Estacionamento com manobrista', 'Carona compartilhada', 'Sem transporte'],
  },
  // PAPELARIA
  convites: {
    formato: ['Digital (e-mail / WhatsApp)', 'Impresso tradicional', 'Letterpress', 'Hot stamping', 'Convite individual + RSVP'],
    prazo: ['6 meses antes', '4 meses antes', '3 meses antes', '2 meses antes'],
  },
  lembrancinhas: {
    tipo: ['Comestível (bem-casado, brigadeiro)', 'Planta / semente', 'Vela personalizada', 'Item utilitário (chaveiro, porta-retrato)', 'Doação em nome dos noivos'],
  },
  // CERIMÔNIA
  celebrante: {
    tipo: ['Padre / religioso', 'Celebrante laico', 'Amigo / familiar', 'Rabino', 'Juiz de paz'],
    roteiro: ['Tradicional', 'Personalizado', 'Mix (tradicional + personalizações)'],
  },
  // LUA DE MEL
  luaDeMel: {
    tipo: ['Praia nacional', 'Praia internacional', 'Cidade histórica', 'Montanha / natureza', 'Cruzeiro', 'Road trip'],
    duracao: ['3-5 dias', '1 semana', '10-15 dias', '2+ semanas'],
  },
};

// ============================================================
// FUNCOES DE SUGESTAO — Compatibilidade + Expansao
// ============================================================

/**
 * Sugere o PRIMEIRO par de fontes do estilo (compatibilidade com codigo antigo)
 * Retorna formato antigo: array de 2 objetos [{nome, uso}, {nome, uso}]
 * @param {string} estilo
 * @returns {Array<{nome: string, uso: string}>}
 */
export function sugerirFontes(estilo) {
  const opcoes = MAPA_ESTILO[estilo]?.fontes;
  if (!opcoes || opcoes.length === 0) {
    return [
      { nome: 'Cormorant Garamond', uso: 'display' },
      { nome: 'DM Sans', uso: 'corpo' },
    ];
  }
  const primeiro = opcoes[0];
  return [
    { nome: primeiro.display.nome, uso: primeiro.display.uso },
    { nome: primeiro.corpo.nome, uso: primeiro.corpo.uso },
  ];
}

/**
 * Retorna TODAS as opcoes de pares de fontes para um estilo
 * Usado pelo novo step de escolha de fontes
 * @param {string} estilo
 * @returns {Array<{id: string, nome: string, display: object, corpo: object}>}
 */
export function sugerirOpcoesFontes(estilo) {
  return MAPA_ESTILO[estilo]?.fontes || [];
}

/**
 * Retorna um par especifico de fontes pelo ID
 * Usado quando o casal ja escolheu uma combinacao
 * @param {string} estilo
 * @param {string} parId
 * @returns {object|null}
 */
export function getParFontes(estilo, parId) {
  const opcoes = MAPA_ESTILO[estilo]?.fontes;
  if (!opcoes) return null;
  return opcoes.find((par) => par.id === parId) || opcoes[0] || null;
}

/**
 * Retorna a classe CSS para um par de fontes
 * Usada pelo VisualEngine para aplicar a fonte dinamicamente
 * @param {string} estilo
 * @param {string} parId
 * @returns {string}
 */
export function getClasseFonte(estilo, parId) {
  if (!estilo || !parId) return '';
  return `fonte-par-${estilo}-${parId.split('-').pop()}`;
}

// ============================================================
// FUNCOES EXISTENTES (mantidas para compatibilidade)
// ============================================================

export function sugerirFlores(estilo) {
  return MAPA_ESTILO[estilo]?.flores || [];
}

export function sugerirIluminacao(estilo, horario) {
  const base = MAPA_ESTILO[estilo]?.iluminacao || { tipo: 'Spots quentes', tom: 'quente' };
  if (horario && (horario.includes('noite') || horario.includes('tarde'))) {
    return { ...base, intensidade: 'forte' };
  }
  return base;
}

export function sugerirVelas(estilo) {
  return MAPA_ESTILO[estilo]?.velas || [];
}

export function sugerirMobiliario(estilo) {
  return MAPA_ESTILO[estilo]?.mobiliario || { cadeiras: 'Padrão', mesas: 'Padrão' };
}

export function sugerirToalha(estilo) {
  return MAPA_ESTILO[estilo]?.toalha || 'Toalha branca clássica';
}

export function sugerirLoucas(estilo) {
  return MAPA_ESTILO[estilo]?.loucas || 'Louça branca padrão';
}

export function sugerirTalheres(estilo) {
  return MAPA_ESTILO[estilo]?.talheres || 'Talheres de inox';
}

export function sugerirTacas(estilo) {
  return MAPA_ESTILO[estilo]?.tacas || 'Taças de cristal';
}

export function sugerirCentroMesa(estilo, flores) {
  const base = MAPA_ESTILO[estilo]?.centroMesa || 'Arranjo floral clássico';
  if (flores && flores.length > 0) {
    return `${base} com ${flores[0].toLowerCase()}`;
  }
  return base;
}

export function sugerirGuardanapo(estilo) {
  return MAPA_ESTILO[estilo]?.guardanapo || 'Guardanapo de linho branco';
}

export function sugerirBolo(estilo) {
  return MAPA_ESTILO[estilo]?.bolo || 'Bolo branco clássico';
}

export function sugerirSaboresBolo(estilo) {
  return MAPA_ESTILO[estilo]?.saboresBolo || [];
}

export function sugerirEmbalagem(estilo) {
  return MAPA_ESTILO[estilo]?.embalagem || 'Caixa branca clássica';
}

export function sugerirVestido(estilo) {
  return MAPA_ESTILO[estilo]?.vestido || ['Clássico'];
}

/**
 * Retorna a paleta de cores de um estilo
 * @param {string} estilo
 * @returns {Array<string>}
 */
export function getPaleta(estilo) {
  return MAPA_ESTILO[estilo]?.paleta || ['#F5F0EB', '#D4AF37', '#8B6F5E'];
}

/**
 * Alias para compatibilidade com componentes que importam sugerirPaleta
 * @param {string} estilo
 * @returns {Array<string>}
 */
export function sugerirPaleta(estilo) {
  return getPaleta(estilo);
}

// ============================================================
// FUNCOES DE APROFUNDAMENTO
// ============================================================

/**
 * Retorna sugestões de aprofundamento para uma categoria e subcategoria específicas.
 *
 * @param {string} categoria — chave principal (ex: 'musicaEntretenimento', 'vestidoNoiva')
 * @param {string} subcategoria — chave interna (ex: 'tipos', 'estilo', 'cor')
 * @returns {Array<string>} — array de sugestões, ou array vazio se não encontrar
 *
 * @example
 * import { sugerirAprofundamento } from '../utils/sugestoes';
 * const tipos = sugerirAprofundamento('musicaEntretenimento', 'tipos');
 * // ['DJ profissional', 'Banda ao vivo', ...]
 */
export function sugerirAprofundamento(categoria, subcategoria) {
  const cat = SUGESTOES_APROFUNDAMENTO[categoria];
  if (!cat) {
    console.warn(`[sugestoes] Categoria de aprofundamento "${categoria}" não encontrada.`);
    return [];
  }
  const sub = cat[subcategoria];
  if (!sub) {
    console.warn(`[sugestoes] Subcategoria "${subcategoria}" não encontrada em "${categoria}".`);
    return [];
  }
  return [...sub];
}

/**
 * Retorna o objeto completo de sugestões de aprofundamento.
 * Útil para preencher dropdowns, checklists ou documentação.
 *
 * @returns {Object} — cópia profunda do SUGESTOES_APROFUNDAMENTO
 *
 * @example
 * import { getSugestoesAprofundamento } from '../utils/sugestoes';
 * const todas = getSugestoesAprofundamento();
 * const tiposBuffet = todas.buffet.tipoServico;
 */
export function getSugestoesAprofundamento() {
  return JSON.parse(JSON.stringify(SUGESTOES_APROFUNDAMENTO));
}

export { MAPA_ESTILO, SUGESTOES_APROFUNDAMENTO };