// utils/preFornecedores.js
// Importa pre-lista de fornecedores do memorial (tabela memoriais) automaticamente

import { getCategoriaPrincipal, getSubcategoria } from './catalogoFornecedores';
import { computarCondicoes } from './condicoesFornecedores';

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
  'Aliancas': 'aliancas',
  'Fornecedor kosher': 'fornecedor_kosher',
  'Aula de Danca': 'aula_danca',
  'Fogos e Sparklers': 'fogos_sparklers',
  'Mesa de Frios': 'bolo_doces',
  'Menu Infantil': 'buffet',
  'Lua de Mel': 'agencia_viagem',
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
  const cond = computarCondicoes(estado);

  // --- Obrigatórios base ---
  add('Fotografia', 'Fotografo');
  add('Buffet', 'Buffet');
  add('Espaco / Venue', 'Espaco / Venue');

  // --- Alianças (sempre visível) ---
  if (!cond.aliancas_escolhidas) {
    add('Aliancas', 'Aliancas');
  }

  // --- Cerimônia ---
  if (cond.cerimonia_religiosa) {
    add('Oficializante', 'Oficializante');
  }
  if (cond.cerimonia_simbolica) {
    add('Celebrante laico', 'Celebrante laico');
  }
  if (cond.cerimonia_civil && !cond.ja_casados) {
    add('Celebrante laico', 'Juiz de paz / cartorio');
  }
  if (cond.cerimonia_judaica) {
    add('Fornecedor kosher', 'Fornecedor kosher');
  }

  // --- Decoração / Flores ---
  if (cond.tem_flores || !cond.decoracao_contratada) {
    add('Floricultura / Decoracao', 'Floricultura / Decoracao');
  }
  if (cond.tem_iluminacao && !cond.decoracao_contratada) {
    add('Decoracao', 'Iluminacao cenica');
  }
  if (cond.tem_mobiliario && !cond.decoracao_contratada) {
    add('Decoracao', 'Mobiliario especial');
  }
  if (cond.tem_backdrop && !cond.decoracao_contratada) {
    add('Decoracao', 'Backdrop');
  }

  // --- Música ---
  const musica = estado.musicaFesta || estado.musicaCerimonia || '';
  if (musica.toLowerCase().includes('dj')) add('DJ', 'DJ');
  if (musica.toLowerCase().includes('banda')) add('Banda', 'Banda');
  if (!musica && !cond.musica_contratada) {
    add('DJ', 'DJ'); // fallback
  }
  if (cond.musica_viva_cerimonia && !cond.musica_contratada) {
    add('Musica da Cerimonia', 'Musica ao vivo (cerimonia)');
  }

  // --- Local externo: infraestrutura ---
  if (cond.local_externo) {
    if (!cond.decoracao_contratada) add('Iluminacao cenica', 'Iluminacao cenica');
    if (!cond.musica_contratada) add('Som profissional', 'Som profissional');
  }
  if (cond.local_rural) {
    if (!cond.tem_gerador && !cond.gerador_contratado) add('Gerador', 'Gerador');
    if (estado.banheirosExtras !== true) add('Banheiros Extras', 'Banheiros Extras');
  }
  if (cond.local_praia) {
    if (!cond.tem_estacionamento) add('Estacionamento e Valet', 'Estacionamento organizado');
  }
  if (!cond.tem_cozinha_apoio && estado.cozinhaApoio === false) {
    add('Cozinha de Apoio', 'Cozinha de apoio');
  }

  // --- Convidados grandes ---
  if (cond.convidados_grandes) {
    if (!cond.seguranca_contratada) add('Seguranca', 'Seguranca');
    if (cond.transporte_convidados_sim && !cond.transporte_convidados_contratado) {
      add('Transporte Convidados', 'Transporte de Convidados');
    }
  }

  // --- Vestuário ---
  if (cond.tem_noiva && !cond.vestido_comprado) add('Vestido / Atelie', 'Vestido de Noiva');
  if (cond.tem_noivo && !cond.traje_noivo_contratado) add('Traje Masculino', 'Traje do Noivo');
  if (cond.tem_noiva && estado.belezaNoiva !== false) add('Beleza Noiva', 'Beleza da Noiva');
  if (cond.tem_madrinhas && estado.belezaMadrinhas !== false) {
    add('Beleza das Madrinhas', 'Beleza das Madrinhas');
  }

  // --- Cerimonialista ---
  if (!cond.cerimonialista_contratado) {
    add('Cerimonialista', 'Cerimonialista');
  }

  // --- Entretenimento ---
  if (cond.tem_cabine_fotos && !cond.cabine_fotos_contratada) {
    add('Cabine de Fotos', 'Cabine de Fotos');
  }
  if (cond.tem_drone && !cond.drone_contratado) {
    add('Drone', 'Drone');
  }
  if (cond.tem_animacao_infantil && !cond.animacao_infantil_contratada) {
    add('Animacao Infantil', 'Animacao Infantil');
  }
  if (cond.tem_fogos) {
    add('Fogos e Sparklers', 'Fogos e Sparklers');
  }
  if (cond.tem_aula_danca) {
    add('Aula de Danca', 'Aula de danca dos noivos');
  }

  // --- Alimentação expansão ---
  if (cond.tem_mesa_frios) {
    add('Mesa de Frios', 'Mesa de frios');
  }
  if (cond.tem_menu_infantil) {
    add('Menu Infantil', 'Menu infantil');
  }

  // --- Papelaria ---
  if (cond.convite_fisico && !cond.convites_encomendados) {
    add('Papelaria / Convites', 'Papelaria e Convites');
  }
  if (cond.convite_digital && !cond.convites_encomendados) {
    add('Papelaria / Convites', 'Convites digitais');
  }

  // --- Transporte noivos ---
  if (cond.transporte_especial_noivos || cond.tem_carro_noivos) {
    if (estado.transporteNoivos !== true) add('Transporte Noivos', 'Transporte dos Noivos');
  }

  // --- Bartender ---
  if (cond.open_bar_completo && !cond.bartender_contratado) {
    add('Bartender', 'Bartender');
  }

  // --- Lua de mel ---
  if (cond.tem_lua_de_mel && !cond.lua_de_mel_reservada) {
    add('Lua de Mel', 'Agencia de viagem');
  }

  // --- Pós-casamento fotos ---
  if (cond.tem_fotos_lua_de_mel) {
    add('Fotografia', 'Fotos lua de mel');
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
