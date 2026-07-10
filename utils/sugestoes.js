// utils/sugestoes.js — Sugestões por estilo com múltiplos pares de fontes

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
    paleta: ['#E6E6FA', '#D8BFD8', '#8B6F5E'],
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
    paleta: ['#0A0A0A', '#D4AF37', '#F5F0EB'],
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

export function getPaleta(estilo) {
  return MAPA_ESTILO[estilo]?.paleta || ['#F5F0EB', '#D4AF37', '#8B6F5E'];
}

export { MAPA_ESTILO };
