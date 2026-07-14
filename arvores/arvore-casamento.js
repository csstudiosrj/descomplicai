// arvores/arvore-casamento.js
// Árvore de questionário para Casamento (~140 nós após remoção dos steps duplicados do perfil).
// Cada nó: { id, titulo, bloco, componente, next, condicional? }
// condicional: (estado) => idPróximo | null (pula) | undefined (usa next)

const ARVORE_CASAMENTO = [
  // === BLOCO A: Perfil do Casal ===
  // step01, step02, step03, step04, step05, step06 removidos: dados coletados no perfil.
  { id: 'step00', titulo: 'Perfil do casal', bloco: 'A', componente: 'Step00Casal', next: 'stepA4' },

  // Expansão A (detalhes adicionais, não duplicados no perfil)
  {
    id: 'stepA4', titulo: 'Crianças na festa', bloco: 'A', componente: 'StepA4Criancas',
    next: 'stepA5',
    condicional: (estado) => {
      if (estado.criancas === false) return 'stepA5'; // pula se já sabe que não tem
      return undefined;
    }
  },
  {
    id: 'stepA5', titulo: 'Padrinhos', bloco: 'A', componente: 'StepA5Padrinhos',
    next: 'stepA6',
    condicional: (estado) => {
      if (estado.padrinhosEscolhidos === false) return 'stepA6';
      return undefined;
    }
  },
  {
    id: 'stepA6', titulo: 'Data prevista', bloco: 'A', componente: 'StepA6DataPrevista',
    next: 'stepA7',
    condicional: (estado) => {
      if (estado.dataCasamento) return 'stepA7'; // já tem data, pula
      return undefined;
    }
  },
  { id: 'stepA7', titulo: 'Tempo juntos', bloco: 'A', componente: 'StepA7TempoJuntos', next: 'stepA8' },
  { id: 'stepA8', titulo: 'Moram juntos', bloco: 'A', componente: 'StepA8MoramJuntos', next: 'stepA9' },
  { id: 'stepA9', titulo: 'Como se conheceram', bloco: 'A', componente: 'StepA9ComoSeConheceram', next: 'stepA10' },
  { id: 'stepA10', titulo: 'Tem filhos', bloco: 'A', componente: 'StepA10TemFilhos', next: 'stepA11' },
  { id: 'stepA11', titulo: 'Tem animais', bloco: 'A', componente: 'StepA11TemAnimais', next: 'stepA12' },
  { id: 'stepA12', titulo: 'Gostam de fazer juntos', bloco: 'A', componente: 'StepA12GostamDeFazer', next: 'stepA13' },
  { id: 'stepA13', titulo: 'Personalidade do noivo', bloco: 'A', componente: 'StepA13PersonalidadeNoivo', next: 'stepA14' },
  { id: 'stepA14', titulo: 'Personalidade da noiva', bloco: 'A', componente: 'StepA14PersonalidadeNoiva', next: 'stepA15' },
  { id: 'stepA15', titulo: 'Tradição familiar', bloco: 'A', componente: 'StepA15TradicaoFamiliar', next: 'stepA16' },
  { id: 'stepA16', titulo: 'Restrição cultural', bloco: 'A', componente: 'StepA16RestricaoCultural', next: 'step07' },

  // === BLOCO B: Cerimônia ===
  {
    id: 'step07', titulo: 'Tipo de cerimônia', bloco: 'B', componente: 'Step07Cerimonia',
    next: 'step08',
    condicional: (estado) => {
      if (estado.tipoCerimonia === 'catolica') return 'step07a';
      if (estado.tipoCerimonia === 'evangelica') return 'step07b';
      if (estado.tipoCerimonia === 'judaica') return 'step07c';
      if (estado.tipoCerimonia === 'simbolica') return 'step07d';
      return undefined;
    }
  },
  { id: 'step07a', titulo: 'Detalhes católicos', bloco: 'B', componente: 'Step07aCatolica', next: 'step09' },
  { id: 'step07b', titulo: 'Detalhes evangélicos', bloco: 'B', componente: 'Step07bEvangelica', next: 'step09' },
  { id: 'step07c', titulo: 'Detalhes judaicos', bloco: 'B', componente: 'Step07cJudaica', next: 'step09' },
  { id: 'step07d', titulo: 'Detalhes simbólicos', bloco: 'B', componente: 'Step07dSimbolica', next: 'step09' },
  { id: 'step09', titulo: 'Mesmo local para cerimônia e festa', bloco: 'B', componente: 'Step09MesmoLocal', next: 'stepB5' },

  // Expansão B
  {
    id: 'stepB5', titulo: 'Crianças na cerimônia', bloco: 'B', componente: 'StepB5CriancasCerimonia',
    next: 'stepB6',
    condicional: (estado) => {
      if (estado.criancas === false) return 'stepB6';
      return undefined;
    }
  },
  {
    id: 'stepB6', titulo: 'Duração da cerimônia', bloco: 'B', componente: 'StepB6DuracaoCerimonia',
    next: 'stepB7',
    condicional: (estado) => {
      if (estado.tipoCerimonia === 'civil') return 'stepB8';
      return undefined;
    }
  },
  {
    id: 'stepB7', titulo: 'Música ao vivo na cerimônia', bloco: 'B', componente: 'StepB7MusicaCerimoniaViva',
    next: 'stepB8',
    condicional: (estado) => {
      if (estado.tipoCerimonia === 'civil') return 'stepB8';
      return undefined;
    }
  },
  { id: 'stepB8', titulo: 'Reservou igreja/templo', bloco: 'B', componente: 'StepB8ReservouIgreja', next: 'stepB9' },
  {
    id: 'stepB9', titulo: 'Curso de noivos', bloco: 'B', componente: 'StepB9CursoNoivos',
    next: 'stepB10',
    condicional: (estado) => {
      if (estado.tipoCerimonia !== 'catolica') return 'stepB11';
      return undefined;
    }
  },
  {
    id: 'stepB10', titulo: 'Padre/paróquia escolhido', bloco: 'B', componente: 'StepB10EscolheuPadre',
    next: 'stepB11',
    condicional: (estado) => {
      if (estado.tipoCerimonia !== 'catolica') return 'stepB11';
      return undefined;
    }
  },
  {
    id: 'stepB11', titulo: 'Reservou templo', bloco: 'B', componente: 'StepB11ReservouTemplo',
    next: 'stepB12',
    condicional: (estado) => {
      if (estado.tipoCerimonia !== 'judaica') return 'stepB13';
      return undefined;
    }
  },
  {
    id: 'stepB12', titulo: 'Chupá definido', bloco: 'B', componente: 'StepB12DefiniuChupa',
    next: 'stepB13',
    condicional: (estado) => {
      if (estado.tipoCerimonia !== 'judaica') return 'stepB13';
      return undefined;
    }
  },
  {
    id: 'stepB13', titulo: 'Celebrante laico escolhido', bloco: 'B', componente: 'StepB13EscolheuCelebrante',
    next: 'stepB14',
    condicional: (estado) => {
      if (estado.tipoCerimonia !== 'simbolica') return 'stepB14';
      return undefined;
    }
  },
  {
    id: 'stepB14', titulo: 'Agendou cartório', bloco: 'B', componente: 'StepB14AgendouCartorio',
    next: 'stepB15',
    condicional: (estado) => {
      if (estado.tipoCerimonia !== 'civil') return 'stepB15';
      return undefined;
    }
  },
  { id: 'stepB15', titulo: 'Padrinhos escolhidos', bloco: 'B', componente: 'StepB15PadrinhosEscolhidos', next: 'stepB16' },
  { id: 'stepB16', titulo: 'Entrada definida', bloco: 'B', componente: 'StepB16DefiniramEntrada', next: 'stepB17' },
  { id: 'stepB17', titulo: 'Músicos da cerimônia', bloco: 'B', componente: 'StepB17MusicosCerimonia', next: 'stepB18' },
  {
    id: 'stepB18', titulo: 'Certidão de batismo', bloco: 'B', componente: 'StepB18CertidaoBatismo',
    next: 'step08',
    condicional: (estado) => {
      if (estado.tipoCerimonia !== 'catolica') return 'step08';
      return undefined;
    }
  },

  // === BLOCO C: Local e Estrutura ===
  { id: 'step08', titulo: 'Tipo de local', bloco: 'C', componente: 'Step08Local', next: 'step10' },
  { id: 'step10', titulo: 'Horário do casamento', bloco: 'C', componente: 'Step10Horario', next: 'step11' },
  { id: 'step11', titulo: 'Plano B chuva', bloco: 'C', componente: 'Step11PlanoChuva', next: 'step11b' },
  { id: 'step11b', titulo: 'Transporte dos noivos', bloco: 'C', componente: 'Step11bTransporte', next: 'stepC4' },

  // Expansão C
  {
    id: 'stepC4', titulo: 'Estacionamento', bloco: 'C', componente: 'StepC4Estacionamento',
    next: 'stepC5',
    condicional: (estado) => {
      if (['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) return 'stepC6';
      return undefined;
    }
  },
  {
    id: 'stepC5', titulo: 'Cozinha de apoio', bloco: 'C', componente: 'StepC5CozinhaApoio',
    next: 'stepC6',
    condicional: (estado) => {
      if (['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) return 'stepC6';
      return undefined;
    }
  },
  { id: 'stepC6', titulo: 'Capacidade do local', bloco: 'C', componente: 'StepC6CapacidadeLocal', next: 'stepC7' },
  {
    id: 'stepC7', titulo: 'Gerador no local', bloco: 'C', componente: 'StepC7GeradorLocal',
    next: 'stepC8',
    condicional: (estado) => {
      if (['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) return 'stepC8';
      return undefined;
    }
  },
  { id: 'stepC8', titulo: 'Reservou local da cerimônia', bloco: 'C', componente: 'StepC8ReservouLocalCerimonia', next: 'stepC9' },
  { id: 'stepC9', titulo: 'Reservou local da festa', bloco: 'C', componente: 'StepC9ReservouLocalFesta', next: 'stepC10' },
  {
    id: 'stepC10', titulo: 'Verificou maré e vento', bloco: 'C', componente: 'StepC10VerificouMare',
    next: 'stepC11',
    condicional: (estado) => {
      if (estado.tipoLocal !== 'praia') return 'stepC11';
      return undefined;
    }
  },
  { id: 'stepC11', titulo: 'Lista preliminar de convidados', bloco: 'C', componente: 'StepC11ListaPreliminar', next: 'stepC12' },
  { id: 'stepC12', titulo: 'Convidados de fora', bloco: 'C', componente: 'StepC12ConvidadosForaCidade', next: 'stepC13' },
  {
    id: 'stepC13', titulo: 'Indicação de hotel', bloco: 'C', componente: 'StepC13HotelIndicacao',
    next: 'stepC14',
    condicional: (estado) => {
      if ((estado.convidadosForaCidade || 0) === 0) return 'stepC14';
      return undefined;
    }
  },
  { id: 'stepC14', titulo: 'Horário da festa', bloco: 'C', componente: 'StepC14HorarioFesta', next: 'stepC15' },
  {
    id: 'stepC15', titulo: 'Duração do coquetel', bloco: 'C', componente: 'StepC15DuracaoCoquetel',
    next: 'step12',
    condicional: (estado) => {
      if (estado.coquetel !== true) return 'step12';
      return undefined;
    }
  },

  // === BLOCO D: Identidade Visual e Fornecedores ===
  { id: 'step12', titulo: 'Estilo do casamento', bloco: 'D', componente: 'Step12Estilo', next: 'step13' },
  { id: 'step13', titulo: 'Formalidade', bloco: 'D', componente: 'Step13Formalidade', next: 'step14' },
  { id: 'step14', titulo: 'Paleta de cores', bloco: 'D', componente: 'Step14Paleta', next: 'step15' },
  {
    id: 'step15', titulo: 'Tom do evento', bloco: 'D', componente: 'Step15Tom',
    next: 'stepD1',
    condicional: (estado) => {
      if (estado.modoPlanejamento === 'ativo') return 'step16';
      return undefined;
    }
  },
  { id: 'step16', titulo: 'Referências visuais', bloco: 'D', componente: 'Step16Referencias', next: 'stepD1' },

  // Expansão D
  {
    id: 'stepD1', titulo: 'Tipo de flores', bloco: 'D', componente: 'StepD1TipoFlores',
    next: 'stepD2',
    condicional: (estado) => {
      if (estado.flores !== true) return 'stepD2';
      return undefined;
    }
  },
  {
    id: 'stepD2', titulo: 'Tipo de iluminação', bloco: 'D', componente: 'StepD2TipoIluminacao',
    next: 'stepD3',
    condicional: (estado) => {
      if (!estado.tipoIluminacao) return 'stepD3';
      return undefined;
    }
  },
  {
    id: 'stepD3', titulo: 'Mobiliário especial', bloco: 'D', componente: 'StepD3MobiliarioQual',
    next: 'stepD4',
    condicional: (estado) => {
      if (!estado.mobiliarioQual) return 'stepD4';
      return undefined;
    }
  },
  { id: 'stepD4', titulo: 'Fotógrafo contratado', bloco: 'D', componente: 'StepD4FotografoContratado', next: 'stepD5' },
  { id: 'stepD5', titulo: 'Filmagem contratada', bloco: 'D', componente: 'StepD5FilmagemContratada', next: 'stepD6' },
  { id: 'stepD6', titulo: 'Buffet contratado', bloco: 'D', componente: 'StepD6BuffetContratado', next: 'stepD7' },
  { id: 'stepD7', titulo: 'Decoração contratada', bloco: 'D', componente: 'StepD7DecoracaoContratada', next: 'stepD8' },
  { id: 'stepD8', titulo: 'Música contratada', bloco: 'D', componente: 'StepD8MusicaContratada', next: 'stepD9' },
  { id: 'stepD9', titulo: 'Espaço contratado', bloco: 'D', componente: 'StepD9EspacoContratado', next: 'stepD10' },
  { id: 'stepD10', titulo: 'Vestido contratado', bloco: 'D', componente: 'StepD10VestidoContratado', next: 'stepD11' },
  { id: 'stepD11', titulo: 'Traje do noivo contratado', bloco: 'D', componente: 'StepD11TrajeNoivoContratado', next: 'stepD12' },
  { id: 'stepD12', titulo: 'Cerimonialista contratado', bloco: 'D', componente: 'StepD12CerimonialistaContratado', next: 'stepD13' },
  { id: 'stepD13', titulo: 'Transporte contratado', bloco: 'D', componente: 'StepD13TransporteContratado', next: 'stepD14' },
  { id: 'stepD14', titulo: 'Papelaria contratada', bloco: 'D', componente: 'StepD14PapelariaContratada', next: 'stepD15' },
  { id: 'stepD15', titulo: 'Cabine de fotos', bloco: 'D', componente: 'StepD15CabineFotos', next: 'stepD16' },
  { id: 'stepD16', titulo: 'Drone', bloco: 'D', componente: 'StepD16Drone', next: 'stepD17' },
  { id: 'stepD17', titulo: 'Animação infantil', bloco: 'D', componente: 'StepD17AnimacaoInfantil', next: 'stepD18' },
  { id: 'stepD18', titulo: 'Vestido comprado', bloco: 'D', componente: 'StepD18VestidoComprado', next: 'stepD19' },
  { id: 'stepD19', titulo: 'Teste de beleza', bloco: 'D', componente: 'StepD19TesteBeleza', next: 'stepD20' },
  { id: 'stepD20', titulo: 'Convites encomendados', bloco: 'D', componente: 'StepD20ConvitesEncomendados', next: 'stepD21' },
  { id: 'stepD21', titulo: 'Save the date', bloco: 'D', componente: 'StepD21SaveTheDate', next: 'stepD22' },
  { id: 'stepD22', titulo: 'Lembrancinhas', bloco: 'D', componente: 'StepD22Lembrancinhas', next: 'stepD23' },
  { id: 'stepD23', titulo: 'Kit de saída', bloco: 'D', componente: 'StepD23KitSaida', next: 'step17' },

  // === BLOCO E: Decoração (desmembrado) ===
  { id: 'step17', titulo: 'Flores', bloco: 'E', componente: 'Step17Flores', next: 'step18' },
  { id: 'step18', titulo: 'Iluminação', bloco: 'E', componente: 'Step18Iluminacao', next: 'step19' },
  { id: 'step19', titulo: 'Velas', bloco: 'E', componente: 'Step19Velas', next: 'step20' },
  { id: 'step20', titulo: 'Mobiliário especial', bloco: 'E', componente: 'Step20Mobiliario', next: 'step21' },
  { id: 'step21', titulo: 'Backdrop', bloco: 'E', componente: 'Step21Backdrop', next: 'step22' },
  { id: 'step22', titulo: 'Tecidos', bloco: 'E', componente: 'Step22Tecidos', next: 'step23' },

  // === BLOCO F: Mesa Posta ===
  { id: 'step23', titulo: 'Toalha de mesa', bloco: 'F', componente: 'Step23Toalha', next: 'step24' },
  { id: 'step24', titulo: 'Louças', bloco: 'F', componente: 'Step24Loucas', next: 'step25' },
  { id: 'step25', titulo: 'Talheres', bloco: 'F', componente: 'Step25Talheres', next: 'step26' },
  { id: 'step26', titulo: 'Taças', bloco: 'F', componente: 'Step26Tacas', next: 'step27' },
  { id: 'step27', titulo: 'Centro de mesa', bloco: 'F', componente: 'Step27CentroMesa', next: 'step28' },
  { id: 'step28', titulo: 'Guardanapo', bloco: 'F', componente: 'Step28Guardanapo', next: 'step29' },
  { id: 'step29', titulo: 'Cartão de lugar', bloco: 'F', componente: 'Step29CartaoLugar', next: 'step30' },

  // === BLOCO G: Cerimônia Detalhada ===
  { id: 'step30', titulo: 'Entrada dos noivos', bloco: 'G', componente: 'Step30Entrada', next: 'step31' },
  { id: 'step31', titulo: 'Música da cerimônia', bloco: 'G', componente: 'Step31MusicaCerimonia', next: 'step32' },
  { id: 'step32', titulo: 'Padrinhos e crianças', bloco: 'G', componente: 'Step32PadrinhosCriancas', next: 'step33' },
  { id: 'step33', titulo: 'Rituais e saída', bloco: 'G', componente: 'Step33RituaisSaida', next: 'step38' },

  // === BLOCO H: Recepção ===
  {
    id: 'step38', titulo: 'Coquetel e jantar', bloco: 'H', componente: 'Step38Coquetel',
    next: 'step39',
    condicional: (estado) => {
      if (estado.coquetel === true) return 'stepG8';
      return undefined;
    }
  },
  { id: 'stepG8', titulo: 'Mesa de frios', bloco: 'H', componente: 'StepG8MesaFrios', next: 'step39' },
  { id: 'step39', titulo: 'Bolo, doces e bar', bloco: 'H', componente: 'Step39BoloDocesBar', next: 'stepG9' },
  {
    id: 'stepG9', titulo: 'Bebidas por pessoa', bloco: 'H', componente: 'StepG9BebidasPorPessoa',
    next: 'stepG10',
    condicional: (estado) => {
      if (!estado.tipoBar) return 'stepG10';
      return undefined;
    }
  },
  {
    id: 'stepG10', titulo: 'Menu infantil', bloco: 'H', componente: 'StepG10MenuInfantil',
    next: 'step40',
    condicional: (estado) => {
      if (estado.criancas === false || estado.criancas === 'nao') return 'step40';
      return undefined;
    }
  },
  { id: 'step40', titulo: 'Música e entretenimento', bloco: 'H', componente: 'Step40MusicaEntretenimento', next: 'stepH3' },
  {
    id: 'stepH3', titulo: 'Fogos e sparklers', bloco: 'H', componente: 'StepH3FogosSparklers',
    next: 'stepH4',
    condicional: (estado) => {
      if (estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('fogos')) return 'stepH4';
      return undefined;
    }
  },
  {
    id: 'stepH4', titulo: 'Mesa de doces exposta', bloco: 'H', componente: 'StepH4MesaDocesExposta',
    next: 'stepH5',
    condicional: (estado) => {
      if (estado.mesaDocesExposta !== true) return 'stepH5';
      return undefined;
    }
  },
  {
    id: 'stepH5', titulo: 'Aula de dança', bloco: 'H', componente: 'StepH5AulaDanca',
    next: 'step49',
    condicional: (estado) => {
      if (estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) return 'step49';
      return undefined;
    }
  },

  // === BLOCO I: Papelaria e Identidade ===
  { id: 'step49', titulo: 'Convites', bloco: 'I', componente: 'Step49Convites', next: 'step50' },
  { id: 'step50', titulo: 'Identidade visual', bloco: 'I', componente: 'Step50IdentidadeVisual', next: 'step54' },

  // === BLOCO J: Vestuário e Beleza ===
  { id: 'step54', titulo: 'Vestido e acessórios', bloco: 'J', componente: 'Step54Vestido', next: 'step55' },
  { id: 'step55', titulo: 'Beleza e padronização', bloco: 'J', componente: 'Step55BelezaPadronizacao', next: 'stepI4' },
  {
    id: 'stepI4', titulo: 'Aulas de dança', bloco: 'J', componente: 'StepI4AulasDanca',
    next: 'stepI5',
    condicional: (estado) => {
      if (estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) return 'stepI5';
      return undefined;
    }
  },
  {
    id: 'stepI5', titulo: 'Mudança de look', bloco: 'J', componente: 'StepI5MudancaLook',
    next: 'stepI6',
    condicional: (estado) => {
      if (estado.mudancaLook !== true) return 'stepI6';
      return undefined;
    }
  },
  {
    id: 'stepI6', titulo: 'Quantas madrinhas', bloco: 'J', componente: 'StepI6QuantasMadrinhas',
    next: 'step60',
    condicional: (estado) => {
      if (estado.padrinhosEscolhidos !== true) return 'step60';
      return undefined;
    }
  },

  // === BLOCO K: Fornecedores ===
  { id: 'step60', titulo: 'Fornecedores', bloco: 'K', componente: 'Step60Fornecedores', next: 'stepL1' },

  // === BLOCO L: Logística e Documentação ===
  { id: 'stepL1', titulo: 'Alianças', bloco: 'L', componente: 'StepL1Aliancas', next: 'stepL2' },
  { id: 'stepL2', titulo: 'Casamento civil', bloco: 'L', componente: 'StepL2CivilJunto', next: 'stepL3' },
  {
    id: 'stepL3', titulo: 'Transporte especial dos noivos', bloco: 'L', componente: 'StepL3TransporteEspecialNoivos',
    next: 'stepL4',
    condicional: (estado) => {
      if (estado.transporteEspecialNoivos !== true) return 'stepL4';
      return undefined;
    }
  },
  {
    id: 'stepL4', titulo: 'Carro dos noivos', bloco: 'L', componente: 'StepL4CarroNoivos',
    next: 'stepL5',
    condicional: (estado) => {
      if (estado.carroNoivos === 'nao') return 'stepL5';
      return undefined;
    }
  },
  {
    id: 'stepL5', titulo: 'Transporte de convidados', bloco: 'L', componente: 'StepL5TransporteConvidados',
    next: 'stepL6',
    condicional: (estado) => {
      if (estado.transporteConvidados === 'nao') return 'stepL6';
      return undefined;
    }
  },
  {
    id: 'stepL6', titulo: 'Segurança', bloco: 'L', componente: 'StepL6Seguranca',
    next: 'stepM1',
    condicional: (estado) => {
      if (!['grande', 'mega'].includes(estado.totalConvidados) && estado.seguranca !== true) return 'stepM1';
      return undefined;
    }
  },

  // === BLOCO M: Pós-casamento ===
  {
    id: 'stepM1', titulo: 'Lua de mel', bloco: 'M', componente: 'StepM1LuaDeMel',
    next: 'stepM2',
    condicional: (estado) => {
      if (estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return 'stepE1';
      return undefined;
    }
  },
  { id: 'stepM2', titulo: 'Fotos na lua de mel', bloco: 'M', componente: 'StepM2FotosLuaDeMel', next: 'stepE1' },

  // === BLOCO N: Documentação e Financeiro ===
  { id: 'stepE1', titulo: 'Estado civil do noivo', bloco: 'N', componente: 'StepE1EstadoCivilNoivo', next: 'stepE2' },
  { id: 'stepE2', titulo: 'Estado civil da noiva', bloco: 'N', componente: 'StepE2EstadoCivilNoiva', next: 'stepE3' },
  {
    id: 'stepE3', titulo: 'Certidão de divórcio do noivo', bloco: 'N', componente: 'StepE3CertidaoDivorcioNoivo',
    next: 'stepE4',
    condicional: (estado) => {
      if (estado.estadoCivilNoivo !== 'divorciado') return 'stepE4';
      return undefined;
    }
  },
  {
    id: 'stepE4', titulo: 'Certidão de divórcio da noiva', bloco: 'N', componente: 'StepE4CertidaoDivorcioNoiva',
    next: 'stepE5',
    condicional: (estado) => {
      if (estado.estadoCivilNoiva !== 'divorciado') return 'stepE5';
      return undefined;
    }
  },
  {
    id: 'stepE5', titulo: 'Certidão de óbito do noivo', bloco: 'N', componente: 'StepE5CertidaoObitoNoivo',
    next: 'stepE6',
    condicional: (estado) => {
      if (estado.estadoCivilNoivo !== 'viuvo') return 'stepE6';
      return undefined;
    }
  },
  {
    id: 'stepE6', titulo: 'Certidão de óbito da noiva', bloco: 'N', componente: 'StepE6CertidaoObitoNoiva',
    next: 'stepE7',
    condicional: (estado) => {
      if (estado.estadoCivilNoiva !== 'viuvo') return 'stepE7';
      return undefined;
    }
  },
  { id: 'stepE7', titulo: 'Nacionalidade do noivo', bloco: 'N', componente: 'StepE7NacionalidadeNoivo', next: 'stepE8' },
  { id: 'stepE8', titulo: 'Nacionalidade da noiva', bloco: 'N', componente: 'StepE8NacionalidadeNoiva', next: 'stepE9' },
  {
    id: 'stepE9', titulo: 'Documentação estrangeiro', bloco: 'N', componente: 'StepE9DocumentacaoEstrangeiro',
    next: 'stepE10',
    condicional: (estado) => {
      if (estado.nacionalidadeNoivo === 'brasileiro' && estado.nacionalidadeNoiva === 'brasileiro') return 'stepE10';
      return undefined;
    }
  },
  { id: 'stepE10', titulo: 'Quem paga o casamento', bloco: 'N', componente: 'StepE10QuemPaga', next: 'stepE11' },
  { id: 'stepE11', titulo: 'Forma de pagamento', bloco: 'N', componente: 'StepE11FormaPagamento', next: 'stepE12' },
  { id: 'stepE12', titulo: 'Cronograma do dia', bloco: 'N', componente: 'StepE12CronogramaDia', next: 'stepE13' },
  { id: 'stepE13', titulo: 'Horário making of noiva', bloco: 'N', componente: 'StepE13HorarioMakingOfNoiva', next: 'stepE14' },
  { id: 'stepE14', titulo: 'Horário making of noivo', bloco: 'N', componente: 'StepE14HorarioMakingOfNoivo', next: 'stepE15' },
  {
    id: 'stepE15', titulo: 'Destino lua de mel', bloco: 'N', componente: 'StepE15DestinoLuaDeMel',
    next: 'stepE16',
    condicional: (estado) => {
      if (estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return 'stepE19';
      return undefined;
    }
  },
  {
    id: 'stepE16', titulo: 'Lua de mel reservada', bloco: 'N', componente: 'StepE16LuaDeMelReservada',
    next: 'stepE17',
    condicional: (estado) => {
      if (estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return 'stepE19';
      return undefined;
    }
  },
  {
    id: 'stepE17', titulo: 'Passaporte válido', bloco: 'N', componente: 'StepE17PassaporteValido',
    next: 'stepE18',
    condicional: (estado) => {
      if (estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return 'stepE19';
      return undefined;
    }
  },
  {
    id: 'stepE18', titulo: 'Visto', bloco: 'N', componente: 'StepE18Visto',
    next: 'stepE19',
    condicional: (estado) => {
      if (estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return 'stepE19';
      return undefined;
    }
  },
  { id: 'stepE19', titulo: 'Vacinas', bloco: 'N', componente: 'StepE19Vacinas', next: null }
];

export default ARVORE_CASAMENTO;