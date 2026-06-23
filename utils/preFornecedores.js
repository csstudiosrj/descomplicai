// utils/preFornecedores.js
// Importa pre-lista de fornecedores do memorial (tabela memoriais) automaticamente

import { getCategoriaPrincipal, getSubcategoria } from './catalogoFornecedores';

const MAPEAMENTO_CATEGORIAS = {
  'Fotografia': 'fotografia',
  'Filmagem': 'filmagem',
  'Buffet': 'buffet',
  'Espaco / Venue': 'espaco_recepcao',
  'Oficializante': 'oficializante_religioso',
  'Celebrante laico': 'celebrante',
  'Floricultura / Decoracao': 'floricultura',
  'Decoracao': 'decoracao',
  'DJ': 'dj',
  'Banda': 'banda',
  'Iluminacao cenica': 'iluminacao_cenica',
  'Som profissional': 'som_profissional',
  'Cerimonialista': 'cerimonialista',
  'Vestido / Atelie': 'vestido_atelier',
  'Traje Masculino': 'traje_masculino',
  'Beleza Noiva': 'beleza_noiva',
  'Transporte Noivos': 'transporte_noivos',
  'Transporte Convidados': 'transporte_convidados',
  'Papelaria / Convites': 'papelaria',
  'Bartender': 'bartender',
  'Cabine de Fotos': 'cabine_fotos',
  'Animacao Infantil': 'animacao_infantil',
  'Drone': 'drone',
  'Gerador': 'geradores',
  'Banheiros Extras': 'banheiros_extras',
  'Seguranca': 'seguranca',
};

function getCategoriaPrincipalId(subcategoriaId) {
  const sub = getSubcategoria(subcategoriaId);
  return sub?.categoriaPrincipalId || 'outro';
}

/**
 * Busca o memorial do evento na tabela memoriais.
 * Tenta por evento_id primeiro, depois por user_id como fallback.
 */
async function extrairFornecedoresDoMemorial(eventoId, usuarioId, supabase) {
  if (!eventoId || !supabase) return [];

  // 1. Tenta buscar pelo evento_id
  let { data: memorial } = await supabase
    .from('memoriais')
    .select('id, estado, evento_id')
    .eq('evento_id', eventoId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. Se não encontrar, busca pelo user_id (fallback para memoriais antigos)
  if (!memorial && usuarioId) {
    const { data: memorialPorUser } = await supabase
      .from('memoriais')
      .select('id, estado, evento_id')
      .eq('user_id', usuarioId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (memorialPorUser) {
      memorial = memorialPorUser;

      // Atualiza o evento_id do memorial para linkar corretamente
      if (!memorial.evento_id && memorial.id) {
        await supabase
          .from('memoriais')
          .update({ evento_id: eventoId })
          .eq('id', memorial.id);
      }
    }
  }

  if (!memorial || !memorial.estado) return [];

  const estado = typeof memorial.estado === 'string' ? JSON.parse(memorial.estado) : memorial.estado;

  if (Array.isArray(estado.fornecedoresNecessarios) && estado.fornecedoresNecessarios.length > 0) {
    return estado.fornecedoresNecessarios;
  }
  if (Array.isArray(estado.fornecedores) && estado.fornecedores.length > 0) {
    return estado.fornecedores;
  }

  return gerarFornecedoresDoEstado(estado);
}

function gerarFornecedoresDoEstado(estado) {
  if (!estado) return [];
  const lista = [];
  const add = (cat, nome) => lista.push({ categoria: cat, nome });

  // --- Obrigatórios base ---
  add('Fotografia', 'Fotografo');
  add('Buffet', 'Buffet');
  add('Espaco / Venue', 'Espaco / Venue');

  // --- Cerimônia ---
  if (['catolica', 'evangelica', 'judaica'].includes(estado.tipoCerimonia)) {
    add('Oficializante', 'Oficializante');
  }
  if (estado.tipoCerimonia === 'simbolica') {
    add('Celebrante laico', 'Celebrante laico');
  }
  if (estado.tipoCerimonia === 'civil') {
    add('Celebrante laico', 'Juiz de paz / cartório');
  }

  // --- Decoração / Flores ---
  if (estado.flores || estado.decoracaoContratada !== true) {
    add('Floricultura / Decoracao', 'Floricultura / Decoracao');
  }

  // --- Música ---
  const musica = estado.musicaFesta || estado.musicaCerimonia || '';
  if (musica.toLowerCase().includes('dj')) add('DJ', 'DJ');
  if (musica.toLowerCase().includes('banda')) add('Banda', 'Banda');
  if (!musica && estado.musicaContratada !== true) {
    add('DJ', 'DJ'); // fallback
  }

  // --- Local externo: infraestrutura ---
  if (['praia', 'sitio', 'jardim', 'rooftop', 'haras'].includes(estado.tipoLocal)) {
    add('Iluminacao cenica', 'Iluminacao cenica');
    add('Som profissional', 'Som profissional');
  }
  if (['sitio', 'jardim', 'haras'].includes(estado.tipoLocal)) {
    if (estado.gerador !== true) add('Gerador', 'Gerador');
    if (estado.banheirosExtras !== true) add('Banheiros Extras', 'Banheiros Extras');
  }

  // --- Convidados grandes ---
  if (['grande', 'mega'].includes(estado.totalConvidados)) {
    if (estado.seguranca !== true) add('Seguranca', 'Seguranca');
    if (estado.transporteConvidados !== true) add('Transporte Convidados', 'Transporte Convidados');
  }

  // --- Vestuário ---
  if (estado.vestidoComprado !== true) add('Vestido / Atelie', 'Vestido de Noiva');
  if (estado.trajeNoivoContratado !== true) add('Traje Masculino', 'Traje do Noivo');
  if (estado.belezaNoiva !== false) add('Beleza Noiva', 'Beleza da Noiva');

  // --- Cerimonialista ---
  if (estado.cerimonialistaContratado !== true) {
    add('Cerimonialista', 'Cerimonialista');
  }

  // --- Entretenimento ---
  if (Array.isArray(estado.atividadesEntretenimento)) {
    if (estado.atividadesEntretenimento.includes('cabine-fotos') && estado.cabineFotos !== true) {
      add('Cabine de Fotos', 'Cabine de Fotos');
    }
    if (estado.atividadesEntretenimento.includes('drone') && estado.droneContratado !== true) {
      add('Drone', 'Drone');
    }
    if (estado.atividadesEntretenimento.includes('animacao-infantil') && estado.animacaoInfantil !== true) {
      add('Animacao Infantil', 'Animacao Infantil');
    }
  }

  // --- Papelaria ---
  if (estado.formatoConvite === 'fisico' && estado.convitesEncomendados !== true) {
    add('Papelaria / Convites', 'Papelaria e Convites');
  }

  // --- Transporte noivos ---
  if (estado.transporteNoivos !== true) {
    add('Transporte Noivos', 'Transporte dos Noivos');
  }

  // --- Bartender ---
  if (estado.tipoBar === 'open bar completo' && estado.bartender !== true) {
    add('Bartender', 'Bartender');
  }

  return lista;
}

export async function importarPreFornecedores(eventoId, supabase, usuarioId) {
  if (!eventoId || !supabase || !usuarioId) return 0;

  // Extrai lista do memorial
  const listaMemorial = await extrairFornecedoresDoMemorial(eventoId, usuarioId, supabase);

  if (listaMemorial.length === 0) return 0;

  // Busca APENAS pre-fornecedores já existentes para este evento
  const { data: preExistentes } = await supabase
    .from('fornecedores')
    .select('categoria')
    .eq('evento_id', eventoId)
    .eq('pre_criado', true);

  const categoriasPreExistentes = new Set((preExistentes || []).map(f => f.categoria));

  const preFornecedores = listaMemorial.map((item) => {
    const subcategoriaId = MAPEAMENTO_CATEGORIAS[item.nome] || MAPEAMENTO_CATEGORIAS[item.categoria] || 'outro';
    const categoriaPrincipal = getCategoriaPrincipalId(subcategoriaId);
    return {
      evento_id: eventoId,
      usuario_id: usuarioId,
      categoria: subcategoriaId,
      categoria_principal: categoriaPrincipal,
      nome: '',
      empresa: '',
      status: 'a_contratar',
      valor_total: 0,
      valor_entrada: 0,
      valor_saldo: 0,
      pre_criado: true,
      servico: item.nome || '',
    };
  }).filter((f) => {
    // Só ignora se já existe um PRE-CRIADO com a mesma categoria
    // Manuais não bloqueiam a importação
    return !categoriasPreExistentes.has(f.categoria);
  });

  if (preFornecedores.length === 0) return 0;

  const { error } = await supabase
    .from('fornecedores')
    .insert(preFornecedores);

  if (error) {
    console.error('Erro ao importar pre-fornecedores:', error);
    return 0;
  }

  return preFornecedores.length;
}

export default { importarPreFornecedores };