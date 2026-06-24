// utils/gerador-tarefas.js
// Gera tarefas contextualizadas baseado no estado do memorial
// CORREÇÕES: regras E1-E19, D4-D14, E15-E19 adicionadas; campos inexistentes removidos

/**
 * Calcula data de prazo: dataEvento - diasAntes
 */
function calcularPrazo(dataEventoStr, diasAntes) {
  const data = new Date(dataEventoStr + 'T00:00:00');
  data.setDate(data.getDate() - diasAntes);
  return data.toISOString().split('T')[0];
}

/**
 * Regras de tarefas. Cada regra:
 * { condicao: (estado) => boolean, tarefa: { titulo, descricao, categoria, subcategoria?, prazo, prioridade } }
 */
const REGRAS = [
  // --- PERFIL: Crianças ---
  {
    condicao: (e) => e.criancas === true || e.criancas === 'sim' || e.criancas === 'alguns',
    tarefa: {
      titulo: 'Contratar animação infantil ou espaço kids',
      descricao: 'Com crianças na festa, reserve monitores ou um espaço kids para que os pais aproveitem.',
      categoria: 'musica_entretenimento',
      subcategoria: 'animacao_infantil',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.criancas === true || e.criancas === 'sim',
    tarefa: {
      titulo: 'Verificar menu infantil com o buffet',
      descricao: 'Solicite opções kid-friendly e verifique alergias alimentares comuns.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'buffet',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },

  // --- PERFIL: Padrinhos ---
  {
    condicao: (e) => e.padrinhosEscolhidos === true && Number(e.quantosPadrinhos || 0) > 0,
    tarefa: {
      titulo: 'Definir padronização de vestuário dos padrinhos',
      descricao: 'Escolha cor, tecido e estilo. Combine com as madrinhas para harmonia visual.',
      categoria: 'beleza_vestuario',
      subcategoria: 'traje_masculino',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },

  // --- PERFIL: Data prevista ---
  {
    condicao: (e) => !!e.dataPrevista && !e.dataCasamento,
    tarefa: {
      titulo: 'Definir data exata do casamento',
      descricao: 'Você indicou um mês/ano aproximado. Reserve a data exata para iniciar contratações.',
      categoria: 'Planejamento',
      prazo: 365,
      prioridade: 'obrigatoria',
    },
  },

  // --- CERIMÔNIA: Católica ---
  {
    condicao: (e) => e.tipoCerimonia === 'catolica' && e.reservouIgreja !== true,
    tarefa: {
      titulo: 'Reservar data na igreja e confirmar disponibilidade com o padre',
      descricao: 'Entre em contato com a paróquia de sua preferência e reserve a data. Algumas igrejas exigem reserva com 12 meses de antecedência.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'oficializante_religioso',
      prazo: 365,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.tipoCerimonia === 'catolica' && e.cursoNoivos !== 'sim',
    tarefa: {
      titulo: 'Agendar curso de noivos na paróquia',
      descricao: 'A maioria das dioceses exige curso de noivos com no mínimo 3 meses de antecedência. Verifique a programação da sua paróquia.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'oficializante_religioso',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.tipoCerimonia === 'catolica' && e.certidaoBatismo !== true,
    tarefa: {
      titulo: 'Atualizar certidão de batismo (validade 3 meses)',
      descricao: 'A certidão de batismo deve ter emissão recente. Solicite na paróquia de batismo.',
      categoria: 'Documentação',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },

  // --- CERIMÔNIA: Judaica ---
  {
    condicao: (e) => e.tipoCerimonia === 'judaica' && e.reservouTemplo !== true,
    tarefa: {
      titulo: 'Reservar data no templo e confirmar com o rabino',
      descricao: 'Casamentos judaicos geralmente ocorrem de domingo a quinta-feira. Confirme a disponibilidade do templo.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'oficializante_religioso',
      prazo: 365,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.tipoCerimonia === 'judaica' && e.definiuChupa !== true,
    tarefa: {
      titulo: 'Definir fornecedor e modelo da chupá',
      descricao: 'A chupá pode ser alugada ou comprada. Defina o estilo e reserve com antecedência.',
      categoria: 'decoracao_flores',
      subcategoria: 'decoracao',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.tipoCerimonia === 'judaica',
    tarefa: {
      titulo: 'Contratar fornecedor kosher para o buffet',
      descricao: 'Buffet judaico exige certificação kosher. Verifique fornecedores credenciados na sua região.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'buffet',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },

  // --- CERIMÔNIA: Simbólica ---
  {
    condicao: (e) => e.tipoCerimonia === 'simbolica' && e.escolheuCelebrante !== true,
    tarefa: {
      titulo: 'Escolher e contratar celebrante laico',
      descricao: 'Agende uma conversa para alinhar roteiro, votos e duração da cerimônia.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'celebrante',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },

  // --- CERIMÔNIA: Civil ---
  {
    condicao: (e) => e.tipoCerimonia === 'civil' && e.agendouCartorio !== true,
    tarefa: {
      titulo: 'Agendar data no cartório e verificar documentação necessária',
      descricao: 'Verifique se a certidão de nascimento está atualizada e se há exigências específicas do cartório.',
      categoria: 'Documentação',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },

  // --- CERIMÔNIA: Expansão ---
  {
    condicao: (e) => e.criancasCerimonia === true,
    tarefa: {
      titulo: 'Definir papel das crianças na cerimônia',
      descricao: 'Daminhas, pajens, porta-alianças? Defina idades, roupas e ensaios.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'cerimonialista',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.duracaoCerimonia === 'mais_1h',
    tarefa: {
      titulo: 'Planejar cerimônia longa com intervalos',
      descricao: 'Cerimônias acima de 1h precisam de intervalos, água para convidados e cadeiras confortáveis.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'cerimonialista',
      prazo: 90,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.musicaCerimoniaViva === 'sim',
    tarefa: {
      titulo: 'Contratar músicos ao vivo para a cerimônia',
      descricao: 'Quarteto de cordas, coral, violinista ou duo. Reserve com 6-9 meses de antecedência.',
      categoria: 'musica_entretenimento',
      subcategoria: 'musica_cerimonia',
      prazo: 270,
      prioridade: 'recomendada',
    },
  },

  // --- DOCUMENTAÇÃO: Estado Civil (E1-E6) ---
  {
    condicao: (e) => e.estadoCivilNoivo === 'divorciado' && e.certidaoDivorcioNoivo !== true,
    tarefa: {
      titulo: 'Solicitar certidão de divórcio do noivo com averbação',
      descricao: 'O cartório exige certidão atualizada do casamento anterior com a averbação do divórcio.',
      categoria: 'Documentação',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.estadoCivilNoiva === 'divorciado' && e.certidaoDivorcioNoiva !== true,
    tarefa: {
      titulo: 'Solicitar certidão de divórcio da noiva com averbação',
      descricao: 'O cartório exige certidão atualizada do casamento anterior com a averbação do divórcio.',
      categoria: 'Documentação',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.estadoCivilNoivo === 'viuvo' && e.certidaoObitoNoivo !== true,
    tarefa: {
      titulo: 'Solicitar certidão de óbito do cônjuge anterior do noivo',
      descricao: 'Documento obrigatório para casamento civil e religioso.',
      categoria: 'Documentação',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.estadoCivilNoiva === 'viuvo' && e.certidaoObitoNoiva !== true,
    tarefa: {
      titulo: 'Solicitar certidão de óbito do cônjuge anterior da noiva',
      descricao: 'Documento obrigatório para casamento civil e religioso.',
      categoria: 'Documentação',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => (e.nacionalidadeNoivo !== 'brasileiro' || e.nacionalidadeNoiva !== 'brasileiro') && e.documentacaoEstrangeiro !== true,
    tarefa: {
      titulo: 'Verificar documentação para casamento de estrangeiro no Brasil',
      descricao: 'Consulte o cartório sobre tradução juramentada, apostila de Haia e vistos.',
      categoria: 'Documentação',
      prazo: 365,
      prioridade: 'obrigatoria',
    },
  },

  // --- DOCUMENTAÇÃO: Financeiro e Cronograma (E10-E14) ---
  {
    condicao: (e) => e.quemPaga && !e.formaPagamento,
    tarefa: {
      titulo: 'Definir forma de pagamento dos fornecedores',
      descricao: 'Estabeleça sinal, parcelas e data de quitação para cada fornecedor.',
      categoria: 'Documentação',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.cronogramaDia !== true,
    tarefa: {
      titulo: 'Montar cronograma detalhado do dia do casamento',
      descricao: 'Inclua making of, cerimônia, coquetel, jantar, festa e saída. Compartilhe com fornecedores.',
      categoria: 'Documentação',
      prazo: 60,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => !e.horarioMakingOfNoiva,
    tarefa: {
      titulo: 'Definir horário do making of da noiva',
      descricao: 'Alinhe com equipe de beleza, fotógrafo e cerimonialista.',
      categoria: 'Documentação',
      prazo: 30,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => !e.horarioMakingOfNoivo,
    tarefa: {
      titulo: 'Definir horário do making of do noivo',
      descricao: 'Alinhe com barbearia, fotógrafo e cerimonialista.',
      categoria: 'Documentação',
      prazo: 30,
      prioridade: 'obrigatoria',
    },
  },

  // --- LOCAL: Praia ---
  {
    condicao: (e) => e.tipoLocal === 'praia' && e.planoChuva !== 'cobertura',
    tarefa: {
      titulo: 'Contratar tenda ou cobertura de emergência (plano B praia)',
      descricao: 'Praia é imprevisível. Reserve tenda ou espaço coberto próximo como plano B.',
      categoria: 'local_infraestrutura',
      subcategoria: 'mobiliario_locacao',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.tipoLocal === 'praia' && e.verificouMare !== true,
    tarefa: {
      titulo: 'Verificar previsão de maré e vento para a data',
      descricao: 'Consulte tabuas de maré e histórico de vento para evitar surpresas.',
      categoria: 'Outros',
      prazo: 90,
      prioridade: 'recomendada',
    },
  },

  // --- LOCAL: Expansão ---
  {
    condicao: (e) => e.estacionamento === 'valet',
    tarefa: {
      titulo: 'Contratar serviço de valet parking',
      descricao: 'Verifique quantidade de manobristas e seguro para veículos dos convidados.',
      categoria: 'transporte',
      subcategoria: 'transporte_convidados',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.cozinhaApoio === false && ['sitio', 'jardim', 'haras', 'praia'].includes(e.tipoLocal),
    tarefa: {
      titulo: 'Verificar cozinha de apoio ou contratar estrutura móvel',
      descricao: 'Locais externos podem não ter cozinha adequada. O buffet precisa de área de preparo.',
      categoria: 'local_infraestrutura',
      subcategoria: 'cozinha_apoio',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => Number(e.capacidadeLocal || 0) > 0 && Number(e.capacidadeLocal) < Number(e.totalConvidados || 0),
    tarefa: {
      titulo: 'ATENÇÃO: capacidade do local menor que número de convidados',
      descricao: 'O local comporta ' + (e.capacidadeLocal || 0) + ' pessoas, mas você planeja ' + (e.totalConvidados || 0) + ' convidados. Reduza lista ou mude de local.',
      categoria: 'local_infraestrutura',
      subcategoria: 'espaco_recepcao',
      prazo: 30,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.geradorLocal === 'nao' && ['sitio', 'jardim', 'haras'].includes(e.tipoLocal),
    tarefa: {
      titulo: 'Contratar gerador de energia de apoio',
      descricao: 'Locais rurais podem ter quedas de energia. Um gerador evita apagões durante a festa.',
      categoria: 'local_infraestrutura',
      subcategoria: 'geradores',
      prazo: 90,
      prioridade: 'recomendada',
    },
  },

  // --- CONVIDADOS ---
  {
    condicao: (e) => ['grande', 'mega'].includes(e.totalConvidados) && e.seguranca !== true,
    tarefa: {
      titulo: 'Contratar segurança e controle de acesso',
      descricao: 'Eventos com mais de 100 convidados exigem segurança para portaria e estacionamento.',
      categoria: 'local_infraestrutura',
      subcategoria: 'seguranca',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => ['grande', 'mega'].includes(e.totalConvidados) && e.transporteConvidados !== true && e.transporteConvidados !== 'sim',
    tarefa: {
      titulo: 'Organizar transporte para convidados (van/ônibus)',
      descricao: 'Considere transfer do hotel ao local e volta, especialmente se houver bebida alcoólica.',
      categoria: 'transporte',
      subcategoria: 'transporte_convidados',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => Number(e.convidadosForaCidade) > 0 && e.hotelIndicacao !== true,
    tarefa: {
      titulo: 'Reservar bloco de quartos ou indicar hotéis parceiros',
      descricao: 'Negocie tarifa de grupo com hotéis próximos ao local.',
      categoria: 'Outros',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.listaPreliminar !== true,
    tarefa: {
      titulo: 'Criar lista preliminar de convidados',
      descricao: 'Comece com uma lista ampla e depois refine por prioridade e orçamento.',
      categoria: 'Convidados',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },

  // --- FORNECEDORES: Fotografia / Filmagem ---
  {
    condicao: (e) => e.fotografoContratado !== true,
    tarefa: {
      titulo: 'Contratar fotógrafo',
      descricao: 'Fotógrafos de casamento são reservados com 9-12 meses de antecedência.',
      categoria: 'foto_video',
      subcategoria: 'fotografia',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.filmagemContratada !== true,
    tarefa: {
      titulo: 'Contratar filmagem',
      descricao: 'Escolha entre estilos: documental, cinematográfico, highlight.',
      categoria: 'foto_video',
      subcategoria: 'filmagem',
      prazo: 270,
      prioridade: 'recomendada',
    },
  },

  // --- FORNECEDORES: Espaço / Buffet / Decoração / Música ---
  {
    condicao: (e) => e.espacoContratado !== true,
    tarefa: {
      titulo: 'Reservar e contratar espaço do evento',
      descricao: 'Verifique contrato, capacidade, estacionamento e cláusula de chuva.',
      categoria: 'local_infraestrutura',
      subcategoria: 'espaco_recepcao',
      prazo: 365,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.buffetContratado !== true,
    tarefa: {
      titulo: 'Contratar buffet e realizar degustação',
      descricao: 'Agende degustação com 2-3 opções antes de fechar.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'buffet',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.decoracaoContratada !== true,
    tarefa: {
      titulo: 'Contratar decoração e florista',
      descricao: 'Alinhe paleta de cores, estilo e orçamento. Peça projeto 3D.',
      categoria: 'decoracao_flores',
      subcategoria: 'decoracao',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.musicaContratada !== true,
    tarefa: {
      titulo: 'Contratar DJ ou banda',
      descricao: 'Defina repertório, equipamentos e horários de montagem.',
      categoria: 'musica_entretenimento',
      subcategoria: 'musica_festa',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },

  // --- FORNECEDORES: Vestuário ---
  {
    condicao: (e) => e.vestidoComprado !== true && e.estiloVestido !== 'jumpsuit',
    tarefa: {
      titulo: 'Escolher e encomendar vestido de noiva',
      descricao: 'Prazo de confecção pode levar 6-9 meses. Inicie as provas com antecedência.',
      categoria: 'beleza_vestuario',
      subcategoria: 'vestido_atelier',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.vestidoComprado !== true && e.estiloVestido === 'jumpsuit',
    tarefa: {
      titulo: 'Provar e encomendar macacão/jumpsuit de noiva',
      descricao: 'Macacões podem ser sob medida ou pronta-entrega. Verifique prazo.',
      categoria: 'beleza_vestuario',
      subcategoria: 'vestido_atelier',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.trajeNoivoContratado !== true,
    tarefa: {
      titulo: 'Escolher traje do noivo',
      descricao: 'Defina se será compra, aluguel ou sob medida. Prazo médio: 3-4 meses.',
      categoria: 'beleza_vestuario',
      subcategoria: 'traje_masculino',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },

  // --- FORNECEDORES: Beleza ---
  {
    condicao: (e) => e.testeBeleza !== true,
    tarefa: {
      titulo: 'Agendar teste de beleza (make + hair)',
      descricao: 'Teste de penteado e maquiagem deve ser feito 1-2 meses antes.',
      categoria: 'beleza_vestuario',
      subcategoria: 'beleza_noiva',
      prazo: 60,
      prioridade: 'obrigatoria',
    },
  },

  // --- CERIMONIALISTA ---
  {
    condicao: (e) => e.cerimonialistaContratado !== true && ['grande', 'mega'].includes(e.totalConvidados),
    tarefa: {
      titulo: 'Contratar cerimonialista/assessoria',
      descricao: 'Eventos grandes exigem coordenação profissional. Contrate com 6-9 meses de antecedência.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'cerimonialista',
      prazo: 270,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.cerimonialistaContratado !== true && ['intimo', 'medio'].includes(e.totalConvidados),
    tarefa: {
      titulo: 'Contratar cerimonialista ou definir coordenador do dia',
      descricao: 'Mesmo casamentos menores precisam de alguém para coordenar o cronograma.',
      categoria: 'cerimonia_assessoria',
      subcategoria: 'cerimonialista',
      prazo: 180,
      prioridade: 'opcional',
    },
  },

  // --- ALIMENTAÇÃO E BEBIDAS: Expansão ---
  {
    condicao: (e) => e.mesaFrios === true,
    tarefa: {
      titulo: 'Contratar mesa de frios para coquetel',
      descricao: 'Defina variedade, quantidade por convidado e apresentação.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'bolo_doces',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.bebidasPorPessoa === 'controlado',
    tarefa: {
      titulo: 'Definir controle de bebidas por pessoa',
      descricao: 'Estime consumo por convidado, defina marcações nos copos e controle de garçons.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'bebidas',
      prazo: 60,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.menuInfantil === true,
    tarefa: {
      titulo: 'Confirmar menu infantil com o buffet',
      descricao: 'Verifique opções saudáveis, sem alergenos e apresentação atrativa.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'buffet',
      prazo: 90,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.tipoBar === 'open bar completo',
    tarefa: {
      titulo: 'Contratar bartender para open bar',
      descricao: 'Bartender profissional eleva a experiência do bar e evita desperdício.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'bartender',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },

  // --- ENTRETENIMENTO: Expansão ---
  {
    condicao: (e) => e.fogosSparklers === true,
    tarefa: {
      titulo: 'Contratar fogos de artifício ou sparklers',
      descricao: 'Verifique permissão do local, seguro e horário permitido.',
      categoria: 'musica_entretenimento',
      subcategoria: 'fogos_sparklers',
      prazo: 120,
      prioridade: 'opcional',
    },
  },
  {
    condicao: (e) => e.mesaDocesExposta === true,
    tarefa: {
      titulo: 'Contratar mesa de doces exposta (display)',
      descricao: 'Doces finos, macarons, brigadeiros gourmet em apresentação visual impactante.',
      categoria: 'alimentacao_bebidas',
      subcategoria: 'bolo_doces',
      prazo: 120,
      prioridade: 'opcional',
    },
  },
  {
    condicao: (e) => e.aulaDanca === true,
    tarefa: {
      titulo: 'Contratar aula de dança para os noivos',
      descricao: 'Inicie 3-6 meses antes. Escolha estilo (valsa, salsa, coreografia surpresa).',
      categoria: 'musica_entretenimento',
      subcategoria: 'aula_danca',
      prazo: 180,
      prioridade: 'opcional',
    },
  },

  // --- ENTRETENIMENTO ---
  {
    condicao: (e) => Array.isArray(e.atividadesEntretenimento) && e.atividadesEntretenimento.includes('cabine-fotos') && e.cabineFotos !== true,
    tarefa: {
      titulo: 'Contratar cabine de fotos',
      descricao: 'Escolha entre cabine fechada, totem ou espelho mágico.',
      categoria: 'musica_entretenimento',
      subcategoria: 'cabine_fotos',
      prazo: 120,
      prioridade: 'opcional',
    },
  },
  {
    condicao: (e) => Array.isArray(e.atividadesEntretenimento) && e.atividadesEntretenimento.includes('drone'),
    tarefa: {
      titulo: 'Contratar serviço de drone',
      descricao: 'Verifique se o local permite voo de drone e contrate piloto licenciado.',
      categoria: 'foto_video',
      subcategoria: 'drone',
      prazo: 120,
      prioridade: 'opcional',
    },
  },
  {
    condicao: (e) => Array.isArray(e.atividadesEntretenimento) && e.atividadesEntretenimento.includes('animacao-infantil') && e.animacaoInfantil !== true,
    tarefa: {
      titulo: 'Contratar animação infantil / espaço kids',
      descricao: 'Monitores e recreação garantem que pais aproveitem a festa.',
      categoria: 'musica_entretenimento',
      subcategoria: 'animacao_infantil',
      prazo: 120,
      prioridade: 'opcional',
    },
  },

  // --- PAPELARIA ---
  {
    condicao: (e) => e.formatoConvite === 'fisico' && e.convitesEncomendados !== true,
    tarefa: {
      titulo: 'Encomendar convites físicos',
      descricao: 'Prazo de confecção: 30-60 dias. Envie com 2-3 meses de antecedência.',
      categoria: 'papelaria_detalhes',
      subcategoria: 'papelaria',
      prazo: 120,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.formatoConvite === 'digital' && e.convitesEncomendados !== true,
    tarefa: {
      titulo: 'Criar e enviar convite digital',
      descricao: 'Site do casal, vídeo ou design digital. Envie com 2 meses de antecedência.',
      categoria: 'papelaria_detalhes',
      subcategoria: 'papelaria',
      prazo: 90,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.saveTheDate === 'sim' && e.saveTheDateEnviado !== true,
    tarefa: {
      titulo: 'Enviar save the date',
      descricao: 'Envie 8-10 meses antes para reservar a data na agenda dos convidados.',
      categoria: 'Convidados',
      prazo: 270,
      prioridade: 'recomendada',
    },
  },

  // --- PAPELARIA: Lembrancinhas e Kit de Saída ---
  {
    condicao: (e) => e.lembrancinhas === 'sim',
    tarefa: {
      titulo: 'Escolher e encomendar lembrancinhas',
      descricao: 'Defina quantidade, personalização e prazo de entrega.',
      categoria: 'papelaria_detalhes',
      subcategoria: 'lembrancinhas',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.kitSaida === 'sim',
    tarefa: {
      titulo: 'Montar kit de saída para os noivos',
      descricao: 'Inclua trocas de roupa, tênis confortável, água, lanche e carregador.',
      categoria: 'papelaria_detalhes',
      subcategoria: 'kit_saida',
      prazo: 30,
      prioridade: 'recomendada',
    },
  },

  // --- VESTUÁRIO: Expansão ---
  {
    condicao: (e) => e.aulasDanca === true,
    tarefa: {
      titulo: 'Contratar aulas de dança (noivos + padrinhos)',
      descricao: 'Aulas em grupo são divertidas e criam momento especial na festa.',
      categoria: 'musica_entretenimento',
      subcategoria: 'aula_danca',
      prazo: 180,
      prioridade: 'opcional',
    },
  },
  {
    condicao: (e) => e.mudancaLook === true,
    tarefa: {
      titulo: 'Planejar mudança de look para a festa',
      descricao: 'Segundo vestido, troca de acessórios ou penteado. Reserve tempo no cronograma.',
      categoria: 'beleza_vestuario',
      subcategoria: 'beleza_noiva',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => Number(e.quantasMadrinhas || 0) > 0 && e.padronizarMadrinhas !== 'nao',
    tarefa: {
      titulo: 'Definir vestido/cor das madrinhas',
      descricao: 'Escolha cor que combine com a paleta. Envie referências com 6 meses de antecedência.',
      categoria: 'beleza_vestuario',
      subcategoria: 'beleza_madrinhas',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },

  // --- LOGÍSTICA: Expansão ---
  {
    condicao: (e) => e.aliancasEscolhidas === 'buscando',
    tarefa: {
      titulo: 'Escolher e encomendar alianças',
      descricao: 'Prazo de confecção: 30-60 dias. Grave as iniciais com antecedência.',
      categoria: 'papelaria_detalhes',
      subcategoria: 'aliancas',
      prazo: 120,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.aliancasEscolhidas === 'nao',
    tarefa: {
      titulo: 'Decidir sobre alianças',
      descricao: 'Alianças são símbolo central. Defina se usarão, qual material e onde comprar.',
      categoria: 'papelaria_detalhes',
      subcategoria: 'aliancas',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.civilJunto === 'sim' && e.agendouCartorio !== true,
    tarefa: {
      titulo: 'Agendar casamento civil junto com a cerimônia',
      descricao: 'Verifique se o celebrante tem poderes de oficializar ou se precisa de juiz de paz.',
      categoria: 'Documentação',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.transporteEspecialNoivos === true && e.transporteNoivosContratado !== true,
    tarefa: {
      titulo: 'Contratar transporte especial dos noivos',
      descricao: 'Carro clássico, limousine, helicóptero? Reserve com 3-6 meses de antecedência.',
      categoria: 'transporte',
      subcategoria: 'transporte_noivos',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.carroNoivos === 'sim' || e.carroNoivos === 'talvez',
    tarefa: {
      titulo: 'Reservar carro dos noivos',
      descricao: 'Verifique decoração, horários de chegada/saída e rota.',
      categoria: 'transporte',
      subcategoria: 'transporte_noivos',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.transporteConvidados === 'sim' || e.transporteConvidados === 'alguns',
    tarefa: {
      titulo: 'Organizar transporte de convidados',
      descricao: 'Van, ônibus ou transfer. Defina pontos de embarque e horários.',
      categoria: 'transporte',
      subcategoria: 'transporte_convidados',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => e.seguranca === true || ['grande', 'mega'].includes(e.totalConvidados),
    tarefa: {
      titulo: 'Contratar segurança do evento',
      descricao: 'Portaria, controle de acesso e vigilância. Essencial para eventos grandes.',
      categoria: 'local_infraestrutura',
      subcategoria: 'seguranca',
      prazo: 120,
      prioridade: 'recomendada',
    },
  },

  // --- LUA DE MEL (E15-E19 + M1-M2) ---
  {
    condicao: (e) => (e.luaDeMel === true || e.luaDeMel === 'sim' || e.luaDeMel === 'em_pesquisa') && e.luaDeMelReservada !== true,
    tarefa: {
      titulo: 'Reservar lua de mel',
      descricao: 'Pacotes de lua de mel devem ser reservados com 3-6 meses de antecedência.',
      categoria: 'Outros',
      prazo: 180,
      prioridade: 'recomendada',
    },
  },
  {
    condicao: (e) => (e.luaDeMel === true || e.luaDeMel === 'sim') && e.destinoLuaDeMel && !e.destinoLuaDeMel.toLowerCase().includes('brasil') && e.destinoLuaDeMel.toLowerCase() !== 'nacional',
    tarefa: {
      titulo: 'Verificar necessidade de visto para o destino da lua de mel',
      descricao: 'Consulte o consulado do país de destino com antecedência.',
      categoria: 'Documentação',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => (e.luaDeMel === true || e.luaDeMel === 'sim') && e.passaporteValido !== true,
    tarefa: {
      titulo: 'Verificar validade do passaporte (mínimo 6 meses)',
      descricao: 'Alguns países exigem passaporte válido por pelo menos 6 meses após a data de entrada.',
      categoria: 'Documentação',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => (e.luaDeMel === true || e.luaDeMel === 'sim') && e.visto !== true && e.destinoLuaDeMel && !e.destinoLuaDeMel.toLowerCase().includes('brasil') && e.destinoLuaDeMel.toLowerCase() !== 'nacional',
    tarefa: {
      titulo: 'Solicitar visto para o destino da lua de mel',
      descricao: 'Verifique prazo de processamento e documentação necessária.',
      categoria: 'Documentação',
      prazo: 270,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => (e.luaDeMel === true || e.luaDeMel === 'sim') && e.vacinas !== true && e.destinoLuaDeMel && !e.destinoLuaDeMel.toLowerCase().includes('brasil') && e.destinoLuaDeMel.toLowerCase() !== 'nacional',
    tarefa: {
      titulo: 'Verificar vacinas obrigatórias para o destino da lua de mel',
      descricao: 'Consulte o posto de saúde ou centro de vacinação internacional.',
      categoria: 'Documentação',
      prazo: 180,
      prioridade: 'obrigatoria',
    },
  },
  {
    condicao: (e) => e.fotosLuaDeMel === true && e.fotografoLuaDeMel !== true,
    tarefa: {
      titulo: 'Contratar fotógrafo para lua de mel',
      descricao: 'Ensaio pós-casamento no destino. Reserve fotógrafo local ou leve o seu.',
      categoria: 'foto_video',
      subcategoria: 'fotografia',
      prazo: 120,
      prioridade: 'opcional',
    },
  },
];

/**
 * Gera tarefas contextualizadas a partir do estado do memorial
 * @param {Object} estado - memoriais.estado
 * @param {string} dataEvento - ISO date string (YYYY-MM-DD)
 * @returns {Array} lista de tarefas prontas para insert
 */
export function gerarTarefasContextualizadas(estado, dataEvento) {
  if (!estado || !dataEvento) return [];

  const tarefas = [];

  for (const regra of REGRAS) {
    try {
      if (regra.condicao(estado)) {
        const t = regra.tarefa;
        tarefas.push({
          titulo: t.titulo,
          descricao: t.descricao,
          categoria: t.subcategoria || t.categoria,        // compatibilidade legada
          categoria_principal: t.categoria,               // catálogo centralizado
          prazo: calcularPrazo(dataEvento, t.prazo),
          prioridade: t.prioridade,
          concluida: false,
          gerada_auto: true,
        });
      }
    } catch (err) {
      console.warn('[gerador-tarefas] Regra falhou:', err);
    }
  }

  // Deduplica por título (evita tarefas duplicadas se regras conflitarem)
  const vistos = new Set();
  return tarefas.filter((t) => {
    if (vistos.has(t.titulo)) return false;
    vistos.add(t.titulo);
    return true;
  });
}

export default { gerarTarefasContextualizadas };