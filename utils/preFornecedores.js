// utils/preFornecedores.js
// Importa pré-lista de fornecedores do memorial automaticamente
// Chamado quando o painel é acessado e fornecedores está vazio

// Mapeamento: nome legível do memorial → ID da subcategoria no catálogo
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
  
  // Busca categoria_principal a partir da subcategoria
  function getCategoriaPrincipalId(subcategoriaId) {
    const mapa = {
      fotografia: 'foto_video',
      filmagem: 'foto_video',
      drone: 'foto_video',
      buffet: 'alimentacao_bebidas',
      bolo_doces: 'alimentacao_bebidas',
      bebidas: 'alimentacao_bebidas',
      bartender: 'alimentacao_bebidas',
      espaco_recepcao: 'local_infraestrutura',
      mobiliario_locacao: 'local_infraestrutura',
      som_profissional: 'local_infraestrutura',
      geradores: 'local_infraestrutura',
      banheiros_extras: 'local_infraestrutura',
      seguranca: 'local_infraestrutura',
      oficializante_religioso: 'cerimonia_assessoria',
      celebrante: 'cerimonia_assessoria',
      cerimonialista: 'cerimonia_assessoria',
      floricultura: 'decoracao_flores',
      decoracao: 'decoracao_flores',
      iluminacao_cenica: 'decoracao_flores',
      dj: 'musica_entretenimento',
      banda: 'musica_entretenimento',
      musica_festa: 'musica_entretenimento',
      musica_cerimonia: 'musica_entretenimento',
      cabine_fotos: 'musica_entretenimento',
      animacao_infantil: 'musica_entretenimento',
      beleza_noiva: 'beleza_vestuario',
      dia_noivo: 'beleza_vestuario',
      beleza_madrinhas: 'beleza_vestuario',
      vestido_atelier: 'beleza_vestuario',
      traje_masculino: 'beleza_vestuario',
      transporte_noivos: 'transporte',
      transporte_convidados: 'transporte',
      papelaria: 'papelaria_detalhes',
      grafica: 'papelaria_detalhes',
      aliancas: 'papelaria_detalhes',
      bem_casados: 'papelaria_detalhes',
    };
    return mapa[subcategoriaId] || 'outro';
  }
  
  /**
   * Cria pré-fornecedores a partir do memorial do evento.
   * Só cria se a tabela fornecedores estiver vazia para o evento.
   * @param {Object} evento — objeto do evento (deve ter evento.dados ou evento.memorial)
   * @param {Object} supabase — cliente supabase
   * @param {string} usuarioId — id do usuário logado
   * @returns {Promise<number>} — quantidade de fornecedores criados
   */
  export async function importarPreFornecedores(evento, supabase, usuarioId) {
    if (!evento || !supabase || !usuarioId) return 0;
  
    // Verifica se já existem fornecedores para este evento
    const { data: existentes } = await supabase
      .from('fornecedores')
      .select('id')
      .eq('evento_id', evento.id)
      .limit(1);
  
    if (existentes && existentes.length > 0) return 0; // Já tem fornecedores, não faz nada
  
    // Busca lista do memorial — tenta em evento.dados primeiro, depois evento.memorial
    let listaMemorial = [];
    try {
      const dados = evento.dados ? JSON.parse(evento.dados) : null;
      if (dados && Array.isArray(dados.fornecedoresNecessarios)) {
        listaMemorial = dados.fornecedoresNecessarios;
      } else if (dados && Array.isArray(dados.fornecedores)) {
        listaMemorial = dados.fornecedores;
      }
    } catch (e) {
      // silent fail
    }
  
    // Se não achou no dados, tenta buscar o memorial gerado
    if (listaMemorial.length === 0 && evento.memorial) {
      try {
        const memorial = JSON.parse(evento.memorial);
        if (Array.isArray(memorial.fornecedoresNecessarios)) {
          listaMemorial = memorial.fornecedoresNecessarios;
        }
      } catch (e) {
        // silent fail
      }
    }
  
    if (listaMemorial.length === 0) return 0;
  
    // Cria os pré-fornecedores
    const preFornecedores = listaMemorial.map((item) => {
      const subcategoriaId = MAPEAMENTO_CATEGORIAS[item.nome] || MAPEAMENTO_CATEGORIAS[item.categoria] || 'outro';
      const categoriaPrincipal = getCategoriaPrincipalId(subcategoriaId);
      return {
        evento_id: evento.id,
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