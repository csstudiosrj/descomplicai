// utils/preFornecedores.js
// Importa pre-lista de fornecedores do memorial (tabela memoriais) automaticamente

const MAPEAMENTO_CATEGORIAS = {
  'Fotografia': 'fotografia',
  'Buffet': 'buffet',
  'Espaco / Venue': 'espaco_recepcao',
  'Oficializante': 'oficializante_religioso',
  'Celebrante laico': 'celebrante',
  'Floricultura / Decoracao': 'floricultura',
  'DJ': 'dj',
  'Banda': 'banda',
  'Iluminacao cenica': 'iluminacao_cenica',
  'Som profissional': 'som_profissional',
};

function getCategoriaPrincipalId(subcategoriaId) {
  const mapa = {
    fotografia: 'foto_video', filmagem: 'foto_video', drone: 'foto_video',
    buffet: 'alimentacao_bebidas', bolo_doces: 'alimentacao_bebidas',
    bebidas: 'alimentacao_bebidas', bartender: 'alimentacao_bebidas',
    espaco_recepcao: 'local_infraestrutura', mobiliario_locacao: 'local_infraestrutura',
    som_profissional: 'local_infraestrutura', geradores: 'local_infraestrutura',
    banheiros_extras: 'local_infraestrutura', seguranca: 'local_infraestrutura',
    oficializante_religioso: 'cerimonia_assessoria', celebrante: 'cerimonia_assessoria',
    cerimonialista: 'cerimonia_assessoria',
    floricultura: 'decoracao_flores', decoracao: 'decoracao_flores',
    iluminacao_cenica: 'decoracao_flores',
    dj: 'musica_entretenimento', banda: 'musica_entretenimento',
    musica_festa: 'musica_entretenimento', musica_cerimonia: 'musica_entretenimento',
    cabine_fotos: 'musica_entretenimento', animacao_infantil: 'musica_entretenimento',
    beleza_noiva: 'beleza_vestuario', dia_noivo: 'beleza_vestuario',
    beleza_madrinhas: 'beleza_vestuario', vestido_atelier: 'beleza_vestuario',
    traje_masculino: 'beleza_vestuario',
    transporte_noivos: 'transporte', transporte_convidados: 'transporte',
    papelaria: 'papelaria_detalhes', grafica: 'papelaria_detalhes',
    aliancas: 'papelaria_detalhes', bem_casados: 'papelaria_detalhes',
  };
  return mapa[subcategoriaId] || 'outro';
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

  // 2. Se nao encontrar, busca pelo user_id (fallback para memoriais antigos)
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

  add('Fotografia', 'Fotografo');
  add('Buffet', 'Buffet');
  add('Espaco / Venue', 'Espaco / Venue');

  if (['catolica', 'evangelica', 'judaica'].includes(estado.tipoCerimonia)) add('Oficializante', 'Oficializante');
  if (estado.tipoCerimonia === 'simbolica') add('Celebrante laico', 'Celebrante laico');
  if (estado.flores) add('Floricultura / Decoracao', 'Floricultura / Decoracao');

  // Correcao: "Banda + DJ" deve adicionar ambos
  const musica = estado.musicaFesta || '';
  if (musica.toLowerCase().includes('dj')) add('DJ', 'DJ');
  if (musica.toLowerCase().includes('banda')) add('Banda', 'Banda');

  if (['praia', 'sitio', 'jardim', 'rooftop', 'haras'].includes(estado.tipoLocal)) {
    add('Iluminacao cenica', 'Iluminacao cenica');
    add('Som profissional', 'Som profissional');
  }

  return lista;
}

export async function importarPreFornecedores(eventoId, supabase, usuarioId) {
  if (!eventoId || !supabase || !usuarioId) return 0;

  // Extrai lista do memorial
  const listaMemorial = await extrairFornecedoresDoMemorial(eventoId, usuarioId, supabase);

  if (listaMemorial.length === 0) return 0;

  // Busca APENAS pre-fornecedores ja existentes para este evento
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
    // So ignora se ja existe um PRE-CRIADO com a mesma categoria
    // Manuais nao bloqueiam a importacao
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