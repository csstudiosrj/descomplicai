/**
 * Utilitários obrigatórios para geração do PDF do Memorial
 * @module utils/pdfUtils
 */

import path from 'path';

const BASE_IMAGE_PATH = path.join(process.cwd(), 'public', 'images');

function img(categoria, arquivo) {
  return path.join(BASE_IMAGE_PATH, categoria, arquivo);
}

/**
 * Capitaliza nome próprio
 */
export function capitalizarNome(nome) {
  if (!nome) return '';
  return nome
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formata data ISO para DD/MM/AAAA
 */
export function formatarData(dataISO) {
  if (!dataISO) return 'Data a definir';
  const [ano, mes, dia] = dataISO.split('-');
  if (!ano || !mes || !dia) return 'Data a definir';
  return `${dia}/${mes}/${ano}`;
}

/**
 * Retorna paleta de 3 cores do usuário ou fallback
 */
export function getPaleta(dados) {
  if (dados?.paleta && Array.isArray(dados.paleta) && dados.paleta.length >= 3) {
    return dados.paleta.slice(0, 3);
  }
  return ['#8B6F5E', '#E5E0D9', '#F9F7F4'];
}

/**
 * Verifica se cor é escura (luminância < 128)
 */
export function isCorEscura(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
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
  if (!paleta || paleta.length === 0) return '#8B6F5E';
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
  return mapa[hex.toUpperCase()] || hex.toUpperCase();
}

/**
 * Calcula valor médio regionalizado
 */
export function getValorRegionalizado(categoria, cidade, estado) {
  const estadoLower = (estado || '').toLowerCase().trim();
  const cidadeLower = (cidade || '').toLowerCase().trim();

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
  const estadoLower = (estado || '').toLowerCase().trim();
  const cidadeLower = (cidade || '').toLowerCase().trim();

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
 * AGORA COM FALLBACK ROBUSTO: se não encontrar ##, retorna o texto inteiro como uma seção
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
    if (linha.startsWith('## ')) {
      temH2 = true;
      break;
    }
  }

  if (!temH2) {
    const linhasFiltradas = linhas.filter(l => l.trim());
    if (linhasFiltradas.length === 0) {
      return [{ titulo: 'Memorial do Casamento', linhas: ['Memorial gerado com sucesso.'] }];
    }
    return [{ titulo: 'Memorial do Casamento', linhas: linhasFiltradas }];
  }

  for (const linha of linhas) {
    if (linha.startsWith('## ')) {
      if (atual) secoes.push(atual);
      atual = { titulo: linha.replace('## ', '').trim(), linhas: [] };
    } else if (atual) {
      atual.linhas.push(linha);
    }
  }
  if (atual) secoes.push(atual);

  if (secoes.length === 0) {
    return [{ titulo: 'Memorial do Casamento', linhas: linhas.filter(l => l.trim()) }];
  }

  return secoes;
}

/**
 * Extrai itens de checklist
 */
export function extrairChecklist(secoes) {
  const checklist = [];
  for (const secao of secoes) {
    for (const linha of secao.linhas) {
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
 * Extrai fornecedores
 */
export function extrairFornecedores(secoes) {
  const fornecedores = [];
  const categorias = ['fotógrafo', 'fotografo', 'buffet', 'decorador', 'decoracao', 'decoração', 'dj', 'banda', 'musica', 'música', 'video', 'vídeo', 'cerimonialista', 'igreja', 'espaço', 'espaco', 'salão', 'salao', 'vestido', 'terno', 'beleza', 'cabelo', 'maquiagem', 'convite', 'papelaria', 'bolo', 'doces', 'florista', 'iluminação', 'iluminacao', 'som'];

  for (const secao of secoes) {
    for (const linha of secao.linhas) {
      const lower = linha.toLowerCase();
      for (const cat of categorias) {
        if (lower.includes(cat)) {
          const nome = linha.replace(/[*\-]\s*/, '').replace(/\*\*/g, '').trim();
          if (nome && nome.length > 3) {
            fornecedores.push({ categoria: cat.charAt(0).toUpperCase() + cat.slice(1), nome });
          }
          break;
        }
      }
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
 * Retorna imagem de referência por categoria — CAMINHOS LOCAIS ABSOLUTOS
 */
export function getImagem(categoria, chave) {
  const IMAGENS = {
    flores: {
      'Rosas': img('flores', 'rosas-1.jpg'),
      'Orquídeas': img('flores', 'flores-default-1.jpg'),
      'Lírios': img('flores', 'flores-default-2.jpg'),
      'Tulipas': img('flores', 'flores-default-3.jpg'),
      'Peônias': img('flores', 'flores-default-4.jpg'),
      'Flores do campo': img('flores', 'flores-do-campo-1.jpg'),
      'Flores secas': img('flores', 'flores-secas-1.jpg'),
      'Eucalipto': img('flores', 'flores-default-5.jpg'),
      'Hortênsias': img('flores', 'flores-default-6.jpg'),
      'Gérberas': img('flores', 'flores-default-7.jpg'),
      'Astilbe': img('flores', 'flores-default-8.jpg'),
      'Dálias': img('flores', 'flores-default-9.jpg'),
      'Chuva de ouro': img('flores', 'flores-default-10.jpg'),
      'Alstroemérias': img('flores', 'flores-default-11.jpg'),
      'Anêmonas': img('flores', 'flores-default-12.jpg'),
      'Ranúnculos': img('flores', 'flores-default-13.jpg'),
      'Lavanda': img('flores', 'flores-default-14.jpg'),
      'Margaridas': img('flores', 'flores-default-15.jpg'),
      'Gipsofila': img('flores', 'flores-default-16.jpg'),
      'Antúrios': img('flores', 'flores-default-17.jpg'),
      'Bromélias': img('flores', 'flores-default-18.jpg'),
      'Orquídeas phalaenopsis': img('flores', 'flores-default-19.jpg'),
      'Crisântemos': img('flores', 'flores-default-20.jpg'),
      'Cala': img('flores', 'flores-default-21.jpg'),
      'Proteas': img('flores', 'flores-default-22.jpg'),
      'Statice': img('flores', 'flores-default-23.jpg'),
      'Verônicas': img('flores', 'flores-default-24.jpg'),
      'Amarílis': img('flores', 'flores-default-25.jpg'),
      default: img('flores', 'flores-default-1.jpg'),
    },
    vestido: {
      'Princesa': img('vestidos', 'vestido-default-1.jpg'),
      'Sereia': img('vestidos', 'vestido-default-2.jpg'),
      'Minimalista': img('vestidos', 'vestido-minimalista-1.jpg'),
      'Boho': img('vestidos', 'vestido-boho-1.jpg'),
      'Romântico': img('vestidos', 'vestido-minimalista-2.jpg'),
      'Clássico': img('vestidos', 'vestido-minimalista-3.jpg'),
      'Moderno': img('vestidos', 'vestido-minimalista-4.jpg'),
      'Rústico': img('vestidos', 'vestido-boho-2.jpg'),
      default: img('vestidos', 'vestido-default-1.jpg'),
    },
    mesaPosta: {
      'classico': img('mesa', 'mesa-classico-1.jpg'),
      'rustico': img('mesa', 'mesa-rustico-1.jpg'),
      'romantico': img('mesa', 'mesa-romantico-1.jpg'),
      'minimalista': img('mesa', 'mesa-minimalista-1.jpg'),
      'boho': img('mesa', 'mesa-rustico-4.jpg'),
      'moderno': img('mesa', 'mesa-default-2.jpg'),
      default: img('mesa', 'mesa-classico-1.jpg'),
    },
    decoracao: {
      'classico': img('decoracao', 'decor-classico-1.jpg'),
      'rustico': img('decoracao', 'decor-rustico-1.jpg'),
      'romantico': img('decoracao', 'decor-romantico-1.jpg'),
      'minimalista': img('decoracao', 'decor-minimalista-1.jpg'),
      'boho': img('decoracao', 'decor-boho-1.jpg'),
      'moderno': img('decoracao', 'decor-moderno-1.jpg'),
      default: img('decoracao', 'decor-classico-1.jpg'),
    },
    cerimonia: {
      'classico': img('cerimonia', 'cerimonia-altar-1.jpg'),
      'rustico': img('cerimonia', 'cerimonia-corredor-3.jpg'),
      'romantico': img('cerimonia', 'cerimonia-beijo-1.jpg'),
      'minimalista': img('cerimonia', 'cerimonia-aliancas-1.jpg'),
      'boho': img('cerimonia', 'cerimonia-entrada-noiva-4.jpg'),
      'moderno': img('cerimonia', 'cerimonia-saida-1.jpg'),
      default: img('cerimonia', 'cerimonia-altar-1.jpg'),
    },
    alimentacao: {
      'classico': img('alimentacao', 'bolo-casamento-1.jpg'),
      'rustico': img('alimentacao', 'mesa-doces-1.jpg'),
      'romantico': img('alimentacao', 'mesa-doces-5.jpg'),
      'minimalista': img('alimentacao', 'coquetel-drinks-1.jpg'),
      'boho': img('alimentacao', 'mesa-doces-10.jpg'),
      'moderno': img('alimentacao', 'bolo-casamento-6.jpg'),
      default: img('alimentacao', 'bolo-casamento-1.jpg'),
    },
    entretenimento: {
      'classico': img('entretenimento', 'pista-danca-1.jpg'),
      'rustico': img('entretenimento', 'dj-banda-1.jpg'),
      'romantico': img('entretenimento', 'pista-danca-3.jpg'),
      'minimalista': img('entretenimento', 'cabine-fotos-1.jpg'),
      'boho': img('entretenimento', 'pista-danca-4.jpg'),
      'moderno': img('entretenimento', 'dj-banda-2.jpg'),
      default: img('entretenimento', 'pista-danca-1.jpg'),
    },
    local: {
      'classico': img('local', 'local-salao-1.jpg'),
      'rustico': img('local', 'local-sitio-1.jpg'),
      'romantico': img('local', 'local-jardim-1.jpg'),
      'minimalista': img('local', 'local-salao-10.jpg'),
      'boho': img('local', 'local-jardim-3.jpg'),
      'moderno': img('local', 'local-salao-5.jpg'),
      default: img('local', 'local-default-1.jpg'),
    },
    papelaria: {
      'classico': img('papelaria', 'convite-1.jpg'),
      'rustico': img('papelaria', 'placa-boas-vindas-1.jpg'),
      'romantico': img('papelaria', 'convite-5.jpg'),
      'minimalista': img('papelaria', 'menu-lugar-1.jpg'),
      'boho': img('papelaria', 'monograma-1.jpg'),
      'moderno': img('papelaria', 'convite-3.jpg'),
      default: img('papelaria', 'convite-1.jpg'),
    },
  };

  return IMAGENS[categoria]?.[chave] || IMAGENS[categoria]?.default || null;
}