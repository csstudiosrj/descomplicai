// utils/catalogoFornecedores.js
// Fonte única de verdade para categorias, subcategorias e serviços de fornecedores
// Estrutura: Categoria Principal → Subcategoria → Serviço

export const CATALOGO_FORNECEDORES = [
    {
      id: 'alimentacao_bebidas',
      label: 'Alimentação e Bebidas',
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
          ]
        },
        {
          id: 'buffet',
          label: 'Buffet',
          servicos: [
            'Jantar empratado',
            'Jantar em buffet',
            'Estações de comida',
            'Coquetel + jantar',
            'Coquetel',
            'Food trucks',
            'Misto (buffet + estações)',
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
            'Bar sem álcool',
          ]
        },
        {
          id: 'bartender',
          label: 'Bartender e Drinks',
          servicos: [
            'Bartender + drinks autorais',
            'Bar completo (bartender + insumos)',
            'Drinks autorais sem álcool',
          ]
        },
      ]
    },
    {
      id: 'beleza_vestuario',
      label: 'Beleza e Vestuário',
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
          ]
        },
        {
          id: 'dia_noivo',
          label: 'Dia do Noivo',
          servicos: [
            'Barbearia + corte',
            'Barba',
            'Corte + barba',
            'Hidratação facial',
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
          label: 'Vestido e Ateliê',
          servicos: [
            'Vestido sob medida',
            'Vestido de pronta-entrega',
            'Vestido + acessórios',
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
            'Blazer + calça',
            'Terno + colete',
            'Conjunto padrinhos',
          ]
        },
      ]
    },
    {
      id: 'foto_video',
      label: 'Foto e Vídeo',
      subcategorias: [
        {
          id: 'fotografia',
          label: 'Fotografia',
          servicos: [
            'Cobertura completa (cerimônia + festa)',
            'Cobertura da cerimônia',
            'Cobertura da festa',
            'Pré-wedding',
            'Ensaio noivado',
            'Making of noiva',
            'Making of noivo',
            'Cobertura completa + pré-wedding',
          ]
        },
        {
          id: 'filmagem',
          label: 'Filmagem',
          servicos: [
            'Cobertura completa (cerimônia + festa)',
            'Filme curto (highlight)',
            'Filme longo (documentary)',
            'Cobertura cerimônia',
            'Super 8 / analógico',
            'Cobertura completa + pré-wedding',
          ]
        },
        {
          id: 'drone',
          label: 'Drone',
          servicos: [
            'Cobertura aérea (foto + vídeo)',
            'Cobertura aérea (vídeo)',
            'Cobertura aérea (foto)',
            'Piloto de drone + edição',
          ]
        },
      ]
    },
    {
      id: 'musica_entretenimento',
      label: 'Música e Entretenimento',
      subcategorias: [
        {
          id: 'musica_cerimonia',
          label: 'Música da Cerimônia',
          servicos: [
            'Quarteto de cordas',
            'Duo (violino + piano)',
            'Coral',
            'Cantor solo',
            'Trio (violino, viola, cello)',
            'Piano solo',
            'Violão solo',
            'Violinista',
            'Música gravada',
          ]
        },
        {
          id: 'musica_festa',
          label: 'Música da Festa',
          servicos: [
            'DJ',
            'Banda ao vivo',
            'Banda + DJ',
            'DJ com instrumentistas',
            'Playlist (sem contratação)',
          ]
        },
        {
          id: 'dj',
          label: 'DJ',
          servicos: [
            'DJ completo (cerimônia + festa)',
            'DJ festa',
            'DJ + iluminação',
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
            'Banda cerimônia',
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
            'Espelho mágico',
          ]
        },
        {
          id: 'animacao_infantil',
          label: 'Animação Infantil',
          servicos: [
            'Monitor de crianças',
            'Recreação infantil',
            'Espaço kids com monitores',
            'Animação + espaço kids',
          ]
        },
      ]
    },
    {
      id: 'decoracao_flores',
      label: 'Decoração e Flores',
      subcategorias: [
        {
          id: 'decoracao',
          label: 'Decoração',
          servicos: [
            'Decoração completa (cerimônia + festa)',
            'Decoração da cerimônia',
            'Decoração da festa',
            'Decoração floral',
            'Arranjos de mesa',
            'Backdrop para fotos',
            'Decoração + flores + mobiliário',
          ]
        },
        {
          id: 'floricultura',
          label: 'Floricultura',
          servicos: [
            'Flores cerimônia + festa',
            'Flores cerimônia',
            'Flores festa (mesas)',
            'Buquê da noiva',
            'Buquê + arranjos',
            'Flores suspensas',
            'Flores secas',
            'Flores cerimônia + festa + buquê',
          ]
        },
        {
          id: 'iluminacao_cenica',
          label: 'Iluminação Cênica',
          servicos: [
            'Iluminação completa (cerimônia + festa)',
            'Iluminação pista de dança',
            'Iluminação ambiente',
            'Iluminação cerimônia',
            'Iluminação + efeitos especiais',
            'Projeção mapeada',
            'Canhões de luz',
            'Iluminação externa',
          ]
        },
      ]
    },
    {
      id: 'cerimonia_assessoria',
      label: 'Cerimônia e Assessoria',
      subcategorias: [
        {
          id: 'oficializante_religioso',
          label: 'Oficializante Religioso',
          servicos: [
            'Padre (católico)',
            'Pastor (evangélico)',
            'Rabino (judaico)',
            'Médium / guia espiritual (espírita)',
            'Oficializante de outra denominação',
          ]
        },
        {
          id: 'celebrante',
          label: 'Celebrante / Mestre de Cerimônias',
          servicos: [
            'Celebrante laico',
            'Juiz de paz (casamento civil)',
            'Mestre de cerimônias',
            'Celebrante + mestre de cerimônias',
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
            'Carro clássico',
            'Carro de luxo',
            'Limousine',
            'Carro personalizado',
            'Helicóptero',
            'Van decorada',
          ]
        },
        {
          id: 'transporte_convidados',
          label: 'Transporte de Convidados',
          servicos: [
            'Van / ônibus fretado',
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
            'Convites físicos',
            'Convites digitais',
            'Convites físicos + digitais',
            'Save the date',
            'Convites + papelaria do evento (menus, plaquinhas)',
            'Papelaria completa do evento',
            'Monograma / identidade visual',
          ]
        },
        {
          id: 'grafica',
          label: 'Gráfica',
          servicos: [
            'Impressão de convites',
            'Impressão de papelaria do evento',
            'Envelopes e acabamentos',
            'Impressão + acabamento premium',
          ]
        },
        {
          id: 'aliancas',
          label: 'Alianças',
          servicos: [
            'Alianças em ouro',
            'Alianças em prata',
            'Alianças em platina',
            'Alianças personalizadas',
            'Alianças + certificado de origem',
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
          label: 'Espaço e Locação',
          servicos: [
            'Locação do espaço completo',
            'Locação apenas da cerimônia',
            'Locação apenas da recepção',
            'Locação do espaço + infraestrutura',
            'Day use',
          ]
        },
        {
          id: 'mobiliario_locacao',
          label: 'Mobiliário e Louças',
          servicos: [
            'Cadeiras',
            'Mesas',
            'Cadeiras + mesas',
            'Lounge completo',
            'Mobiliário cerimônia',
            'Mobiliário completo (cerimônia + festa)',
            'Altar + passarela',
            'Tendas',
            'Louças completas',
            'Talheres',
            'Taças e copos',
            'Sousplats',
            'Louças + talheres + taças',
            'Louças premium',
          ]
        },
        {
          id: 'som_profissional',
          label: 'Som Profissional',
          servicos: [
            'Som completo (cerimônia + festa)',
            'Som da cerimônia',
            'Som da festa',
            'Mesa de som + técnico',
          ]
        },
        {
          id: 'geradores',
          label: 'Geradores',
          servicos: [
            'Gerador completo',
            'Gerador de apoio',
            'Gerador + técnico de plantão',
          ]
        },
        {
          id: 'banheiros_extras',
          label: 'Banheiros Extras',
          servicos: [
            'Banheiro químico',
            'Banheiro container executivo',
            'Banheiro trailer premium',
          ]
        },
        {
          id: 'seguranca',
          label: 'Segurança',
          servicos: [
            'Segurança do evento',
            'Portaria',
            'Controle de acesso',
            'Segurança + portaria',
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
  
  // ─── Helpers ───
  
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
  
  export function getServicos(subcategoriaId) {
    return getSubcategoria(subcategoriaId)?.servicos || [];
  }
  
  export function getSubcategoriasPorPrincipal(categoriaPrincipalId) {
    const cat = CATALOGO_FORNECEDORES.find(c => c.id === categoriaPrincipalId);
    return cat ? cat.subcategorias : [];
  }
  
  // ─── Compatibilidade legada ───
  // Mantém CATEGORIAS_FORNECEDORES e SERVICOS_POR_CATEGORIA para não quebrar
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
    { id: 'negociando', label: 'Em negociação', color: '#F9A825' },
    { id: 'contratado', label: 'Contratado', color: '#2E7D32' },
    { id: 'pago', label: 'Pago', color: '#00838F' },
    { id: 'cancelado', label: 'Cancelado', color: '#C62828' },
  ];