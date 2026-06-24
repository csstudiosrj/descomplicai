// utils/gerador-financeiro.js
// Gera linhas sugeridas de orçamento no financeiro baseado no memorial
// Percentuais baseados em média de casamentos brasileiros

/**
 * Mapeia subcategoria → categoria principal (catálogo centralizado)
 */
function getCategoriaPrincipal(subcategoria) {
    const mapa = {
      buffet: 'alimentacao_bebidas',
      espaco_recepcao: 'local_infraestrutura',
      decoracao: 'decoracao_flores',
      floricultura: 'decoracao_flores',
      fotografia: 'foto_video',
      filmagem: 'foto_video',
      dj: 'musica_entretenimento',
      banda: 'musica_entretenimento',
      musica_festa: 'musica_entretenimento',
      musica_cerimonia: 'musica_entretenimento',
      vestido_atelier: 'beleza_vestuario',
      traje_masculino: 'beleza_vestuario',
      beleza_noiva: 'beleza_vestuario',
      beleza_madrinhas: 'beleza_vestuario',
      papelaria: 'papelaria_detalhes',
      bolo_doces: 'alimentacao_bebidas',
      bartender: 'alimentacao_bebidas',
      transporte_noivos: 'transporte',
      transporte_convidados: 'transporte',
      seguranca: 'local_infraestrutura',
      aliancas: 'papelaria_detalhes',
      agencia_viagem: 'Outros',
      cerimonialista: 'cerimonia_assessoria',
      animacao_infantil: 'musica_entretenimento',
      som_profissional: 'musica_entretenimento',
      iluminacao_cenica: 'decoracao_flores',
      fogos_sparklers: 'musica_entretenimento',
      aula_danca: 'musica_entretenimento',
      cabine_fotos: 'musica_entretenimento',
      drone: 'foto_video',
      geradores: 'local_infraestrutura',
      banheiros_extras: 'local_infraestrutura',
      cozinha_apoio: 'local_infraestrutura',
      estacionamento_valet: 'transporte',
      fornecedor_kosher: 'alimentacao_bebidas',
      celebrante: 'cerimonia_assessoria',
      oficializante_religioso: 'cerimonia_assessoria',
      lembrancinhas: 'papelaria_detalhes',
      kit_saida: 'papelaria_detalhes',
    };
    return mapa[subcategoria] || 'Outros';
  }
  
  /**
   * Regras de percentuais por categoria
   * Cada regra: { categoria, subcategoria, percentual, descricao, condicao }
   */
  const REGRAS_FINANCEIRO = [
    {
      categoria: 'Buffet',
      subcategoria: 'buffet',
      percentual: 0.35,
      descricao: 'Buffet e bebidas (estimativa)',
      condicao: (e) => true, // sempre
    },
    {
      categoria: 'Espaço / Venue',
      subcategoria: 'espaco_recepcao',
      percentual: 0.20,
      descricao: 'Locação do espaço (estimativa)',
      condicao: (e) => e.espacoContratado !== true,
    },
    {
      categoria: 'Decoração e Flores',
      subcategoria: 'decoracao',
      percentual: 0.12,
      descricao: 'Decoração, flores e iluminação (estimativa)',
      condicao: (e) => e.flores === true || e.decoracaoContratada !== true || e.iluminacao || e.backdrop === true || e.tecido === true,
    },
    {
      categoria: 'Fotografia',
      subcategoria: 'fotografia',
      percentual: 0.08,
      descricao: 'Fotógrafo do casamento (estimativa)',
      condicao: (e) => e.fotografoContratado !== true,
    },
    {
      categoria: 'Filmagem',
      subcategoria: 'filmagem',
      percentual: 0.05,
      descricao: 'Filmagem do casamento (estimativa)',
      condicao: (e) => e.filmagemContratada !== true,
    },
    {
      categoria: 'Música / DJ / Banda',
      subcategoria: 'musica_festa',
      percentual: 0.06,
      descricao: 'DJ, banda ou som para festa (estimativa)',
      condicao: (e) => e.musicaContratada !== true,
    },
    {
      categoria: 'Vestido de Noiva',
      subcategoria: 'vestido_atelier',
      percentual: 0.05,
      descricao: 'Vestido / ateliê (estimativa)',
      condicao: (e) => e.vestidoComprado !== true && e.estiloVestido !== 'jumpsuit',
    },
    {
      categoria: 'Macacão / Jumpsuit',
      subcategoria: 'vestido_atelier',
      percentual: 0.03,
      descricao: 'Macacão / jumpsuit de noiva (estimativa)',
      condicao: (e) => e.vestidoComprado !== true && e.estiloVestido === 'jumpsuit',
    },
    {
      categoria: 'Traje do Noivo',
      subcategoria: 'traje_masculino',
      percentual: 0.03,
      descricao: 'Traje do noivo (estimativa)',
      condicao: (e) => e.trajeNoivoContratado !== true,
    },
    {
      categoria: 'Beleza',
      subcategoria: 'beleza_noiva',
      percentual: 0.03,
      descricao: 'Make, hair e beleza (estimativa)',
      condicao: (e) => e.testeBeleza !== true || e.profissionalBeleza !== true,
    },
    {
      categoria: 'Papelaria / Convites',
      subcategoria: 'papelaria',
      percentual: 0.02,
      descricao: 'Convites, save the date, papelaria (estimativa)',
      condicao: (e) => e.convitesEncomendados !== true || e.saveTheDate === 'sim',
    },
    {
      categoria: 'Bolo e Doces',
      subcategoria: 'bolo_doces',
      percentual: 0.02,
      descricao: 'Bolo, bem-casados e mesa de doces (estimativa)',
      condicao: (e) => e.bemCasados === true || e.mesaDoces === true || e.mesaDocesExposta === true,
    },
    {
      categoria: 'Bartender',
      subcategoria: 'bartender',
      percentual: 0.02,
      descricao: 'Bartender e open bar (estimativa)',
      condicao: (e) => e.tipoBar === 'open bar completo' || e.bartender === true,
    },
    {
      categoria: 'Lua de Mel',
      subcategoria: 'agencia_viagem',
      percentual: 0.05,
      descricao: 'Lua de mel (estimativa)',
      condicao: (e) => e.luaDeMel === true || e.luaDeMel === 'sim' || e.luaDeMel === 'em_pesquisa',
    },
    {
      categoria: 'Transporte dos Noivos',
      subcategoria: 'transporte_noivos',
      percentual: 0.02,
      descricao: 'Transporte especial dos noivos (estimativa)',
      condicao: (e) => e.transporteEspecialNoivos === true || e.carroNoivos === 'sim' || e.carroNoivos === 'talvez',
    },
    {
      categoria: 'Transporte de Convidados',
      subcategoria: 'transporte_convidados',
      percentual: 0.02,
      descricao: 'Transporte de convidados (estimativa)',
      condicao: (e) => e.transporteConvidados === 'sim' || e.transporteConvidados === 'alguns',
    },
    {
      categoria: 'Segurança',
      subcategoria: 'seguranca',
      percentual: 0.01,
      descricao: 'Segurança e controle de acesso (estimativa)',
      condicao: (e) => e.seguranca === true || ['grande', 'mega'].includes(e.totalConvidados),
    },
    {
      categoria: 'Cerimonialista',
      subcategoria: 'cerimonialista',
      percentual: 0.04,
      descricao: 'Cerimonialista / assessoria (estimativa)',
      condicao: (e) => e.cerimonialistaContratado !== true && (['grande', 'mega'].includes(e.totalConvidados) || ['intimo', 'medio'].includes(e.totalConvidados)),
    },
    {
      categoria: 'Alianças',
      subcategoria: 'aliancas',
      percentual: 0.02,
      descricao: 'Alianças (estimativa)',
      condicao: (e) => e.aliancasEscolhidas === 'buscando' || e.aliancasEscolhidas === 'nao',
    },
    {
      categoria: 'Animação Infantil',
      subcategoria: 'animacao_infantil',
      percentual: 0.015,
      descricao: 'Animação infantil / espaço kids (estimativa)',
      condicao: (e) => e.criancas === true || e.criancas === 'sim' || e.criancas === 'alguns',
    },
    {
      categoria: 'Cabine de Fotos',
      subcategoria: 'cabine_fotos',
      percentual: 0.015,
      descricao: 'Cabine de fotos / totem (estimativa)',
      condicao: (e) => Array.isArray(e.atividadesEntretenimento) && e.atividadesEntretenimento.includes('cabine-fotos'),
    },
    {
      categoria: 'Drone',
      subcategoria: 'drone',
      percentual: 0.01,
      descricao: 'Filmagem com drone (estimativa)',
      condicao: (e) => Array.isArray(e.atividadesEntretenimento) && e.atividadesEntretenimento.includes('drone'),
    },
    {
      categoria: 'Fogos / Sparklers',
      subcategoria: 'fogos_sparklers',
      percentual: 0.01,
      descricao: 'Fogos de artifício e sparklers (estimativa)',
      condicao: (e) => e.fogosSparklers === true,
    },
    {
      categoria: 'Aula de Dança',
      subcategoria: 'aula_danca',
      percentual: 0.01,
      descricao: 'Aula de dança dos noivos (estimativa)',
      condicao: (e) => e.aulaDanca === true || e.aulasDanca === true,
    },
    {
      categoria: 'Lembrancinhas',
      subcategoria: 'lembrancinhas',
      percentual: 0.015,
      descricao: 'Lembrancinhas para convidados (estimativa)',
      condicao: (e) => e.lembrancinhas === 'sim',
    },
    {
      categoria: 'Kit de Saída',
      subcategoria: 'kit_saida',
      percentual: 0.005,
      descricao: 'Kit de saída dos noivos (estimativa)',
      condicao: (e) => e.kitSaida === 'sim',
    },
    {
      categoria: 'Iluminação Cênica',
      subcategoria: 'iluminacao_cenica',
      percentual: 0.02,
      descricao: 'Iluminação cênica e som (estimativa)',
      condicao: (e) => e.tipoLocal === 'praia' || e.tipoLocal === 'sitio' || e.tipoLocal === 'jardim' || e.tipoLocal === 'haras',
    },
    {
      categoria: 'Gerador',
      subcategoria: 'geradores',
      percentual: 0.01,
      descricao: 'Gerador de energia de apoio (estimativa)',
      condicao: (e) => e.geradorLocal === 'nao' && ['sitio', 'jardim', 'haras'].includes(e.tipoLocal),
    },
    {
      categoria: 'Fotos Lua de Mel',
      subcategoria: 'fotografia',
      percentual: 0.02,
      descricao: 'Fotógrafo para lua de mel (estimativa)',
      condicao: (e) => e.fotosLuaDeMel === true && e.fotografoLuaDeMel !== true,
    },
  ];
  
  /**
   * Gera linhas de financeiro sugeridas baseado no memorial
   * @param {Object} estado — memoriais.estado
   * @param {number} orcamentoTotal — orçamento do evento
   * @returns {Array} linhas para insert na tabela financeiro
   */
  export function gerarLinhasFinanceiro(estado, orcamentoTotal) {
    if (!estado || !orcamentoTotal || orcamentoTotal <= 0) return [];
  
    const linhas = [];
  
    for (const regra of REGRAS_FINANCEIRO) {
      try {
        if (regra.condicao(estado)) {
          const valor = Math.round(orcamentoTotal * regra.percentual);
          if (valor > 0) {
            linhas.push({
              categoria: regra.subcategoria,
              categoria_principal: getCategoriaPrincipal(regra.subcategoria),
              descricao: regra.descricao,
              valor_estimado: valor,
              valor_real: 0,
              pago: false,
              gerado_auto: true,
              sincronizado: false,
              fornecedor_excluido: false,
            });
          }
        }
      } catch (err) {
        console.warn('[gerador-financeiro] Regra falhou:', regra.categoria, err);
      }
    }
  
    // Deduplica por categoria (mantém a primeira, que geralmente tem maior percentual)
    const vistos = new Set();
    return linhas.filter((l) => {
      if (vistos.has(l.categoria)) return false;
      vistos.add(l.categoria);
      return true;
    });
  }
  
  export default { gerarLinhasFinanceiro };