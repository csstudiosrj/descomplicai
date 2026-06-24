// utils/algoritmo.js
// Algoritmo de navegação do memorial — fluxo completo com expansão (~145 etapas)
// CORREÇÕES: bloco N para Documentação, campos padronizados, condicionais ajustadas

const ETAPAS = [
  // === BLOCO A: Perfil do Casal ===
  { id: 'step00', bloco: 'A', componente: 'Step00Casal', titulo: 'Perfil do casal' },
  { id: 'step01', bloco: 'A', componente: 'Step01Modo', titulo: 'Modo de planejamento' },
  { id: 'step02', bloco: 'A', componente: 'Step02NomeCasal', titulo: 'Nomes do casal' },
  { id: 'step03', bloco: 'A', componente: 'Step03Data', titulo: 'Data do casamento' },
  { id: 'step04', bloco: 'A', componente: 'Step04Cidade', titulo: 'Cidade' },
  { id: 'step05', bloco: 'A', componente: 'Step05Convidados', titulo: 'Número de convidados' },
  { id: 'step06', bloco: 'A', componente: 'Step06Orcamento', titulo: 'Orçamento estimado' },
  // Expansão A (A4-A16)
  { id: 'stepA4', bloco: 'A', componente: 'StepA4Criancas', titulo: 'Crianças na festa' },
  { id: 'stepA5', bloco: 'A', componente: 'StepA5Padrinhos', titulo: 'Padrinhos' },
  { id: 'stepA6', bloco: 'A', componente: 'StepA6DataPrevista', titulo: 'Data prevista' },
  { id: 'stepA7', bloco: 'A', componente: 'StepA7TempoJuntos', titulo: 'Tempo juntos' },
  { id: 'stepA8', bloco: 'A', componente: 'StepA8MoramJuntos', titulo: 'Moram juntos' },
  { id: 'stepA9', bloco: 'A', componente: 'StepA9ComoSeConheceram', titulo: 'Como se conheceram' },
  { id: 'stepA10', bloco: 'A', componente: 'StepA10TemFilhos', titulo: 'Tem filhos' },
  { id: 'stepA11', bloco: 'A', componente: 'StepA11TemAnimais', titulo: 'Tem animais' },
  { id: 'stepA12', bloco: 'A', componente: 'StepA12GostamDeFazer', titulo: 'Gostam de fazer juntos' },
  { id: 'stepA13', bloco: 'A', componente: 'StepA13PersonalidadeNoivo', titulo: 'Personalidade do noivo' },
  { id: 'stepA14', bloco: 'A', componente: 'StepA14PersonalidadeNoiva', titulo: 'Personalidade da noiva' },
  { id: 'stepA15', bloco: 'A', componente: 'StepA15TradicaoFamiliar', titulo: 'Tradição familiar' },
  { id: 'stepA16', bloco: 'A', componente: 'StepA16RestricaoCultural', titulo: 'Restrição cultural' },

  // === BLOCO B: Cerimônia ===
  { id: 'step07', bloco: 'B', componente: 'Step07Cerimonia', titulo: 'Tipo de cerimônia' },
  // Ramificações B
  { id: 'step07a', bloco: 'B', componente: 'Step07aCatolica', titulo: 'Detalhes católicos' },
  { id: 'step07b', bloco: 'B', componente: 'Step07bEvangelica', titulo: 'Detalhes evangélicos' },
  { id: 'step07c', bloco: 'B', componente: 'Step07cJudaica', titulo: 'Detalhes judaicos' },
  { id: 'step07d', bloco: 'B', componente: 'Step07dSimbolica', titulo: 'Detalhes simbólicos' },
  { id: 'step09', bloco: 'B', componente: 'Step09MesmoLocal', titulo: 'Mesmo local para cerimônia e festa' },
  // Expansão B (B5-B18)
  { id: 'stepB5', bloco: 'B', componente: 'StepB5CriancasCerimonia', titulo: 'Crianças na cerimônia' },
  { id: 'stepB6', bloco: 'B', componente: 'StepB6DuracaoCerimonia', titulo: 'Duração da cerimônia' },
  { id: 'stepB7', bloco: 'B', componente: 'StepB7MusicaCerimoniaViva', titulo: 'Música ao vivo na cerimônia' },
  { id: 'stepB8', bloco: 'B', componente: 'StepB8ReservouIgreja', titulo: 'Reservou igreja/templo' },
  { id: 'stepB9', bloco: 'B', componente: 'StepB9CursoNoivos', titulo: 'Curso de noivos' },
  { id: 'stepB10', bloco: 'B', componente: 'StepB10EscolheuPadre', titulo: 'Padre/paróquia escolhido' },
  { id: 'stepB11', bloco: 'B', componente: 'StepB11ReservouTemplo', titulo: 'Reservou templo' },
  { id: 'stepB12', bloco: 'B', componente: 'StepB12DefiniuChupa', titulo: 'Chupá definido' },
  { id: 'stepB13', bloco: 'B', componente: 'StepB13EscolheuCelebrante', titulo: 'Celebrante laico escolhido' },
  { id: 'stepB14', bloco: 'B', componente: 'StepB14AgendouCartorio', titulo: 'Agendou cartório' },
  { id: 'stepB15', bloco: 'B', componente: 'StepB15PadrinhosEscolhidos', titulo: 'Padrinhos escolhidos' },
  { id: 'stepB16', bloco: 'B', componente: 'StepB16DefiniramEntrada', titulo: 'Entrada definida' },
  { id: 'stepB17', bloco: 'B', componente: 'StepB17MusicosCerimonia', titulo: 'Músicos da cerimônia' },
  { id: 'stepB18', bloco: 'B', componente: 'StepB18CertidaoBatismo', titulo: 'Certidão de batismo' },

  // === BLOCO C: Local e Estrutura ===
  { id: 'step08', bloco: 'C', componente: 'Step08Local', titulo: 'Tipo de local' },
  { id: 'step10', bloco: 'C', componente: 'Step10Horario', titulo: 'Horário do casamento' },
  { id: 'step11', bloco: 'C', componente: 'Step11PlanoChuva', titulo: 'Plano B chuva' },
  { id: 'step11b', bloco: 'C', componente: 'Step11bTransporte', titulo: 'Transporte dos noivos' },
  // Expansão C (C4-C15)
  { id: 'stepC4', bloco: 'C', componente: 'StepC4Estacionamento', titulo: 'Estacionamento' },
  { id: 'stepC5', bloco: 'C', componente: 'StepC5CozinhaApoio', titulo: 'Cozinha de apoio' },
  { id: 'stepC6', bloco: 'C', componente: 'StepC6CapacidadeLocal', titulo: 'Capacidade do local' },
  { id: 'stepC7', bloco: 'C', componente: 'StepC7GeradorLocal', titulo: 'Gerador no local' },
  { id: 'stepC8', bloco: 'C', componente: 'StepC8ReservouLocalCerimonia', titulo: 'Reservou local da cerimônia' },
  { id: 'stepC9', bloco: 'C', componente: 'StepC9ReservouLocalFesta', titulo: 'Reservou local da festa' },
  { id: 'stepC10', bloco: 'C', componente: 'StepC10VerificouMare', titulo: 'Verificou maré e vento' },
  { id: 'stepC11', bloco: 'C', componente: 'StepC11ListaPreliminar', titulo: 'Lista preliminar de convidados' },
  { id: 'stepC12', bloco: 'C', componente: 'StepC12ConvidadosForaCidade', titulo: 'Convidados de fora' },
  { id: 'stepC13', bloco: 'C', componente: 'StepC13HotelIndicacao', titulo: 'Indicação de hotel' },
  { id: 'stepC14', bloco: 'C', componente: 'StepC14HorarioFesta', titulo: 'Horário da festa' },
  { id: 'stepC15', bloco: 'C', componente: 'StepC15DuracaoCoquetel', titulo: 'Duração do coquetel' },

  // === BLOCO D: Identidade Visual e Fornecedores ===
  { id: 'step12', bloco: 'D', componente: 'Step12Estilo', titulo: 'Estilo do casamento' },
  { id: 'step13', bloco: 'D', componente: 'Step13Formalidade', titulo: 'Formalidade' },
  { id: 'step14', bloco: 'D', componente: 'Step14Paleta', titulo: 'Paleta de cores' },
  { id: 'step15', bloco: 'D', componente: 'Step15Tom', titulo: 'Tom do evento' },
  { id: 'step16', bloco: 'D', componente: 'Step16Referencias', titulo: 'Referências visuais' },
  // Expansão D (D1-D23)
  { id: 'stepD1', bloco: 'D', componente: 'StepD1TipoFlores', titulo: 'Tipo de flores' },
  { id: 'stepD2', bloco: 'D', componente: 'StepD2TipoIluminacao', titulo: 'Tipo de iluminação' },
  { id: 'stepD3', bloco: 'D', componente: 'StepD3MobiliarioQual', titulo: 'Mobiliário especial' },
  { id: 'stepD4', bloco: 'D', componente: 'StepD4FotografoContratado', titulo: 'Fotógrafo contratado' },
  { id: 'stepD5', bloco: 'D', componente: 'StepD5FilmagemContratada', titulo: 'Filmagem contratada' },
  { id: 'stepD6', bloco: 'D', componente: 'StepD6BuffetContratado', titulo: 'Buffet contratado' },
  { id: 'stepD7', bloco: 'D', componente: 'StepD7DecoracaoContratada', titulo: 'Decoração contratada' },
  { id: 'stepD8', bloco: 'D', componente: 'StepD8MusicaContratada', titulo: 'Música contratada' },
  { id: 'stepD9', bloco: 'D', componente: 'StepD9EspacoContratado', titulo: 'Espaço contratado' },
  { id: 'stepD10', bloco: 'D', componente: 'StepD10VestidoContratado', titulo: 'Vestido contratado' },
  { id: 'stepD11', bloco: 'D', componente: 'StepD11TrajeNoivoContratado', titulo: 'Traje do noivo contratado' },
  { id: 'stepD12', bloco: 'D', componente: 'StepD12CerimonialistaContratado', titulo: 'Cerimonialista contratado' },
  { id: 'stepD13', bloco: 'D', componente: 'StepD13TransporteContratado', titulo: 'Transporte contratado' },
  { id: 'stepD14', bloco: 'D', componente: 'StepD14PapelariaContratada', titulo: 'Papelaria contratada' },
  { id: 'stepD15', bloco: 'D', componente: 'StepD15CabineFotos', titulo: 'Cabine de fotos' },
  { id: 'stepD16', bloco: 'D', componente: 'StepD16Drone', titulo: 'Drone' },
  { id: 'stepD17', bloco: 'D', componente: 'StepD17AnimacaoInfantil', titulo: 'Animação infantil' },
  { id: 'stepD18', bloco: 'D', componente: 'StepD18VestidoComprado', titulo: 'Vestido comprado' },
  { id: 'stepD19', bloco: 'D', componente: 'StepD19TesteBeleza', titulo: 'Teste de beleza' },
  { id: 'stepD20', bloco: 'D', componente: 'StepD20ConvitesEncomendados', titulo: 'Convites encomendados' },
  { id: 'stepD21', bloco: 'D', componente: 'StepD21SaveTheDate', titulo: 'Save the date' },
  { id: 'stepD22', bloco: 'D', componente: 'StepD22Lembrancinhas', titulo: 'Lembrancinhas' },
  { id: 'stepD23', bloco: 'D', componente: 'StepD23KitSaida', titulo: 'Kit de saída' },

  // === BLOCO E: Decoração (desmembrado) ===
  { id: 'step17', bloco: 'E', componente: 'Step17Flores', titulo: 'Flores' },
  { id: 'step18', bloco: 'E', componente: 'Step18Iluminacao', titulo: 'Iluminação' },
  { id: 'step19', bloco: 'E', componente: 'Step19Velas', titulo: 'Velas' },
  { id: 'step20', bloco: 'E', componente: 'Step20Mobiliario', titulo: 'Mobiliário especial' },
  { id: 'step21', bloco: 'E', componente: 'Step21Backdrop', titulo: 'Backdrop' },
  { id: 'step22', bloco: 'E', componente: 'Step22Tecidos', titulo: 'Tecidos' },

  // === BLOCO F: Mesa Posta (desmembrado) ===
  { id: 'step23', bloco: 'F', componente: 'Step23Toalha', titulo: 'Toalha de mesa' },
  { id: 'step24', bloco: 'F', componente: 'Step24Loucas', titulo: 'Louças' },
  { id: 'step25', bloco: 'F', componente: 'Step25Talheres', titulo: 'Talheres' },
  { id: 'step26', bloco: 'F', componente: 'Step26Tacas', titulo: 'Taças' },
  { id: 'step27', bloco: 'F', componente: 'Step27CentroMesa', titulo: 'Centro de mesa' },
  { id: 'step28', bloco: 'F', componente: 'Step28Guardanapo', titulo: 'Guardanapo' },
  { id: 'step29', bloco: 'F', componente: 'Step29CartaoLugar', titulo: 'Cartão de lugar' },

  // === BLOCO G: Cerimônia Detalhada (desmembrado) ===
  { id: 'step30', bloco: 'G', componente: 'Step30Entrada', titulo: 'Entrada dos noivos' },
  { id: 'step31', bloco: 'G', componente: 'Step31MusicaCerimonia', titulo: 'Música da cerimônia' },
  { id: 'step32', bloco: 'G', componente: 'Step32PadrinhosCriancas', titulo: 'Padrinhos e crianças' },
  { id: 'step33', bloco: 'G', componente: 'Step33RituaisSaida', titulo: 'Rituais e saída' },

  // === BLOCO H: Recepção (desmembrado) ===
  { id: 'step38', bloco: 'H', componente: 'Step38Coquetel', titulo: 'Coquetel e jantar' },
  { id: 'step39', bloco: 'H', componente: 'Step39BoloDocesBar', titulo: 'Bolo, doces e bar' },
  { id: 'step40', bloco: 'H', componente: 'Step40MusicaEntretenimento', titulo: 'Música e entretenimento' },
  // Expansão G/H
  { id: 'stepG8', bloco: 'H', componente: 'StepG8MesaFrios', titulo: 'Mesa de frios' },
  { id: 'stepG9', bloco: 'H', componente: 'StepG9BebidasPorPessoa', titulo: 'Bebidas por pessoa' },
  { id: 'stepG10', bloco: 'H', componente: 'StepG10MenuInfantil', titulo: 'Menu infantil' },
  { id: 'stepH3', bloco: 'H', componente: 'StepH3FogosSparklers', titulo: 'Fogos e sparklers' },
  { id: 'stepH4', bloco: 'H', componente: 'StepH4MesaDocesExposta', titulo: 'Mesa de doces exposta' },
  { id: 'stepH5', bloco: 'H', componente: 'StepH5AulaDanca', titulo: 'Aula de dança' },

  // === BLOCO I: Papelaria e Identidade (desmembrado) ===
  { id: 'step49', bloco: 'I', componente: 'Step49Convites', titulo: 'Convites' },
  { id: 'step50', bloco: 'I', componente: 'Step50IdentidadeVisual', titulo: 'Identidade visual' },

  // === BLOCO J: Vestuário e Beleza (desmembrado) ===
  { id: 'step54', bloco: 'J', componente: 'Step54Vestido', titulo: 'Vestido e acessórios' },
  { id: 'step55', bloco: 'J', componente: 'Step55BelezaPadronizacao', titulo: 'Beleza e padronização' },
  // Expansão I
  { id: 'stepI4', bloco: 'J', componente: 'StepI4AulasDanca', titulo: 'Aulas de dança' },
  { id: 'stepI5', bloco: 'J', componente: 'StepI5MudancaLook', titulo: 'Mudança de look' },
  { id: 'stepI6', bloco: 'J', componente: 'StepI6QuantasMadrinhas', titulo: 'Quantas madrinhas' },

  // === BLOCO K: Fornecedores ===
  { id: 'step60', bloco: 'K', componente: 'Step60Fornecedores', titulo: 'Fornecedores' },

  // === BLOCO L: Logística e Documentação ===
  { id: 'stepL1', bloco: 'L', componente: 'StepL1Aliancas', titulo: 'Alianças' },
  { id: 'stepL2', bloco: 'L', componente: 'StepL2CivilJunto', titulo: 'Casamento civil' },
  { id: 'stepL3', bloco: 'L', componente: 'StepL3TransporteEspecialNoivos', titulo: 'Transporte especial dos noivos' },
  { id: 'stepL4', bloco: 'L', componente: 'StepL4CarroNoivos', titulo: 'Carro dos noivos' },
  { id: 'stepL5', bloco: 'L', componente: 'StepL5TransporteConvidados', titulo: 'Transporte de convidados' },
  { id: 'stepL6', bloco: 'L', componente: 'StepL6Seguranca', titulo: 'Segurança' },

  // === BLOCO M: Pós-casamento ===
  { id: 'stepM1', bloco: 'M', componente: 'StepM1LuaDeMel', titulo: 'Lua de mel' },
  { id: 'stepM2', bloco: 'M', componente: 'StepM2FotosLuaDeMel', titulo: 'Fotos na lua de mel' },

  // === BLOCO N: Documentação e Financeiro (E1-E19) ===
  { id: 'stepE1', bloco: 'N', componente: 'StepE1EstadoCivilNoivo', titulo: 'Estado civil do noivo' },
  { id: 'stepE2', bloco: 'N', componente: 'StepE2EstadoCivilNoiva', titulo: 'Estado civil da noiva' },
  { id: 'stepE3', bloco: 'N', componente: 'StepE3CertidaoDivorcioNoivo', titulo: 'Certidão de divórcio do noivo' },
  { id: 'stepE4', bloco: 'N', componente: 'StepE4CertidaoDivorcioNoiva', titulo: 'Certidão de divórcio da noiva' },
  { id: 'stepE5', bloco: 'N', componente: 'StepE5CertidaoObitoNoivo', titulo: 'Certidão de óbito do noivo' },
  { id: 'stepE6', bloco: 'N', componente: 'StepE6CertidaoObitoNoiva', titulo: 'Certidão de óbito da noiva' },
  { id: 'stepE7', bloco: 'N', componente: 'StepE7NacionalidadeNoivo', titulo: 'Nacionalidade do noivo' },
  { id: 'stepE8', bloco: 'N', componente: 'StepE8NacionalidadeNoiva', titulo: 'Nacionalidade da noiva' },
  { id: 'stepE9', bloco: 'N', componente: 'StepE9DocumentacaoEstrangeiro', titulo: 'Documentação estrangeiro' },
  { id: 'stepE10', bloco: 'N', componente: 'StepE10QuemPaga', titulo: 'Quem paga o casamento' },
  { id: 'stepE11', bloco: 'N', componente: 'StepE11FormaPagamento', titulo: 'Forma de pagamento' },
  { id: 'stepE12', bloco: 'N', componente: 'StepE12CronogramaDia', titulo: 'Cronograma do dia' },
  { id: 'stepE13', bloco: 'N', componente: 'StepE13HorarioMakingOfNoiva', titulo: 'Horário making of noiva' },
  { id: 'stepE14', bloco: 'N', componente: 'StepE14HorarioMakingOfNoivo', titulo: 'Horário making of noivo' },
  { id: 'stepE15', bloco: 'N', componente: 'StepE15DestinoLuaDeMel', titulo: 'Destino lua de mel' },
  { id: 'stepE16', bloco: 'N', componente: 'StepE16LuaDeMelReservada', titulo: 'Lua de mel reservada' },
  { id: 'stepE17', bloco: 'N', componente: 'StepE17PassaporteValido', titulo: 'Passaporte válido' },
  { id: 'stepE18', bloco: 'N', componente: 'StepE18Visto', titulo: 'Visto' },
  { id: 'stepE19', bloco: 'N', componente: 'StepE19Vacinas', titulo: 'Vacinas' },
];

const INDICE_POR_ID = {};
ETAPAS.forEach((etapa, idx) => {
  INDICE_POR_ID[etapa.id] = idx;
});

export function getEtapaPorIndice(indice) {
  if (indice < 0 || indice >= ETAPAS.length) return null;
  return ETAPAS[indice];
}

export function calcularProximaEtapa(estado, indiceAtual) {
  const proximo = indiceAtual + 1;
  if (proximo >= ETAPAS.length) return ETAPAS.length;

  const etapa = ETAPAS[proximo];

  // === RAMIFICAÇÕES CONDICIONAIS ===

  // Step07 ramificações
  if (etapa.id === 'step07a' && estado.tipoCerimonia !== 'catolica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'step07b' && estado.tipoCerimonia !== 'evangelica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'step07c' && estado.tipoCerimonia !== 'judaica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'step07d' && estado.tipoCerimonia !== 'simbolica') return calcularProximaEtapa(estado, proximo);

  // Expansão A
  if (etapa.id === 'stepA4' && estado.criancas === false) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepA5' && estado.padrinhosEscolhidos === false) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepA6' && !!estado.dataCasamento) return calcularProximaEtapa(estado, proximo);

  // Expansão B
  if (etapa.id === 'stepB5' && estado.criancas === false) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB6' && estado.tipoCerimonia === 'civil') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB7' && estado.tipoCerimonia === 'civil') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB9' && estado.tipoCerimonia !== 'catolica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB10' && estado.tipoCerimonia !== 'catolica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB11' && estado.tipoCerimonia !== 'judaica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB12' && estado.tipoCerimonia !== 'judaica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB13' && estado.tipoCerimonia !== 'simbolica') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB14' && estado.tipoCerimonia !== 'civil') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepB18' && estado.tipoCerimonia !== 'catolica') return calcularProximaEtapa(estado, proximo);

  // Expansão C
  if (etapa.id === 'stepC4' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepC5' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepC7' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepC10' && estado.tipoLocal !== 'praia') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepC13' && (estado.convidadosForaCidade || 0) === 0) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepC15' && estado.coquetel !== true) return calcularProximaEtapa(estado, proximo);

  // Expansão D
  if (etapa.id === 'stepD1' && estado.flores !== true) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepD2' && !estado.tipoIluminacao) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepD3' && !estado.mobiliarioQual) return calcularProximaEtapa(estado, proximo);

  // Expansão N (antiga E - Documentação)
  if (etapa.id === 'stepE3' && estado.estadoCivilNoivo !== 'divorciado') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE4' && estado.estadoCivilNoiva !== 'divorciado') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE5' && estado.estadoCivilNoivo !== 'viuvo') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE6' && estado.estadoCivilNoiva !== 'viuvo') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE9' && estado.nacionalidadeNoivo === 'brasileiro' && estado.nacionalidadeNoiva === 'brasileiro') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE15' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE16' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE17' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE18' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepE19' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') return calcularProximaEtapa(estado, proximo);

  // Expansão G/H
  if (etapa.id === 'stepG8' && estado.coquetel !== true) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepG9' && !estado.tipoBar) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepG10' && (estado.criancas === false || estado.criancas === 'nao')) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepH3' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('fogos')) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepH4' && estado.mesaDocesExposta !== true) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepH5' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) return calcularProximaEtapa(estado, proximo);

  // Expansão I
  if (etapa.id === 'stepI4' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepI5' && estado.mudancaLook !== true) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepI6' && estado.padrinhosEscolhidos !== true) return calcularProximaEtapa(estado, proximo);

  // Bloco L
  if (etapa.id === 'stepL3' && estado.transporteEspecialNoivos !== true) return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepL4' && estado.carroNoivos === 'nao') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepL5' && estado.transporteConvidados === 'nao') return calcularProximaEtapa(estado, proximo);
  if (etapa.id === 'stepL6' && !['grande', 'mega'].includes(estado.totalConvidados) && estado.seguranca !== true) return calcularProximaEtapa(estado, proximo);

  // Bloco M
  if (etapa.id === 'stepM2' && (estado.luaDeMel === false || estado.luaDeMel === 'nao')) return calcularProximaEtapa(estado, proximo);

  return proximo;
}

export function calcularEtapasTotais(estado) {
  let count = 0;
  for (let i = 0; i < ETAPAS.length; i++) {
    const etapa = ETAPAS[i];
    if (etapa.id === 'step07a' && estado.tipoCerimonia !== 'catolica') continue;
    if (etapa.id === 'step07b' && estado.tipoCerimonia !== 'evangelica') continue;
    if (etapa.id === 'step07c' && estado.tipoCerimonia !== 'judaica') continue;
    if (etapa.id === 'step07d' && estado.tipoCerimonia !== 'simbolica') continue;
    if (etapa.id === 'stepA4' && estado.criancas === false) continue;
    if (etapa.id === 'stepA5' && estado.padrinhosEscolhidos === false) continue;
    if (etapa.id === 'stepA6' && !!estado.dataCasamento) continue;
    if (etapa.id === 'stepB5' && estado.criancas === false) continue;
    if (etapa.id === 'stepB6' && estado.tipoCerimonia === 'civil') continue;
    if (etapa.id === 'stepB7' && estado.tipoCerimonia === 'civil') continue;
    if (etapa.id === 'stepB9' && estado.tipoCerimonia !== 'catolica') continue;
    if (etapa.id === 'stepB10' && estado.tipoCerimonia !== 'catolica') continue;
    if (etapa.id === 'stepB11' && estado.tipoCerimonia !== 'judaica') continue;
    if (etapa.id === 'stepB12' && estado.tipoCerimonia !== 'judaica') continue;
    if (etapa.id === 'stepB13' && estado.tipoCerimonia !== 'simbolica') continue;
    if (etapa.id === 'stepB14' && estado.tipoCerimonia !== 'civil') continue;
    if (etapa.id === 'stepB18' && estado.tipoCerimonia !== 'catolica') continue;
    if (etapa.id === 'stepC4' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) continue;
    if (etapa.id === 'stepC5' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) continue;
    if (etapa.id === 'stepC7' && ['salao', 'hotel', 'restaurante'].includes(estado.tipoLocal)) continue;
    if (etapa.id === 'stepC10' && estado.tipoLocal !== 'praia') continue;
    if (etapa.id === 'stepC13' && (estado.convidadosForaCidade || 0) === 0) continue;
    if (etapa.id === 'stepC15' && estado.coquetel !== true) continue;
    if (etapa.id === 'stepD1' && estado.flores !== true) continue;
    if (etapa.id === 'stepD2' && !estado.tipoIluminacao) continue;
    if (etapa.id === 'stepD3' && !estado.mobiliarioQual) continue;
    if (etapa.id === 'stepE3' && estado.estadoCivilNoivo !== 'divorciado') continue;
    if (etapa.id === 'stepE4' && estado.estadoCivilNoiva !== 'divorciado') continue;
    if (etapa.id === 'stepE5' && estado.estadoCivilNoivo !== 'viuvo') continue;
    if (etapa.id === 'stepE6' && estado.estadoCivilNoiva !== 'viuvo') continue;
    if (etapa.id === 'stepE9' && estado.nacionalidadeNoivo === 'brasileiro' && estado.nacionalidadeNoiva === 'brasileiro') continue;
    if (etapa.id === 'stepE15' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') continue;
    if (etapa.id === 'stepE16' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') continue;
    if (etapa.id === 'stepE17' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') continue;
    if (etapa.id === 'stepE18' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') continue;
    if (etapa.id === 'stepE19' && estado.luaDeMel !== true && estado.luaDeMel !== 'sim') continue;
    if (etapa.id === 'stepG8' && estado.coquetel !== true) continue;
    if (etapa.id === 'stepG9' && !estado.tipoBar) continue;
    if (etapa.id === 'stepG10' && (estado.criancas === false || estado.criancas === 'nao')) continue;
    if (etapa.id === 'stepH3' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('fogos')) continue;
    if (etapa.id === 'stepH4' && estado.mesaDocesExposta !== true) continue;
    if (etapa.id === 'stepH5' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) continue;
    if (etapa.id === 'stepI4' && estado.atividadesEntretenimento && !estado.atividadesEntretenimento.includes('aula-danca')) continue;
    if (etapa.id === 'stepI5' && estado.mudancaLook !== true) continue;
    if (etapa.id === 'stepI6' && estado.padrinhosEscolhidos !== true) continue;
    if (etapa.id === 'stepL3' && estado.transporteEspecialNoivos !== true) continue;
    if (etapa.id === 'stepL4' && estado.carroNoivos === 'nao') continue;
    if (etapa.id === 'stepL5' && estado.transporteConvidados === 'nao') continue;
    if (etapa.id === 'stepL6' && !['grande', 'mega'].includes(estado.totalConvidados) && estado.seguranca !== true) continue;
    if (etapa.id === 'stepM2' && (estado.luaDeMel === false || estado.luaDeMel === 'nao')) continue;
    count++;
  }
  return count;
}

export function deveExibirLoginAgora(estado, etapaId) {
  const etapasBlocoA = ETAPAS.filter(e => e.bloco === 'A').map(e => e.id);
  const etapaAtualIdx = ETAPAS.findIndex(e => e.id === etapaId);
  const ultimoBlocoA = ETAPAS.findIndex(e => e.id === etapasBlocoA[etapasBlocoA.length - 1]);
  return etapaAtualIdx > ultimoBlocoA && !estado.user_id;
}

export { ETAPAS, INDICE_POR_ID };