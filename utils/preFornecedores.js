// utils/preFornecedores.js
// Importa pré-lista de fornecedores do memorial (tabela memoriais) automaticamente

const MAPEAMENTO_CATEGORIAS = {
  'Fotografia': 'fotografia',
  'Buffet': 'buffet',
  'Espaço / Venue': 'espaco_recepcao',
  'Oficializante': 'oficializante_religioso',
  'Celebrante laico': 'celebrante',
  'Floricultura / Decoração': 'floricultura',
  'DJ': 'dj',
  'Banda': 'banda',
  'Iluminação cênica': 'iluminacao_cenica',
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
  if (!eventoId || !supabase) return [];

  const { data: memorial } = await supabase
    .from('memoriais')
    .select('estado')
    .eq('evento_id', eventoId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single();

  if (!memorial || !memorial.estado) return [];

  const estado = typeof memorial.estado === 'string' ? JSON.parse(memorial.estado) : memorial.estado;

  // Se o estado já tem a lista pronta
  if (Array.isArray(estado.fornecedoresNecessarios)) return estado.fornecedoresNecessarios;
  if (Array.isArray(estado.fornecedores)) return estado.fornecedores;

  // Senão, gera a partir dos campos do estado
  return gerarFornecedoresDoEstado(estado);
}

function gerarFornecedoresDoEstado(estado) {
  if (!estado) return [];
  const lista = [];
  const add = (cat, nome) => lista.push({ categoria: cat, nome });

  add('Fotografia', 'Fotógrafo');
  add('Buffet', 'Buffet');
  add('Espaço / Venue', 'Espaço / Venue');

  if (['catolica', 'evangelica', 'judaica'].includes(estado.tipoCerimonia)) add('Oficializante', 'Oficializante');
  if (estado.tipoCerimonia === 'simbolica') add('Celebrante laico', 'Celebrante laico');
  if (estado.flores) add('Floricultura / Decoração', 'Floricultura / Decoração');
  if (estado.musicaFesta === 'dj') add('DJ', 'DJ');
  else if (estado.musicaFesta === 'banda') add('Banda', 'Banda');
  if (['praia', 'sitio', 'jardim', 'rooftop', 'haras'].includes(estado.tipoLocal)) {
    add('Iluminação cênica', 'Iluminação cênica');
    add('Som profissional', 'Som profissional');
  }

  return lista;
}

export async function importarPreFornecedores(eventoId, supabase, usuarioId) {
  if (!eventoId || !supabase || !usuarioId) return 0;

  // Verifica se já existem fornecedores para este evento
  const { data: existentes } = await supabase
    .from('fornecedores')
    .select('id')
    .eq('evento_id', eventoId)
    .limit(1);

  if (existentes && existentes.length > 0) return 0;

  // Extrai lista do memorial
  const listaMemorial = await extrairFornecedoresDoMemorial(eventoId, supabase);

  if (listaMemorial.length === 0) return 0;

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
      servico: '',
    };
  });

  const { error } = await supabase
    .from('fornecedores')
    .insert(preFornecedores);

  if (error) {
    console.error('Erro ao importar pré-fornecedores:', error);
    return 0;
  }

  return preFornecedores.length;
}

export default { importarPreFornecedores };