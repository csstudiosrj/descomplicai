// utils/catalogoFornecedores.js
// Fonte unica de verdade para categorias, subcategorias e servicos de fornecedores
// Estrutura: Categoria Principal -> Subcategoria -> Servico

export const CATALOGO_FORNECEDORES = [
  {
    id: 'alimentacao_bebidas',
    label: 'Alimentacao e Bebidas',
    subcategorias: [
      {
        id: 'bolo_doces',
        label: 'Bolo e Doces',
        servicos: [
          'Bolo + mesa de doces',
          'Bolo',
          'Mesa de doces',
          'Naked cake',
          'Bolo fake + mesa de doces',
          'Cupcakes',
          'Mesa de doces finos',
          'Mesa de frios',
          'Mesa de doces exposta',
        ]
      },
      {
        id: 'buffet',
        label: 'Buffet',
        servicos: [
          'Jantar empratado',
          'Jantar em buffet',
          'Estacoes de comida',
          'Coquetel + jantar',
          'Coquetel',
          'Food trucks',
          'Misto (buffet + estacoes)',
          'Menu infantil',
        ]
      },
      {
        id: 'bebidas',
        label: 'Bebidas e Bar',
        servicos: [
          'Open bar completo',
          'Open bar limitado (sem destilados)',
          'Espumante e refrigerantes',
          'Cerveja e refrigerantes',
          'Bar sem alcool',
          'Bebidas por pessoa (controle)',
          'Bebidas por pessoa (livre)',
        ]
      },
      {
        id: 'bartender',
        label: 'Bartender e Drinks',
        servicos: [
          'Bartender + drinks autorais',
          'Bar completo (bartender + insumos)',
          'Drinks autorais sem alcool',
        ]
      },
    ]
  },
  {
    id: 'beleza_vestuario',
    label: 'Beleza e Vestuario',
    subcategorias: [
      {
        id: 'beleza_noiva',
        label: 'Beleza da Noiva',
        servicos: [
          'Cabelo + maquiagem (dia da noiva)',
          'Maquiagem',
          'Cabelo',
          'Penteado',
          'Dia da noiva completo (cabelo, maquiagem, unhas)',
          'Mudanca de look (festa)',
        ]
      },
      {
        id: 'dia_noivo',
        label: 'Dia do Noivo',
        servicos: [
          'Barbearia + corte',
          'Barba',
          'Corte + barba',
          'Hidratacao facial',
        ]
      },
      {
        id: 'beleza_madrinhas',
        label: 'Beleza das Madrinhas',
        servicos: [
          'Maquiagem das madrinhas',
          'Cabelo das madrinhas',
          'Cabelo + maquiagem das madrinhas',
          'Pacote madrinhas + noiva',
        ]
      },
      {
        id: 'vestido_atelier',
        label: 'Vestido e Atelie',
        servicos: [
          'Vestido sob medida',
          'Vestido de pronta-entrega',
          'Vestido + acessorios',
          'Aluguel de vestido',
          'Jumpsuit',
          'Vestido midi',
          'Vestido de noivado',
        ]
      },
      {
        id: 'traje_masculino',
        label: 'Traje Masculino',
        servicos: [
          'Terno sob medida',
          'Terno alugado',
          'Smoking',
          'Blazer + calca',
          'Terno + colete',
          'Conjunto padrinhos',
        ]
      },
    ]
  },
  {
    id: 'foto_video',
    label: 'Foto e Video',
    subcategorias: [
      {
        id: 'fotografia',
        label: 'Fotografia',
        servicos: [
          'Cobertura completa (cerimonia + festa)',
          'Cobertura da cerimonia',
          'Cobertura da festa',
          'Pre-wedding',
          'Ensaio noivado',
          'Making of noiva',
          'Making of noivo',
          'Cobertura completa + pre-wedding',
          'Fotos lua de mel',
        ]
      },
      {
        id: 'filmagem',
        label: 'Filmagem',
        servicos: [
          'Cobertura completa (cerimonia + festa)',
          'Filme curto (highlight)',
          'Filme longo (documentary)',
          'Cobertura cerimonia',
          'Super 8 / analogico',
          'Cobertura completa + pre-wedding',
        ]
      },
      {
        id: 'drone',
        label: 'Drone',
        servicos: [
          'Cobertura aerea (foto + video)',
          'Cobertura aerea (video)',
          'Cobertura aerea (foto)',
          'Piloto de drone + edicao',
        ]
      },
    ]
  },
  {
    id: 'musica_entretenimento',
    label: 'Musica e Entretenimento',
    subcategorias: [
      {
        id: 'musica_cerimonia',
        label: 'Musica da Cerimonia',
        servicos: [
          'Quarteto de cordas',
          'Duo (violino + piano)',
          'Coral',
          'Cantor solo',
          'Trio (violino, viola, cello)',
          'Piano solo',
          'Violao solo',
          'Violinista',
          'Musica gravada',
          'Musica ao vivo (cerimonia)',
        ]
      },
      {
        id: 'musica_festa',
        label: 'Musica da Festa',
        servicos: [
          'DJ',
          'Banda ao vivo',
          'Banda + DJ',
          'DJ com instrumentistas',
          'Playlist (sem contratacao)',
        ]
      },
      {
        id: 'dj',
        label: 'DJ',
        servicos: [
          'DJ completo (cerimonia + festa)',
          'DJ festa',
          'DJ + iluminacao',
          'DJ + som',
          'DJ + cabine de fotos',
        ]
      },
      {
        id: 'banda',
        label: 'Banda ao Vivo',
        servicos: [
          'Banda completa',
          'Banda + DJ',
          'Banda cerimonia',
          'Banda festa',
          'Samba ao vivo',
          'MPB ao vivo',
          'Pop/rock ao vivo',
          'Jazz ao vivo',
        ]
      },
      {
        id: 'cabine_fotos',
        label: 'Cabine de Fotos',
        servicos: [
          'Cabine de fotos digital',
          'Cabine de fotos impressa',
          'Totem de fotos',
          'GIF booth',
          '360° booth',
          'Espelho magico',
        ]
      },
      {
        id: 'animacao_infantil',
        label: 'Animacao Infantil',
        servicos: [
          'Monitor de criancas',
          'Recreacao infantil',
          'Espaco kids com monitores',
          'Animacao + espaco kids',
        ]
      },
      {
        id: 'fogos_sparklers',
        label: 'Fogos e Sparklers',
        servicos: [
          'Fogos de artificio',
          'Sparklers (luzinhas)',
          'Fogos + sparklers',
          'Fogos indoor (frio)',
        ]
      },
      {
        id: 'aula_danca',
        label: 'Aula de Danca',
        servicos: [
          'Aula de danca dos noivos',
          'Aula de danca em grupo',
          'Coreografo exclusivo',
        ]
      },
    ]
  },
  {
    id: 'decoracao_flores',
    label: 'Decoracao e Flores',
    subcategorias: [
      {
        id: 'decoracao',
        label: 'Decoracao',
        servicos: [
          'Decoracao completa (cerimonia + festa)',
          'Decoracao da cerimonia',
          'Decoracao da festa',
          'Decoracao floral',
          'Arranjos de mesa',
          'Backdrop para fotos',
          'Decoracao + flores + mobiliario',
        ]
      },
      {
        id: 'floricultura',
        label: 'Floricultura',
        servicos: [
          'Flores cerimonia + festa',
          'Flores cerimonia',
          'Flores festa (mesas)',
          'Buque da noiva',
          'Buque + arranjos',
          'Flores suspensas',
          'Flores secas',
          'Flores cerimonia + festa + buque',
        ]
      },
      {
        id: 'iluminacao_cenica',
        label: 'Iluminacao Cenica',
        servicos: [
          'Iluminacao completa (cerimonia + festa)',
          'Iluminacao pista de danca',
          'Iluminacao ambiente',
          'Iluminacao cerimonia',
          'Iluminacao + efeitos especiais',
          'Projecao mapeada',
          'Canhoes de luz',
          'Iluminacao externa',
        ]
      },
      {
        id: 'mobiliario',
        label: 'Mobiliario Especial',
        servicos: [
          'Mobiliario completo (cerimonia + festa)',
          'Mobiliario cerimonia',
          'Mobiliario festa',
          'Lounge completo',
          'Altar + passarela',
          'Backdrop estrutural',
        ]
      },
      {
        id: 'velas',
        label: 'Velas e Luminarias',
        servicos: [
          'Velas decorativas',
          'Luminarias suspensas',
          'Velas flutuantes',
          'Candelabros',
        ]
      },
      {
        id: 'tecidos',
        label: 'Tecidos e Texteis',
        servicos: [
          'Drapes e cortinas',
          'Tecidos cerimonia',
          'Tecidos festa',
          'Tecidos + flores',
        ]
      },
    ]
  },
  {
    id: 'cerimonia_assessoria',
    label: 'Cerimonia e Assessoria',
    subcategorias: [
      {
        id: 'oficializante_religioso',
        label: 'Oficializante Religioso',
        servicos: [
          'Padre (catolico)',
          'Pastor (evangelico)',
          'Rabino (judaico)',
          'Medium / guia espiritual (espirita)',
          'Oficializante de outra denominacao',
        ]
      },
      {
        id: 'celebrante',
        label: 'Celebrante / Mestre de Cerimonias',
        servicos: [
          'Celebrante laico',
          'Juiz de paz (casamento civil)',
          'Mestre de cerimonias',
          'Celebrante + mestre de cerimonias',
        ]
      },
      {
        id: 'cerimonialista',
        label: 'Cerimonialista',
        servicos: [
          'Assessoria completa',
          'Assessoria parcial',
          'Cerimonial do dia',
          'Consultoria de planejamento',
          'Assessoria + cerimonial',
        ]
      },
    ]
  },
  {
    id: 'transporte',
    label: 'Transporte',
    subcategorias: [
      {
        id: 'transporte_noivos',
        label: 'Transporte dos Noivos',
        servicos: [
          'Carro classico',
          'Carro de luxo',
          'Limousine',
          'Carro personalizado',
          'Helicoptero',
          'Van decorada',
        ]
      },
      {
        id: 'transporte_convidados',
        label: 'Transporte de Convidados',
        servicos: [
          'Van / onibus fretado',
          'Transfer aeroporto',
          'Transporte completo de convidados',
          'Valet',
        ]
      },
    ]
  },
  {
    id: 'papelaria_detalhes',
    label: 'Papelaria e Detalhes',
    subcategorias: [
      {
        id: 'papelaria',
        label: 'Papelaria e Convites',
        servicos: [
          'Convites fisicos',
          'Convites digitais',
          'Convites fisicos + digitais',
          'Save the date',
          'Convites + papelaria do evento (menus, plaquinhas)',
          'Papelaria completa do evento',
          'Monograma / identidade visual',
        ]
      },
      {
        id: 'grafica',
        label: 'Grafica',
        servicos: [
          'Impressao de convites',
          'Impressao de papelaria do evento',
          'Envelopes e acabamentos',
          'Impressao + acabamento premium',
        ]
      },
      {
        id: 'aliancas',
        label: 'Aliancas',
        servicos: [
          'Aliancas em ouro',
          'Aliancas em prata',
          'Aliancas em platina',
          'Aliancas personalizadas',
          'Aliancas + certificado de origem',
        ]
      },
      {
        id: 'bem_casados',
        label: 'Bem-casados e Lembrancinhas',
        servicos: [
          'Bem-casados tradicionais',
          'Bem-casados gourmet',
          'Caixinhas personalizadas',
          'Lembrancinhas personalizadas',
          'Bem-casados + embalagem personalizada',
        ]
      },
    ]
  },
  {
    id: 'local_infraestrutura',
    label: 'Local e Infraestrutura',
    subcategorias: [
      {
        id: 'espaco_recepcao',
        label: 'Espaco e Locacao',
        servicos: [
          'Locacao do espaco completo',
          'Locacao apenas da cerimonia',
          'Locacao apenas da recepcao',
          'Locacao do espaco + infraestrutura',
          'Day use',
        ]
      },
      {
        id: 'mobiliario_locacao',
        label: 'Mobiliario e Loucas',
        servicos: [
          'Cadeiras',
          'Mesas',
          'Cadeiras + mesas',
          'Lounge completo',
          'Mobiliario cerimonia',
          'Mobiliario completo (cerimonia + festa)',
          'Altar + passarela',
          'Tendas',
          'Loucas completas',
          'Talheres',
          'Tacas e copos',
          'Sousplats',
          'Loucas + talheres + tacas',
          'Loucas premium',
        ]
      },
      {
        id: 'som_profissional',
        label: 'Som Profissional',
        servicos: [
          'Som completo (cerimonia + festa)',
          'Som da cerimonia',
          'Som da festa',
          'Mesa de som + tecnico',
        ]
      },
      {
        id: 'geradores',
        label: 'Geradores',
        servicos: [
          'Gerador completo',
          'Gerador de apoio',
          'Gerador + tecnico de plantao',
        ]
      },
      {
        id: 'banheiros_extras',
        label: 'Banheiros Extras',
        servicos: [
          'Banheiro quimico',
          'Banheiro container executivo',
          'Banheiro trailer premium',
        ]
      },
      {
        id: 'seguranca',
        label: 'Seguranca',
        servicos: [
          'Seguranca do evento',
          'Portaria',
          'Controle de acesso',
          'Seguranca + portaria',
        ]
      },
      {
        id: 'estacionamento',
        label: 'Estacionamento e Valet',
        servicos: [
          'Estacionamento organizado',
          'Valet parking',
          'Estacionamento + valet',
        ]
      },
      {
        id: 'cozinha_apoio',
        label: 'Cozinha de Apoio',
        servicos: [
          'Cozinha industrial completa',
          'Cozinha de apoio (buffet)',
          'Area de preparo',
        ]
      },
    ]
  },
  {
    id: 'lua_de_mel',
    label: 'Lua de Mel',
    subcategorias: [
      {
        id: 'agencia_viagem',
        label: 'Agencia de Viagem',
        servicos: [
          'Pacote lua de mel completo',
          'Pacote lua de mel (nacional)',
          'Pacote lua de mel (internacional)',
          'Consultoria de viagem',
        ]
      },
    ]
  },
  {
    id: 'outro',
    label: 'Outro',
    subcategorias: [
      {
        id: 'outro',
        label: 'Outro',
        servicos: []
      },
    ]
  },
];

// --- Helpers ---

export const CATEGORIAS_PRINCIPAIS = CATALOGO_FORNECEDORES.map(c => ({ id: c.id, label: c.label }));

export const SUBCATEGORIAS_FLAT = CATALOGO_FORNECEDORES.flatMap(c =>
  c.subcategorias.map(s => ({ ...s, categoriaPrincipalId: c.id, categoriaPrincipalLabel: c.label }))
);

export function getCategoriaPrincipal(subcategoriaId) {
  return CATALOGO_FORNECEDORES.find(c => c.subcategorias.some(s => s.id === subcategoriaId));
}

export function getSubcategoria(subcategoriaId) {
  return SUBCATEGORIAS_FLAT.find(s => s.id === subcategoriaId);
}

export function getLabelSubcategoria(subcategoriaId) {
  return getSubcategoria(subcategoriaId)?.label || subcategoriaId;
}

export function getLabelCategoriaPrincipal(subcategoriaId) {
  return getSubcategoria(subcategoriaId)?.categoriaPrincipalLabel || '';
}

/** NOVO: resolve label direto pelo ID da categoria principal (ex: 'alimentacao_bebidas' -> 'Alimentacao e Bebidas') */
export function getLabelCategoriaPrincipalPorId(categoriaPrincipalId) {
  if (!categoriaPrincipalId) return '';
  const cat = CATALOGO_FORNECEDORES.find(c => c.id === categoriaPrincipalId);
  return cat?.label || categoriaPrincipalId;
}

export function getServicos(subcategoriaId) {
  return getSubcategoria(subcategoriaId)?.servicos || [];
}

export function getSubcategoriasPorPrincipal(categoriaPrincipalId) {
  const cat = CATALOGO_FORNECEDORES.find(c => c.id === categoriaPrincipalId);
  return cat ? cat.subcategorias : [];
}

// --- Compatibilidade legada ---
// Mantem CATEGORIAS_FORNECEDORES e SERVICOS_POR_CATEGORIA para nao quebrar
// outros arquivos que ainda importam eles

export const CATEGORIAS_FORNECEDORES = SUBCATEGORIAS_FLAT.map(s => ({
  id: s.id,
  label: s.label,
}));

export const SERVICOS_POR_CATEGORIA = SUBCATEGORIAS_FLAT.reduce((acc, s) => {
  acc[s.id] = s.servicos;
  return acc;
}, {});

export const STATUS_FORNECEDOR = [
  { id: 'a_contratar', label: 'A contratar', color: '#8B6F5E' },
  { id: 'negociando', label: 'Em negociacao', color: '#F9A825' },
  { id: 'contratado', label: 'Contratado', color: '#2E7D32' },
  { id: 'pago', label: 'Pago', color: '#00838F' },
  { id: 'cancelado', label: 'Cancelado', color: '#C62828' },
];
