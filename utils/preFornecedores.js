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
 * Busca o memorial do evento na tabela memoriais e extrai a lista de fornecedores.
 */
async function extrairFornecedoresDoMemorial(eventoId, supabase) {
  if (!eventoId || !supabase) {
    console.log('[preFornecedores] eventoId ou supabase ausente');
    return [];
  }

  console.log('[preFornecedores] Buscando memorial para evento:', eventoId);

  // Tenta tabela 'memoriais' (plural)
  const { data: memorial, error: err1 } = await supabase
    .from('memoriais')
    .select('estado')
    .eq('evento_id', eventoId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (err1) {
    console.error('[preFornecedores] Erro na tabela memoriais:', err1);
  }

  if (memorial && memorial.estado) {
    console.log('[preFornecedores] Memorial encontrado em memoriais');
    const estado = typeof memorial.estado === 'string' ? JSON.parse(memorial.estado) : memorial.estado;
    if (Array.isArray(estado.fornecedoresNecessarios)) return estado.fornecedoresNecessarios;
    if (Array.isArray(estado.fornecedores)) return estado.fornecedores;
    return gerarFornecedoresDoEstado(estado);
  }

  // Tenta tabela 'memorial' (singular) como fallback
  console.log('[preFornecedores] Tentando tabela memorial (singular)...');
  const { data: memorial2, error: err2 } = await supabase
    .from('memorial')
    .select('estado')
    .eq('evento_id', eventoId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (err2) {
    console.error('[preFornecedores] Erro na tabela memorial:', err2);
  }

  if (memorial2 && memorial2.estado) {
    console.log('[preFornecedores] Memorial encontrado em memorial');
    const estado = typeof memorial2.estado === 'string' ? JSON.parse(memorial2.estado) : memorial2.estado;
    if (Array.isArray(estado.fornecedoresNecessarios)) return estado.fornecedoresNecessarios;
    if (Array.isArray(estado.fornecedores)) return estado.fornecedores;
    return gerarFornecedoresDoEstado(estado);
  }

  console.log('[preFornecedores] Nenhum memorial encontrado em nenhuma tabela');
  return [];
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
  if (estado.musicaFesta === 'dj') add('DJ', 'DJ');
  else if (estado.musicaFesta === 'banda') add('Banda', 'Banda');
  if (['praia', 'sitio', 'jardim', 'rooftop', 'haras'].includes(estado.tipoLocal)) {
    add('Iluminacao cenica', 'Iluminacao cenica');
    add('Som profissional', 'Som profissional');
  }

  return lista;
}

export async function importarPreFornecedores(eventoId, supabase, usuarioId) {
  if (!eventoId || !supabase || !usuarioId) {
    console.log('[preFornecedores] Parametros ausentes:', { eventoId, usuarioId });
    return 0;
  }

  console.log('[preFornecedores] Iniciando importacao para evento:', eventoId);

  // Extrai lista do memorial
  const listaMemorial = await extrairFornecedoresDoMemorial(eventoId, supabase);

  console.log('[preFornecedores] Lista extraida do memorial:', listaMemorial.length, 'itens');

  if (listaMemorial.length === 0) return 0;

  // Busca fornecedores ja existentes para este evento
  const { data: existentes, error: errExistentes } = await supabase
    .from('fornecedores')
    .select('categoria, categoria_principal, servico')
    .eq('evento_id', eventoId);

  if (errExistentes) {
    console.error('[preFornecedores] Erro ao buscar existentes:', errExistentes);
  }

  console.log('[preFornecedores] Fornecedores existentes:', existentes?.length || 0);

  const existentesSet = new Set(
    (existentes || []).map(f => `${f.categoria || ''}|${f.categoria_principal || ''}|${f.servico || ''}`)
  );

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
    const chave = `${f.categoria}|${f.categoria_principal}|${f.servico}`;
    const duplicado = existentesSet.has(chave);
    if (duplicado) console.log('[preFornecedores] Ignorando duplicado:', f.servico);
    return !duplicado;
  });

  console.log('[preFornecedores] Pre-fornecedores a inserir:', preFornecedores.length);

  if (preFornecedores.length === 0) return 0;

  const { error } = await supabase
    .from('fornecedores')
    .insert(preFornecedores);

  if (error) {
    console.error('[preFornecedores] Erro ao inserir:', error);
    return 0;
  }

  console.log('[preFornecedores] Sucesso:', preFornecedores.length, 'inseridos');
  return preFornecedores.length;
}

export default { importarPreFornecedores };