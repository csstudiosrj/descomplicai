/**
 * Utilitários obrigatórios para geração do PDF do Memorial
 * @module utils/pdfUtils
 */

/**
 * Capitaliza nome próprio
 * @param {string} nome
 * @returns {string}
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
   * @param {string} dataISO
   * @returns {string}
   */
  export function formatarData(dataISO) {
    if (!dataISO) return 'Data a definir';
    const [ano, mes, dia] = dataISO.split('-');
    if (!ano || !mes || !dia) return 'Data a definir';
    return `${dia}/${mes}/${ano}`;
  }
  
  /**
   * Retorna paleta de 3 cores do usuário ou fallback
   * @param {Object} dados
   * @returns {string[]}
   */
  export function getPaleta(dados) {
    if (dados?.paleta && Array.isArray(dados.paleta) && dados.paleta.length >= 3) {
      return dados.paleta.slice(0, 3);
    }
    return ['#8B6F5E', '#E5E0D9', '#F9F7F4'];
  }
  
  /**
   * Verifica se cor é escura (luminância < 128)
   * @param {string} hex
   * @returns {boolean}
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
   * @param {string} hex
   * @returns {string}
   */
  export function getCorContraste(hex) {
    return isCorEscura(hex) ? '#FFFFFF' : '#1A1714';
  }
  
  /**
   * Retorna a cor mais escura da paleta (para bordas)
   * @param {string[]} paleta
   * @returns {string}
   */
  export function getCorBorda(paleta) {
    if (!paleta || paleta.length === 0) return '#8B6F5E';
    const escuras = paleta.filter(isCorEscura);
    if (escuras.length > 0) return escuras[0];
    return paleta[0];
  }
  
  /**
   * Nome da cor a partir do hex (simplificado)
   * @param {string} hex
   * @returns {string}
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
   * Calcula valor médio regionalizado baseado em cidade/estado
   * @param {string} categoria
   * @param {string} cidade
   * @param {string} estado
   * @returns {number}
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
    };
  
    const valorBase = base[categoria] || 1000;
    return Math.round(valorBase * multiplicador);
  }
  
  /**
   * Retorna dicas regionais baseadas em cidade/estado
   * @param {string} cidade
   * @param {string} estado
   * @returns {{clima: string, cuidados: string[], melhoresEpocas: string[]}}
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
   * @param {string} memorial
   * @returns {Array<{titulo: string, linhas: string[]}>}
   */
  export function parsearMemorial(memorial) {
    const secoes = [];
    const linhas = (memorial || '').split('\n');
    let atual = null;
    for (const linha of linhas) {
      if (linha.startsWith('## ')) {
        if (atual) secoes.push(atual);
        atual = { titulo: linha.replace('## ', '').trim(), linhas: [] };
      } else if (atual) {
        atual.linhas.push(linha);
      }
    }
    if (atual) secoes.push(atual);
    return secoes;
  }
  
  /**
   * Extrai itens de checklist do memorial (respostas "ainda não sei")
   * @param {Array} secoes
   * @returns {Array<{item: string, prazo: string}>}
   */
  export function extrairChecklist(secoes) {
    const checklist = [];
    for (const secao of secoes) {
      for (const linha of secao.linhas) {
        const lower = linha.toLowerCase();
        if (lower.includes('ainda não sei') || lower.includes('ainda nao sei') || lower.includes('pendente') || lower.includes('a definir') || lower.includes('a decidir')) {
          const item = linha.replace(/[*\-]\s*/, '').replace(/\*\*/g, '').trim();
          if (item) {
            checklist.push({ item, prazo: 'A definir' });
          }
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
   * Extrai fornecedores mencionados no memorial
   * @param {Array} secoes
   * @returns {Array<{categoria: string, nome: string}>}
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
   * Gera itens de orçamento completos (30+)
   * @param {string} cidade
   * @param {string} estado
   * @returns {Array<{item: string, percentual: number, valor: number}>}
   */
  export function getItensOrcamento(cidade, estado) {
    const itens = [
      'Espaço e locação',
      'Buffet e alimentação',
      'Bebidas e bar',
      'Decoração e flores',
      'Fotografia',
      'Vídeo e filmagem',
      'Música e DJ/banda',
      'Vestido da noiva',
      'Terno do noivo',
      'Beleza (cabelo/maquiagem)',
      'Convites e papelaria',
      'Lembrancinhas',
      'Transporte (noivos)',
      'Transporte (convidados)',
      'Cerimonialista',
      'Bolo e doces',
      'Bem-casados',
      'Aluguel de mesas/cadeiras',
      'Toalhas e guardanapos',
      'Louças, talheres e taças',
      'Iluminação cênica',
      'Som e equipamentos',
      'Segurança',
      'Estacionamento',
      'Hospedagem (noite de núpcias)',
      'Lua de mel (reserva)',
      'Alianças',
      'Taxas e licenças',
      'Presentes para padrinhos',
      'Reserva de emergência (10%)',
    ];
  
    const percentuais = [18, 22, 10, 12, 6, 5, 6, 4, 2, 2, 1.5, 1, 1, 1.5, 2.5, 2, 1, 1.5, 0.8, 1, 1.5, 1.5, 0.8, 0.5, 1, 2, 1.5, 0.5, 0.8, 5];
  
    return itens.map((item, i) => ({
      item,
      percentual: percentuais[i],
      valor: getValorRegionalizado(item, cidade, estado),
    }));
  }
  
  /**
   * Retorna imagem de referência por categoria
   * @param {string} categoria
   * @param {string} chave
   * @returns {string|null}
   */
  export function getImagem(categoria, chave) {
    const IMAGENS = {
      flores: {
        'Rosas': 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400',
        'Orquídeas': 'https://images.unsplash.com/photo-1524592628638-25ae9e6a7c74?w=400',
        'Hortênsias brancas': 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400',
        'Girassóis': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
        'Margaridas': 'https://images.unsplash.com/photo-1508610041833-9f3d18d4ce3f?w=400',
        'Ranúnculos': 'https://images.unsplash.com/photo-1589123053646-4e8c49b46e1a?w=400',
        'Flores secas': 'https://images.unsplash.com/photo-1606041008023-472cdb5e530f?w=400',
        'Antúrios': 'https://images.unsplash.com/photo-1561181286-d5ef734d74e6?w=400',
        'Helicônias': 'https://images.unsplash.com/photo-1573481070555-1ba1cd7f7c54?w=400',
        'Copo-de-leite': 'https://images.unsplash.com/photo-1593483316242-1eae1e0c1cf8?w=400',
        'Peônias': 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400',
        'Lavanda': 'https://images.unsplash.com/photo-1498579397066-22750a3cb424?w=400',
        'Rosas rosa': 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400',
        'Rosas escuras': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        'Dálias negras': 'https://images.unsplash.com/photo-1508610041833-9f3d18d4ce3f?w=400',
        'Proteas': 'https://images.unsplash.com/photo-1561181286-d5ef734d74e6?w=400',
        'Musgo': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400',
        'Costelas-de-adão': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
        default: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400',
      },
      vestido: {
        'Cauda longa': 'https://images.unsplash.com/photo-1520975916093-a1b5c5a1b3f0?w=400',
        'Renda francesa': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        'Cetim estruturado': 'https://images.unsplash.com/photo-1550639525-c97d454acf70?w=400',
        'Renda boho': 'https://images.unsplash.com/photo-1515562141580-4f50a5d4e4e4?w=400',
        'Cauda leve': 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e2?w=400',
        'Tule natural': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
        'Corte reto minimalista': 'https://images.unsplash.com/photo-1551787766-1f3e9e1e6e3a?w=400',
        'Corte clean em crepe': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
        'Princesa com saia volumosa': 'https://images.unsplash.com/photo-1520975916093-a1b5c5a1b3f0?w=400',
        'Vestido fluido em crepe': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        'Vestido leve em chiffon': 'https://images.unsplash.com/photo-1515562141580-4f50a5d4e4e4?w=400',
        'Vestido escuro em renda': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
        'Renda vintage': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400',
        default: 'https://images.unsplash.com/photo-1551787766-1f3e9e1e6e3a?w=400',
      },
      mesaPosta: {
        'classico': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
        'rustico': 'https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=400',
        'boho': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
        'moderno': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
        'minimalista': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
        'industrial': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400',
        'tropical': 'https://images.unsplash.com/photo-1520453803296-c39e5b1e4e3a?w=400',
        'romantico': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
        'gotico': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
        'vintage': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400',
        default: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
      },
      decoracao: {
        'classico': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
        'rustico': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        'boho': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
        'moderno': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400',
        'minimalista': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
        'industrial': 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400',
        'tropical': 'https://images.unsplash.com/photo-1520453803296-c39e5b1e4e3a?w=400',
        'romantico': 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
        'gotico': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
        'vintage': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400',
        default: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
      },
      cerimonia: {
        'classico': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        'rustico': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
        'boho': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
        'moderno': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
        'minimalista': 'https://images.unsplash.com/photo-1520854221256-17451cc330e7?w=400',
        'industrial': 'https://images.unsplash.com/photo-1508219803418-5f1f89469b50?w=400',
        'tropical': 'https://images.unsplash.com/photo-1520453803296-c39e5b1e4e3a?w=400',
        'romantico': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        'gotico': 'https://images.unsplash.com/photo-1508219803418-5f1f89469b50?w=400',
        'vintage': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400',
        default: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      },
    };
  
    return IMAGENS[categoria]?.[chave] || IMAGENS[categoria]?.default || null;
  }