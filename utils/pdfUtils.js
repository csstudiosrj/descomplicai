/**
 * Utilitários para geração do PDF do Memorial — SEGURO para cliente e servidor
 * @module utils/pdfUtils
 */

/**
 * Capitaliza nome próprio
 */
export function capitalizarNome(nome) {
  if (!nome || typeof nome !== 'string') return '';
  return nome
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formata data ISO para DD/MM/AAAA
 */
export function formatarData(dataISO) {
  if (!dataISO || typeof dataISO !== 'string') return 'Data a definir';
  const [ano, mes, dia] = dataISO.split('-');
  if (!ano || !mes || !dia) return 'Data a definir';
  return `${dia}/${mes}/${ano}`;
}

/**
 * Retorna paleta de 3 cores do usuário ou fallback
 */
export function getPaleta(dados) {
  if (dados?.paleta && Array.isArray(dados.paleta) && dados.paleta.length >= 3) {
    return dados.paleta.slice(0, 3).map(c => String(c || '#8B6F5E'));
  }
  return ['#8B6F5E', '#E5E0D9', '#F9F7F4'];
}

/**
 * Verifica se cor é escura (luminância < 128)
 */
export function isCorEscura(hex) {
  const h = String(hex || '');
  if (h.length < 7) return false;
  const r = parseInt(h.substring(1, 3), 16);
  const g = parseInt(h.substring(3, 5), 16);
  const b = parseInt(h.substring(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

/**
 * Retorna cor de contraste para texto sobre fundo
 */
export function getCorContraste(hex) {
  return isCorEscura(hex) ? '#FFFFFF' : '#1A1714';
}

/**
 * Retorna a cor mais escura da paleta (para bordas)
 */
export function getCorBorda(paleta) {
  if (!paleta || !Array.isArray(paleta) || paleta.length === 0) return '#8B6F5E';
  const escuras = paleta.filter(isCorEscura);
  if (escuras.length > 0) return escuras[0];
  return paleta[0];
}

/**
 * Garante que a cor do título seja legível
 */
export function getCorTitulo(corPrimaria, corBorda) {
  if (isCorEscura(corPrimaria)) return corPrimaria;
  if (isCorEscura(corBorda)) return corBorda;
  return '#5C4A3D';
}

/**
 * Nome da cor a partir do hex
 */
export function getNomeCor(hex) {
  const mapa = {
    '#8B6F5E': 'Marrom Clássico',
    '#E5E0D9': 'Bege Natural',
    '#F9F7F4': 'Off-white',
    '#F5F0EB': 'Branco Gelo',
    '#D4AF37': 'Dourado',
    '#F4E4C1': 'Creme Rústico',
    '#556B2F': 'Verde Oliva',
    '#E8DCC8': 'Areia Boho',
    '#C4A898': 'Rosê',
    '#FFFFFF': 'Branco Puro',
    '#1A1714': 'Preto Suave',
    '#C8BFB4': 'Cinza Quente',
    '#F3F0EC': 'Branco Neve',
    '#2C2C2C': 'Grafite',
    '#FF6B6B': 'Coral',
    '#4ECDC4': 'Turquesa',
    '#FFE66D': 'Amarelo Solar',
    '#F8E1E4': 'Rosa Pétala',
    '#FFB7C5': 'Rosa Chiclete',
    '#E6E6FA': 'Lavanda',
    '#D8BFD8': 'Lilás',
    '#4A0E0E': 'Vinho Escuro',
  };
  return mapa[String(hex || '').toUpperCase()] || String(hex || '').toUpperCase();
}

/**
 * Calcula valor médio regionalizado
 */
export function getValorRegionalizado(categoria, cidade, estado) {
  const estadoLower = String(estado || '').toLowerCase().trim();
  const cidadeLower = String(cidade || '').toLowerCase().trim();

  let multiplicador = 1.0;
  if (['sp', 'são paulo', 'sao paulo'].includes(estadoLower)) multiplicador = 1.3;
  else if (['rj', 'rio de janeiro'].includes(estadoLower)) multiplicador = 1.25;
  else if (['mg', 'minas gerais'].includes(estadoLower)) multiplicador = 1.0;
  else if (['rs', 'rio grande do sul'].includes(estadoLower)) multiplicador = 1.1;
  else if (['pr', 'paraná', 'parana'].includes(estadoLower)) multiplicador = 1.05;
  else if (['sc', 'santa catarina'].includes(estadoLower)) multiplicador = 1.15;
  else if (['ba', 'bahia'].includes(estadoLower)) multiplicador = 0.85;
  else if (['ce', 'ceará', 'ceara'].includes(estadoLower)) multiplicador = 0.8;
  else if (['pe', 'pernambuco'].includes(estadoLower)) multiplicador = 0.82;
  else if (['am', 'amazonas'].includes(estadoLower)) multiplicador = 0.9;
  else if (['go', 'goiás', 'goias'].includes(estadoLower)) multiplicador = 0.95;
  else if (['df', 'distrito federal'].includes(estadoLower)) multiplicador = 1.2;
  else if (['es', 'espírito santo', 'espirito santo'].includes(estadoLower)) multiplicador = 1.0;

  const cidadesPremium = ['são paulo', 'sao paulo', 'rio de janeiro', 'brasília', 'brasilia', 'curitiba', 'florianópolis', 'florianopolis', 'porto alegre', 'belo horizonte'];
  if (cidadesPremium.includes(cidadeLower)) multiplicador += 0.15;

  const base = {
    'Espaço e locação': 5000,
    'Buffet e alimentação': 8000,
    'Bebidas e bar': 3000,
    'Decoração e flores': 4000,
    'Fotografia': 2500,
    'Vídeo e filmagem': 2000,
    'Música e DJ/banda': 2500,
    'Vestido da noiva': 3000,
    'Terno do noivo': 1500,
    'Beleza (cabelo/maquiagem)': 1200,
    'Convites e papelaria': 800,
    'Lembrancinhas': 600,
    'Transporte (noivos)': 800,
    'Transporte (convidados)': 1200,
    'Cerimonialista': 2000,
    'Bolo e doces': 1500,
    'Bem-casados': 800,
    'Aluguel de mesas/cadeiras': 1000,
    'Toalhas e guardanapos': 500,
    'Louças, talheres e taças': 800,
    'Iluminação cênica': 1200,
    'Som e equipamentos': 1500,
    'Segurança': 600,
    'Estacionamento': 500,
    'Hospedagem (noite de núpcias)': 1000,
    'Lua de mel (reserva)': 3000,
    'Alianças': 2000,
    'Taxas e licenças': 400,
    'Presentes para padrinhos': 600,
    'Reserva de emergência (10%)': 2500,
    'Doces finos e mesa de café': 900,
    'Chá de panela / cozinha': 700,
  };

  const valorBase = base[categoria] || 1000;
  return Math.round(valorBase * multiplicador);
}

/**
 * Retorna dicas regionais
 */
export function getDicasRegionais(cidade, estado) {
  const estadoLower = String(estado || '').toLowerCase().trim();
  const cidadeLower = String(cidade || '').toLowerCase().trim();

  const dicas = {
    clima: 'Consulte a previsão do tempo próximo à data do evento.',
    cuidados: ['Tenha um plano B para chuva (cobertura ou tenda)', 'Hidrate-se bem no dia do casamento'],
    melhoresEpocas: ['Primavera (setembro a novembro)', 'Outono (março a maio)'],
  };

  if (['sp', 'são paulo', 'sao paulo', 'pr', 'paraná', 'parana', 'rs', 'rio grande do sul', 'sc', 'santa catarina', 'mg', 'minas gerais', 'rj', 'rio de janeiro', 'es', 'espírito santo', 'espirito santo'].includes(estadoLower)) {
    dicas.clima = 'Clima subtropical/tropical de altitude. Verões quentes e úmidos, invernos amenos.';
    dicas.cuidados = ['Preveja chuvas de verão (dezembro a março)', 'Locais fechados com ar-condicionado são ideais no verão', 'Evite finais de semana de feriados prolongados (preços sobem)'];
    dicas.melhoresEpocas = ['Abril a junho (outono)', 'Agosto a outubro (primavera)'];
  }

  if (['ba', 'bahia', 'ce', 'ceará', 'ceara', 'pe', 'pernambuco', 'pb', 'paraíba', 'paraiba', 'rn', 'rio grande do norte', 'al', 'alagoas', 'se', 'sergipe', 'ma', 'maranhão', 'maranhao', 'pi', 'piauí', 'piaui', 'pa', 'pará', 'para', 'ap', 'amapá', 'amapa', 'to', 'tocantins', 'ro', 'rondônia', 'rondonia', 'ac', 'acre', 'rr', 'roraima', 'am', 'amazonas'].includes(estadoLower)) {
    dicas.clima = 'Clima tropical. Altas temperaturas durante todo o ano, estação seca e chuvosa bem definidas.';
    dicas.cuidados = ['Evite período de chuvas intensas (março a maio no Norte; dezembro a fevereiro no Nordeste)', 'Prefira locais com ventilação natural ou ar-condicionado potente', 'Hidrateção é essencial para convidados'];
    dicas.melhoresEpocas = ['Junho a setembro (estação seca no Norte)', 'Agosto a dezembro (Nordeste)'];
  }

  if (['df', 'distrito federal', 'go', 'goiás', 'goias', 'mt', 'mato grosso', 'ms', 'mato grosso do sul'].includes(estadoLower)) {
    dicas.clima = 'Clima tropical de savana. Estação seca bem definida, invernos amenos.';
    dicas.cuidados = ['Chuvas de verão podem ser intensas e repentinas', 'Seca no inverno pode gerar poeira — prefira locais com piso adequado'];
    dicas.melhoresEpocas = ['Maio a agosto (seca, temperaturas amenas)', 'Setembro a outubro'];
  }

  if (cidadeLower.includes('praia') || cidadeLower.includes('beach') || ['salvador', 'fortaleza', 'recife', 'natal', 'aracaju', 'maceió', 'macapá', 'macapa', 'belém', 'belem', 'são luís', 'sao luis', 'porto velho', 'boa vista', 'rio de janeiro', 'niterói', 'niteroi', 'cabo frio', 'búzios', 'buzios', 'arraial do cabo', 'paraty', 'ilhabela', 'guarujá', 'guaruja', 'santos', 'balneário camboriú', 'balneario camboriu', 'florianópolis', 'florianopolis', 'porto belo', 'bombinhas'].includes(cidadeLower)) {
    dicas.cuidados.push('Casamentos na praia: verifique a maré e o vento para a cerimônia');
    dicas.cuidados.push('Evite horários de sol forte (11h às 15h) para cerimônias ao ar livre');
    dicas.melhoresEpocas.push('Manhãs ensolaradas ou finais de tarde');
  }

  if (cidadeLower.includes('serra') || cidadeLower.includes('montanha') || ['campos do jordão', 'gramado', 'canela', 'monte verde', 'gonçalves', 'goncalves', 'são bento do sapucaí', 'sao bento do sapucai', 'teresópolis', 'teresopolis', 'petrópolis', 'petropolis', 'nova friburgo'].includes(cidadeLower)) {
    dicas.clima = 'Clima de montanha. Temperaturas baixas no inverno, possibilidade de geada.';
    dicas.cuidados.push('Preveja aquecimento para convidados em casamentos de inverno');
    dicas.cuidados.push('Estradas podem estar escorregadias em dias de chuva');
    dicas.melhoresEpocas = ['Primavera e outono (temperaturas amenas)', 'Inverno para casamentos aconchegantes (com aquecimento)'];
  }

  return dicas;
}

/**
 * Parseia o texto markdown do memorial em seções
 * FALLBACK ROBUSTO: se não encontrar ##, retorna o texto inteiro como uma seção
 */
export function parsearMemorial(memorial) {
  if (!memorial || typeof memorial !== 'string') {
    console.warn('parsearMemorial: memorial vazio ou inválido', memorial);
    return [{ titulo: 'Memorial do Casamento', linhas: ['Conteúdo não disponível.'] }];
  }

  const secoes = [];
  const linhas = memorial.split('\n');
  let atual = null;
  let temH2 = false;

  for (const linha of linhas) {
    if (typeof linha === 'string' && linha.startsWith('## ')) {
      temH2 = true;
      break;
    }
  }

  if (!temH2) {
    const linhasFiltradas = linhas.filter(l => typeof l === 'string' && l.trim());
    if (linhasFiltradas.length === 0) {
      return [{ titulo: 'Memorial do Casamento', linhas: ['Memorial gerado com sucesso.'] }];
    }
    return [{ titulo: 'Memorial do Casamento', linhas: linhasFiltradas }];
  }

  for (const linha of linhas) {
    if (typeof linha === 'string' && linha.startsWith('## ')) {
      if (atual) secoes.push(atual);
      atual = { titulo: linha.replace('## ', '').trim(), linhas: [] };
    } else if (atual && typeof linha === 'string') {
      atual.linhas.push(linha);
    }
  }
  if (atual) secoes.push(atual);

  if (secoes.length === 0) {
    return [{ titulo: 'Memorial do Casamento', linhas: linhas.filter(l => typeof l === 'string' && l.trim()) }];
  }

  return secoes;
}

/**
 * Extrai itens de checklist
 */
export function extrairChecklist(secoes) {
  const checklist = [];
  if (!Array.isArray(secoes)) return checklist;
  for (const secao of secoes) {
    if (!secao?.linhas || !Array.isArray(secao.linhas)) continue;
    for (const linha of secao.linhas) {
      if (typeof linha !== 'string') continue;
      const lower = linha.toLowerCase();
      if (lower.includes('ainda não sei') || lower.includes('ainda nao sei') || lower.includes('pendente') || lower.includes('a definir') || lower.includes('a decidir')) {
        const item = linha.replace(/[*\-]\s*/, '').replace(/\*\*/g, '').trim();
        if (item) checklist.push({ item, prazo: 'A definir' });
      }
    }
  }
  if (checklist.length === 0) {
    return [
      { item: 'Definir data final do casamento', prazo: '12 meses antes' },
      { item: 'Reservar local do evento', prazo: '10 meses antes' },
      { item: 'Contratar fotógrafo e videomaker', prazo: '8 meses antes' },
      { item: 'Provar vestido e traje', prazo: '6 meses antes' },
      { item: 'Definir cardápio e degustação', prazo: '4 meses antes' },
      { item: 'Enviar convites (físicos e digitais)', prazo: '3 meses antes' },
      { item: 'Prova de cabelo e maquiagem', prazo: '2 meses antes' },
      { item: 'Confirmar presenças dos convidados', prazo: '1 mês antes' },
      { item: 'Ensaio geral da cerimônia', prazo: '1 semana antes' },
      { item: 'Reunião final com fornecedores', prazo: '3 dias antes' },
    ];
  }
  return checklist;
}

/**
 * Extrai fornecedores — retorna só categoria + "A definir"
 */
export function extrairFornecedores(secoes) {
  const categorias = [
    'fotógrafo', 'fotografo', 'buffet', 'decorador', 'decoracao', 'decoração',
    'dj', 'banda', 'musica', 'música', 'video', 'vídeo', 'cerimonialista',
    'igreja', 'espaço', 'espaco', 'salão', 'salao', 'vestido', 'terno',
    'beleza', 'cabelo', 'maquiagem', 'convite', 'papelaria', 'bolo', 'doces',
    'florista', 'iluminação', 'iluminacao', 'som'
  ];

  const mapaNomes = {
    'fotógrafo': 'Fotografia', 'fotografo': 'Fotografia',
    'buffet': 'Buffet',
    'decorador': 'Decoração', 'decoracao': 'Decoração', 'decoração': 'Decoração',
    'dj': 'Música / DJ', 'banda': 'Música / DJ', 'musica': 'Música / DJ', 'música': 'Música / DJ',
    'video': 'Filmagem', 'vídeo': 'Filmagem',
    'cerimonialista': 'Cerimonialista',
    'igreja': 'Espaço / Venue', 'espaço': 'Espaço / Venue', 'espaco': 'Espaço / Venue',
    'salão': 'Espaço / Venue', 'salao': 'Espaço / Venue',
    'vestido': 'Vestido', 'terno': 'Terno',
    'beleza': 'Beleza', 'cabelo': 'Beleza', 'maquiagem': 'Beleza',
    'convite': 'Papelaria', 'papelaria': 'Papelaria',
    'bolo': 'Bolo e Doces', 'doces': 'Bolo e Doces',
    'florista': 'Flores',
    'iluminação': 'Iluminação', 'iluminacao': 'Iluminação',
    'som': 'Som'
  };

  const encontradas = new Set();

  if (!Array.isArray(secoes)) {
    return [
      { categoria: 'Espaço / Venue', nome: 'A definir' },
      { categoria: 'Buffet', nome: 'A definir' },
      { categoria: 'Bebidas', nome: 'A definir' },
      { categoria: 'Decoração', nome: 'A definir' },
      { categoria: 'Flores', nome: 'A definir' },
      { categoria: 'Fotografia', nome: 'A definir' },
      { categoria: 'Filmagem', nome: 'A definir' },
      { categoria: 'Música / DJ', nome: 'A definir' },
      { categoria: 'Vestido', nome: 'A definir' },
      { categoria: 'Terno', nome: 'A definir' },
      { categoria: 'Beleza', nome: 'A definir' },
      { categoria: 'Papelaria', nome: 'A definir' },
      { categoria: 'Bolo e Doces', nome: 'A definir' },
      { categoria: 'Cerimonialista', nome: 'A definir' },
      { categoria: 'Transporte', nome: 'A definir' },
      { categoria: 'Iluminação', nome: 'A definir' },
      { categoria: 'Som', nome: 'A definir' },
      { categoria: 'Segurança', nome: 'A definir' },
    ];
  }

  for (const secao of secoes) {
    if (!secao?.linhas || !Array.isArray(secao.linhas)) continue;
    for (const linha of secao.linhas) {
      if (typeof linha !== 'string') continue;
      const lower = linha.toLowerCase();
      for (const cat of categorias) {
        if (lower.includes(cat)) {
          encontradas.add(cat);
          break;
        }
      }
    }
  }

  const fornecedores = [];
  for (const cat of encontradas) {
    const nomeCat = mapaNomes[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
    if (!fornecedores.find(f => f.categoria === nomeCat)) {
      fornecedores.push({ categoria: nomeCat, nome: 'A definir' });
    }
  }

  if (fornecedores.length === 0) {
    return [
      { categoria: 'Espaço / Venue', nome: 'A definir' },
      { categoria: 'Buffet', nome: 'A definir' },
      { categoria: 'Bebidas', nome: 'A definir' },
      { categoria: 'Decoração', nome: 'A definir' },
      { categoria: 'Flores', nome: 'A definir' },
      { categoria: 'Fotografia', nome: 'A definir' },
      { categoria: 'Filmagem', nome: 'A definir' },
      { categoria: 'Música / DJ', nome: 'A definir' },
      { categoria: 'Vestido', nome: 'A definir' },
      { categoria: 'Terno', nome: 'A definir' },
      { categoria: 'Beleza', nome: 'A definir' },
      { categoria: 'Papelaria', nome: 'A definir' },
      { categoria: 'Bolo e Doces', nome: 'A definir' },
      { categoria: 'Cerimonialista', nome: 'A definir' },
      { categoria: 'Transporte', nome: 'A definir' },
      { categoria: 'Iluminação', nome: 'A definir' },
      { categoria: 'Som', nome: 'A definir' },
      { categoria: 'Segurança', nome: 'A definir' },
    ];
  }
  return fornecedores;
}

/**
 * Gera itens de orçamento
 */
export function getItensOrcamento(cidade, estado) {
  const itens = [
    'Espaço e locação', 'Buffet e alimentação', 'Bebidas e bar', 'Decoração e flores',
    'Fotografia', 'Vídeo e filmagem', 'Música e DJ/banda', 'Vestido da noiva',
    'Terno do noivo', 'Beleza (cabelo/maquiagem)', 'Convites e papelaria', 'Lembrancinhas',
    'Transporte (noivos)', 'Transporte (convidados)', 'Cerimonialista', 'Bolo e doces',
    'Bem-casados', 'Aluguel de mesas/cadeiras', 'Toalhas e guardanapos',
    'Louças, talheres e taças', 'Iluminação cênica', 'Som e equipamentos',
    'Segurança', 'Estacionamento', 'Hospedagem (noite de núpcias)', 'Lua de mel (reserva)',
    'Alianças', 'Taxas e licenças', 'Presentes para padrinhos', 'Reserva de emergência (10%)',
  ];

  const percentuais = [18, 22, 10, 12, 6, 5, 6, 4, 2, 2, 1.5, 1, 1, 1.5, 2.5, 2, 1, 1.5, 0.8, 1, 1.5, 1.5, 0.8, 0.5, 1, 2, 1.5, 0.5, 0.8, 5];

  return itens.map((item, i) => ({
    item,
    percentual: percentuais[i],
    valor: getValorRegionalizado(item, cidade, estado),
  }));
}

/**
 * Retorna caminho público da imagem por categoria — CAMINHOS RELATIVOS (seguro para cliente)
 */
export function getImagem(categoria, chave) {
  const IMAGENS = {
    flores: {
      'Rosas': '/images/flores/rosas-1.jpg',
      'Orquídeas': '/images/flores/flores-default-1.jpg',
      'Lírios': '/images/flores/flores-default-2.jpg',
      'Tulipas': '/images/flores/flores-default-3.jpg',
      'Peônias': '/images/flores/flores-default-4.jpg',
      'Flores do campo': '/images/flores/flores-do-campo-1.jpg',
      'Flores secas': '/images/flores/flores-secas-1.jpg',
      'Eucalipto': '/images/flores/flores-default-5.jpg',
      'Hortênsias': '/images/flores/flores-default-6.jpg',
      'Gérberas': '/images/flores/flores-default-7.jpg',
      'Astilbe': '/images/flores/flores-default-8.jpg',
      'Dálias': '/images/flores/flores-default-9.jpg',
      'Chuva de ouro': '/images/flores/flores-default-10.jpg',
      'Alstroemérias': '/images/flores/flores-default-11.jpg',
      'Anêmonas': '/images/flores/flores-default-12.jpg',
      'Ranúnculos': '/images/flores/flores-default-13.jpg',
      'Lavanda': '/images/flores/flores-default-14.jpg',
      'Margaridas': '/images/flores/flores-default-15.jpg',
      'Gipsofila': '/images/flores/flores-default-16.jpg',
      'Antúrios': '/images/flores/flores-default-17.jpg',
      'Bromélias': '/images/flores/flores-default-18.jpg',
      'Orquídeas phalaenopsis': '/images/flores/flores-default-19.jpg',
      'Crisântemos': '/images/flores/flores-default-20.jpg',
      'Cala': '/images/flores/flores-default-21.jpg',
      'Proteas': '/images/flores/flores-default-22.jpg',
      'Statice': '/images/flores/flores-default-23.jpg',
      'Verônicas': '/images/flores/flores-default-24.jpg',
      'Amarílis': '/images/flores/flores-default-25.jpg',
      default: '/images/flores/flores-default-1.jpg',
    },
    vestido: {
      'Princesa': '/images/vestidos/vestido-default-1.jpg',
      'Sereia': '/images/vestidos/vestido-default-2.jpg',
      'Minimalista': '/images/vestidos/vestido-minimalista-1.jpg',
      'Boho': '/images/vestidos/vestido-boho-1.jpg',
      'Romântico': '/images/vestidos/vestido-minimalista-2.jpg',
      'Clássico': '/images/vestidos/vestido-minimalista-3.jpg',
      'Moderno': '/images/vestidos/vestido-minimalista-4.jpg',
      'Rústico': '/images/vestidos/vestido-boho-2.jpg',
      default: '/images/vestidos/vestido-default-1.jpg',
    },
    mesaPosta: {
      'classico': '/images/mesa/mesa-classico-1.jpg',
      'rustico': '/images/mesa/mesa-rustico-1.jpg',
      'romantico': '/images/mesa/mesa-romantico-1.jpg',
      'minimalista': '/images/mesa/mesa-minimalista-1.jpg',
      'boho': '/images/mesa/mesa-rustico-4.jpg',
      'moderno': '/images/mesa/mesa-default-2.jpg',
      default: '/images/mesa/mesa-classico-1.jpg',
    },
    decoracao: {
      'classico': '/images/decoracao/decor-classico-1.jpg',
      'rustico': '/images/decoracao/decor-rustico-1.jpg',
      'romantico': '/images/decoracao/decor-romantico-1.jpg',
      'minimalista': '/images/decoracao/decor-minimalista-1.jpg',
      'boho': '/images/decoracao/decor-boho-1.jpg',
      'moderno': '/images/decoracao/decor-moderno-1.jpg',
      default: '/images/decoracao/decor-classico-1.jpg',
    },
    cerimonia: {
      'classico': '/images/cerimonia/cerimonia-altar-1.jpg',
      'rustico': '/images/cerimonia/cerimonia-corredor-3.jpg',
      'romantico': '/images/cerimonia/cerimonia-beijo-1.jpg',
      'minimalista': '/images/cerimonia/cerimonia-aliancas-1.jpg',
      'boho': '/images/cerimonia/cerimonia-entrada-noiva-4.jpg',
      'moderno': '/images/cerimonia/cerimonia-saida-1.jpg',
      default: '/images/cerimonia/cerimonia-altar-1.jpg',
    },
    alimentacao: {
      'classico': '/images/alimentacao/bolo-casamento-1.jpg',
      'rustico': '/images/alimentacao/mesa-doces-1.jpg',
      'romantico': '/images/alimentacao/mesa-doces-5.jpg',
      'minimalista': '/images/alimentacao/coquetel-drinks-1.jpg',
      'boho': '/images/alimentacao/mesa-doces-10.jpg',
      'moderno': '/images/alimentacao/bolo-casamento-6.jpg',
      default: '/images/alimentacao/bolo-casamento-1.jpg',
    },
    entretenimento: {
      'classico': '/images/entretenimento/pista-danca-1.jpg',
      'rustico': '/images/entretenimento/dj-banda-1.jpg',
      'romantico': '/images/entretenimento/pista-danca-3.jpg',
      'minimalista': '/images/entretenimento/cabine-fotos-1.jpg',
      'boho': '/images/entretenimento/pista-danca-4.jpg',
      'moderno': '/images/entretenimento/dj-banda-2.jpg',
      default: '/images/entretenimento/pista-danca-1.jpg',
    },
    local: {
      'classico': '/images/local/local-salao-1.jpg',
      'rustico': '/images/local/local-sitio-1.jpg',
      'romantico': '/images/local/local-jardim-1.jpg',
      'minimalista': '/images/local/local-salao-10.jpg',
      'boho': '/images/local/local-jardim-3.jpg',
      'moderno': '/images/local/local-salao-5.jpg',
      default: '/images/local/local-default-1.jpg',
    },
    papelaria: {
      'classico': '/images/papelaria/convite-1.jpg',
      'rustico': '/images/papelaria/placa-boas-vindas-1.jpg',
      'romantico': '/images/papelaria/convite-5.jpg',
      'minimalista': '/images/papelaria/menu-lugar-1.jpg',
      'boho': '/images/papelaria/monograma-1.jpg',
      'moderno': '/images/papelaria/convite-3.jpg',
      default: '/images/papelaria/convite-1.jpg',
    },
  };

  return IMAGENS[categoria]?.[chave] || IMAGENS[categoria]?.default || null;
}
