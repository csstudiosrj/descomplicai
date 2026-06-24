// utils/condicoesFornecedores.js
// Recebe memorial em camelCase, retorna flags em snake_case
// Usado por preFornecedores.js, gerador-tarefas.js e catalogoFornecedores.js

/**
 * Computa flags condicionais a partir do estado do memorial
 * @param {Object} estado - estado do memorial (camelCase)
 * @returns {Object} flags em snake_case
 */
export function computarCondicoes(estado) {
  if (!estado) return {};

  const e = estado;

  // --- Perfil do casal ---
  const perfil = e.perfil || '';
  const tem_noiva = perfil === 'noiva+noivo' || perfil === 'duas_noivas' || perfil === 'nao_especificado';
  const tem_noivo = perfil === 'noiva+noivo' || perfil === 'dois_noivos' || perfil === 'nao_especificado';
  const tem_criancas = e.criancas === true || e.criancas === 'sim' || e.criancas === 'alguns';
  const tem_padrinhos = e.padrinhosEscolhidos === true;

  // --- Cerimônia ---
  const cerimonia_religiosa = ['catolica', 'evangelica', 'judaica'].includes(e.tipoCerimonia);
  const cerimonia_judaica = e.tipoCerimonia === 'judaica';
  const cerimonia_catolica = e.tipoCerimonia === 'catolica';
  const cerimonia_evangelica = e.tipoCerimonia === 'evangelica';
  const cerimonia_simbolica = e.tipoCerimonia === 'simbolica';
  const cerimonia_civil = e.tipoCerimonia === 'civil';
  const cerimonia_com_criancas = e.criancasCerimonia === true || e.criancasCerimonia === 'sim';
  const cerimonia_curta = e.duracaoCerimonia === '30min';
  const cerimonia_longa = e.duracaoCerimonia === 'mais_1h';
  const musica_viva_cerimonia = e.musicaCerimoniaViva === 'sim' || e.musicaCerimoniaViva === 'talvez';

  // --- Local ---
  const local_externo = ['praia', 'sitio', 'jardim', 'rooftop', 'haras'].includes(e.tipoLocal);
  const local_rural = ['sitio', 'jardim', 'haras'].includes(e.tipoLocal);
  const local_praia = e.tipoLocal === 'praia';
  const tem_estacionamento = e.estacionamento === 'sim' || e.estacionamento === 'valet';
  const tem_valet = e.estacionamento === 'valet';
  const tem_cozinha_apoio = e.cozinhaApoio === true;
  const tem_gerador = e.geradorLocal === 'sim';
  const precisa_gerador = e.geradorLocal === 'nao' || e.geradorLocal === 'nao_sei';

  // --- Convidados ---
  const convidados_grandes = ['grande', 'mega'].includes(e.totalConvidados);
  const convidados_muitos = e.totalConvidados === 'mega';
  const convidados_fora_cidade = Number(e.convidadosForaCidade || 0) > 0;
  const capacidade_suficiente = Number(e.capacidadeLocal || 0) >= Number(e.totalConvidados || 0);

  // --- Estilo / Decoração ---
  const tem_flores = e.flores === true;
  const tem_iluminacao = !!e.iluminacao;
  const tem_velas = e.velas === true;
  const tem_mobiliario = e.mobiliarioEspecial === true;
  const tem_backdrop = e.backdrop === true;
  const tem_tecidos = e.tecidos === true;

  // --- Mesa posta ---
  const tem_toalha = !!e.toalha;
  const tem_loucas = !!e.loucas;
  const tem_talheres = !!e.talheres;
  const tem_tacas = !!e.tacas;
  const tem_centro_mesa = !!e.centroMesa;
  const tem_guardanapo = !!e.guardanapo;
  const tem_cartao_lugar = e.cartaoLugar === true;

  // --- Recepção / Alimentação ---
  const tem_coquetel = e.coquetel === true;
  const tem_jantar = !!e.tipoJantar;
  const tem_bolo = !!e.bolo;
  const tem_mesa_doces = e.mesaDoces === true;
  const tem_bem_casados = e.bemCasados === true;
  const tem_bar = !!e.tipoBar;
  const open_bar_completo = e.tipoBar === 'open bar completo';
  const tem_mesa_frios = e.mesaFrios === true;
  const bebidas_livres = e.bebidasPorPessoa === 'livre';
  const bebidas_controladas = e.bebidasPorPessoa === 'controlado';
  const tem_menu_infantil = e.menuInfantil === true;
  const tem_restricoes = Array.isArray(e.restricoesAlimentares) && e.restricoesAlimentares.length > 0;

  // --- Entretenimento ---
  const atividades = e.atividadesEntretenimento || [];
  const tem_cabine_fotos = atividades.includes('cabine-fotos') || atividades.includes('cabine_fotos');
  const tem_drone = atividades.includes('drone');
  const tem_animacao_infantil = atividades.includes('animacao-infantil') || atividades.includes('animacao_infantil');
  const tem_fogos = e.fogosSparklers === true;
  const tem_mesa_doces_exposta = e.mesaDocesExposta === true;
  const tem_aula_danca = e.aulaDanca === true;
  const tem_musica_festa = !!e.musicaFesta;
  const tem_estilo_musical = !!e.estiloMusical;

  // --- Papelaria ---
  const convite_fisico = e.formatoConvite === 'fisico';
  const convite_digital = e.formatoConvite === 'digital';
  const tem_save_the_date = e.saveTheDate === true;
  const tem_sinalizacao = e.sinalizacaoEvento === true;
  const tem_monograma = !!e.monograma;

  // --- Vestuário ---
  const tem_vestido = !!e.estiloVestido && e.estiloVestido !== 'jumpsuit';
  const tem_jumpsuit = e.estiloVestido === 'jumpsuit';
  const tem_atelier = e.atelierContratado === true;
  const tem_acessorios = Array.isArray(e.acessorios) && e.acessorios.length > 0;
  const tem_maquiagem = !!e.estiloMaquiagem;
  const tem_cabelo = !!e.estiloCabelo;
  const tem_profissional_beleza = e.profissionalBeleza === true;
  const padronizar_madrinhas = !!e.padronizarMadrinhas;
  const padronizar_padrinhos = !!e.padronizarPadrinhos;
  const tem_aulas_danca = e.aulasDanca === true;
  const tem_mudanca_look = e.mudancaLook === true;
  const tem_madrinhas = Number(e.quantasMadrinhas || 0) > 0;

  // --- Logística ---
  const aliancas_escolhidas = e.aliancasEscolhidas === 'sim';
  const aliancas_buscando = e.aliancasEscolhidas === 'buscando';
  const civil_junto = e.civilJunto === 'sim';
  const ja_casados = e.civilJunto === 'ja_casados';
  const transporte_especial_noivos = e.transporteEspecialNoivos === true;
  const tem_carro_noivos = e.carroNoivos === 'sim' || e.carroNoivos === 'talvez';
  const transporte_convidados_sim = e.transporteConvidados === 'sim' || e.transporteConvidados === 'alguns';
  const transporte_convidados_todos = e.transporteConvidados === 'sim';
  const precisa_seguranca = e.seguranca === true || convidados_grandes;

  // --- Pós-casamento ---
  const tem_lua_de_mel = e.luaDeMel === true || e.luaDeMel === 'sim' || e.luaDeMel === 'em_pesquisa';
  const lua_de_mel_pesquisa = e.luaDeMel === 'em_pesquisa';
  const tem_fotos_lua_de_mel = e.fotosLuaDeMel === true;
  const destino_estrangeiro = e.destinoLuaDeMel && !['brasil', 'nacional', ''].includes(e.destinoLuaDeMel.toLowerCase());

  // --- Documentação ---
  const noivo_divorciado = e.estadoCivilNoivo === 'divorciado';
  const noiva_divorciada = e.estadoCivilNoiva === 'divorciado';
  const noivo_viuvo = e.estadoCivilNoivo === 'viuvo';
  const noiva_viuva = e.estadoCivilNoiva === 'viuvo';
  const estrangeiro = e.nacionalidadeNoivo !== 'brasileiro' || e.nacionalidadeNoiva !== 'brasileiro';

  // --- Fornecedores já contratados ---
  const fotografo_contratado = e.fotografoContratado === true;
  const filmagem_contratada = e.filmagemContratada === true;
  const buffet_contratado = e.buffetContratado === true;
  const decoracao_contratada = e.decoracaoContratada === true;
  const musica_contratada = e.musicaContratada === true;
  const vestido_comprado = e.vestidoComprado === true;
  const traje_noivo_contratado = e.trajeNoivoContratado === true;
  const cerimonialista_contratado = e.cerimonialistaContratado === true;
  const cabine_fotos_contratada = e.cabineFotos === true;
  const drone_contratado = e.droneContratado === true;
  const animacao_infantil_contratada = e.animacaoInfantil === true;
  const convites_encomendados = e.convitesEncomendados === true;
  const bartender_contratado = e.bartender === true;
  const lua_de_mel_reservada = e.luaDeMelReservada === true;
  const passaporte_valido = e.passaporteValido === true;
  const visto_ok = e.visto === true;

  return {
    // Perfil
    tem_noiva,
    tem_noivo,
    tem_criancas,
    tem_padrinhos,

    // Cerimônia
    cerimonia_religiosa,
    cerimonia_judaica,
    cerimonia_catolica,
    cerimonia_evangelica,
    cerimonia_simbolica,
    cerimonia_civil,
    cerimonia_com_criancas,
    cerimonia_curta,
    cerimonia_longa,
    musica_viva_cerimonia,

    // Local
    local_externo,
    local_rural,
    local_praia,
    tem_estacionamento,
    tem_valet,
    tem_cozinha_apoio,
    tem_gerador,
    precisa_gerador,

    // Convidados
    convidados_grandes,
    convidados_muitos,
    convidados_fora_cidade,
    capacidade_suficiente,

    // Decoração
    tem_flores,
    tem_iluminacao,
    tem_velas,
    tem_mobiliario,
    tem_backdrop,
    tem_tecidos,

    // Mesa
    tem_toalha,
    tem_loucas,
    tem_talheres,
    tem_tacas,
    tem_centro_mesa,
    tem_guardanapo,
    tem_cartao_lugar,

    // Recepção
    tem_coquetel,
    tem_jantar,
    tem_bolo,
    tem_mesa_doces,
    tem_bem_casados,
    tem_bar,
    open_bar_completo,
    tem_mesa_frios,
    bebidas_livres,
    bebidas_controladas,
    tem_menu_infantil,
    tem_restricoes,

    // Entretenimento
    tem_cabine_fotos,
    tem_drone,
    tem_animacao_infantil,
    tem_fogos,
    tem_mesa_doces_exposta,
    tem_aula_danca,
    tem_musica_festa,
    tem_estilo_musical,

    // Papelaria
    convite_fisico,
    convite_digital,
    tem_save_the_date,
    tem_sinalizacao,
    tem_monograma,

    // Vestuário
    tem_vestido,
    tem_jumpsuit,
    tem_atelier,
    tem_acessorios,
    tem_maquiagem,
    tem_cabelo,
    tem_profissional_beleza,
    padronizar_madrinhas,
    padronizar_padrinhos,
    tem_aulas_danca,
    tem_mudanca_look,
    tem_madrinhas,

    // Logística
    aliancas_escolhidas,
    aliancas_buscando,
    civil_junto,
    ja_casados,
    transporte_especial_noivos,
    tem_carro_noivos,
    transporte_convidados_sim,
    transporte_convidados_todos,
    precisa_seguranca,

    // Pós-casamento
    tem_lua_de_mel,
    lua_de_mel_pesquisa,
    tem_fotos_lua_de_mel,
    destino_estrangeiro,

    // Documentação
    noivo_divorciado,
    noiva_divorciada,
    noivo_viuvo,
    noiva_viuva,
    estrangeiro,

    // Contratados
    fotografo_contratado,
    filmagem_contratada,
    buffet_contratado,
    decoracao_contratada,
    musica_contratada,
    vestido_comprado,
    traje_noivo_contratado,
    cerimonialista_contratado,
    cabine_fotos_contratada,
    drone_contratado,
    animacao_infantil_contratada,
    convites_encomendados,
    bartender_contratado,
    lua_de_mel_reservada,
    passaporte_valido,
    visto_ok,
  };
}

export default { computarCondicoes };
