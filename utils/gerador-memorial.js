/**
 * utils/gerador-memorial.js
 * Monta o payload completo para a IA gerar o memorial
 * Inclui todas as ~110 chaves do estado (blocos A-M + expansão)
 */

export function montarPayloadMemorial(estado) {
  return {
    // ─── A: Perfil ───
    perfil: estado.perfil,
    modoPlanejamento: estado.modoPlanejamento,
    nomeNoiva: estado.nomeNoiva,
    nomeNoivo: estado.nomeNoivo,
    dataCasamento: estado.dataCasamento,
    cidade: estado.cidade,
    estado: estado.estado,
    totalConvidados: estado.totalConvidados,
    dataPrevista: estado.dataPrevista,
    criancas: estado.criancas,
    padrinhosEscolhidos: estado.padrinhosEscolhidos,
    quantosPadrinhos: estado.quantosPadrinhos,

    // ─── B: Cerimônia ───
    tipoCerimonia: estado.tipoCerimonia,
    reservouIgreja: estado.reservouIgreja,
    padreEscolhido: estado.padreEscolhido,
    cursoNoivos: estado.cursoNoivos,
    celebranteLaico: estado.celebranteLaico,
    mesmoLocal: estado.mesmoLocal,
    criancasCerimonia: estado.criancasCerimonia,
    duracaoCerimonia: estado.duracaoCerimonia,
    musicaCerimoniaViva: estado.musicaCerimoniaViva,

    // ─── C: Local ───
    tipoLocal: estado.tipoLocal,
    horarioCasamento: estado.horarioCasamento,
    planoChuva: estado.planoChuva,
    transporteNoivos: estado.transporteNoivos,
    estacionamento: estado.estacionamento,
    cozinhaApoio: estado.cozinhaApoio,
    capacidadeLocal: estado.capacidadeLocal,
    geradorLocal: estado.geradorLocal,

    // ─── D: Identidade Visual ───
    estilo: estado.estilo,
    formalidade: estado.formalidade,
    paleta: estado.paleta,
    tom: estado.tom,
    referencias: estado.referencias,

    // ─── E: Decoração ───
    flores: estado.flores,
    locaisFlores: estado.locaisFlores,
    iluminacao: estado.iluminacao,
    velas: estado.velas,
    tipoVelas: estado.tipoVelas,
    mobiliarioEspecial: estado.mobiliarioEspecial,
    backdrop: estado.backdrop,
    tecidos: estado.tecidos,

    // ─── F: Mesa Posta ───
    toalha: estado.toalha,
    loucas: estado.loucas,
    talheres: estado.talheres,
    tacas: estado.tacas,
    centroMesa: estado.centroMesa,
    guardanapo: estado.guardanapo,
    cartaoLugar: estado.cartaoLugar,

    // ─── G: Cerimônia Detalhada ───
    entradaNoivos: estado.entradaNoivos,
    acompanhamento: estado.acompanhamento,
    musicaCerimonia: estado.musicaCerimonia,
    elementosCerimonia: estado.elementosCerimonia,
    padrinhos: estado.padrinhos,
    papeisCriancas: estado.papeisCriancas,
    rituaisSimbolicos: estado.rituaisSimbolicos,
    saidaNoivos: estado.saidaNoivos,

    // ─── H: Recepção ───
    coquetel: estado.coquetel,
    duracaoCoquetel: estado.duracaoCoquetel,
    tipoJantar: estado.tipoJantar,
    restricoesAlimentares: estado.restricoesAlimentares,
    bolo: estado.bolo,
    saborBolo: estado.saborBolo,
    mesaDoces: estado.mesaDoces,
    bemCasados: estado.bemCasados,
    tipoBar: estado.tipoBar,
    bartender: estado.bartender,
    mesaFrios: estado.mesaFrios,
    bebidasPorPessoa: estado.bebidasPorPessoa,
    menuInfantil: estado.menuInfantil,
    musicaFesta: estado.musicaFesta,
    estiloMusical: estado.estiloMusical,
    atividadesEntretenimento: estado.atividadesEntretenimento,
    lembrancinhas: estado.lembrancinhas,
    kitSaida: estado.kitSaida,
    itensKitSaida: estado.itensKitSaida,
    fogosSparklers: estado.fogosSparklers,
    mesaDocesExposta: estado.mesaDocesExposta,
    aulaDanca: estado.aulaDanca,

    // ─── I: Papelaria ───
    formatoConvite: estado.formatoConvite,
    saveTheDate: estado.saveTheDate,
    sinalizacaoEvento: estado.sinalizacaoEvento,
    monograma: estado.monograma,
    fontesIdentidade: estado.fontesIdentidade,
    itensDigitais: estado.itensDigitais,

    // ─── J: Vestuário ───
    estiloVestido: estado.estiloVestido,
    atelierContratado: estado.atelierContratado,
    acessorios: estado.acessorios,
    estiloMaquiagem: estado.estiloMaquiagem,
    estiloCabelo: estado.estiloCabelo,
    profissionalBeleza: estado.profissionalBeleza,
    padronizarMadrinhas: estado.padronizarMadrinhas,
    padronizarPadrinhos: estado.padronizarPadrinhos,
    aulasDanca: estado.aulasDanca,
    mudancaLook: estado.mudancaLook,
    quantasMadrinhas: estado.quantasMadrinhas,

    // ─── K: Fornecedores ───
    fornecedoresNecessarios: estado.fornecedoresNecessarios,

    // ─── L: Logística ───
    aliancasEscolhidas: estado.aliancasEscolhidas,
    civilJunto: estado.civilJunto,
    transporteEspecialNoivos: estado.transporteEspecialNoivos,
    carroNoivos: estado.carroNoivos,
    transporteConvidados: estado.transporteConvidados,
    seguranca: estado.seguranca,

    // ─── M: Pós-casamento ───
    luaDeMel: estado.luaDeMel,
    destinoLuaDeMel: estado.destinoLuaDeMel,
    fotosLuaDeMel: estado.fotosLuaDeMel,
  };
}

/**
 * Monta o texto do prompt para a IA (Claude)
 * Tom: elegante, acolhedor, específico — nunca genérico
 */
export function montarPromptMemorial(estado) {
  const dados = montarPayloadMemorial(estado);

  return `Você é um especialista em casamentos brasileiros com 20 anos de experiência. Com base nas escolhas abaixo, gere um memorial completo, detalhado e personalizado. Tom: elegante, acolhedor, específico. Nunca genérico — use os detalhes fornecidos para criar algo único para este casal.

Perfil do casal: ${dados.perfil || 'não informado'}
Modo de planejamento: ${dados.modoPlanejamento || 'não informado'}
Data: ${dados.dataCasamento || 'não informada'} | Cidade: ${dados.cidade || 'não informada'} | Estado: ${dados.estado || 'não informado'}
Convidados: ${dados.totalConvidados || 'não informado'} | Crianças: ${dados.criancas ? 'sim' : 'não'} | Padrinhos: ${dados.quantosPadrinhos || 'não informado'}

Estilo: ${dados.estilo || 'não informado'} | Formalidade: ${dados.formalidade || 'não informada'}
Paleta: ${Array.isArray(dados.paleta) ? dados.paleta.join(', ') : dados.paleta || 'não informada'}
Tom: ${dados.tom || 'não informado'}

Cerimônia: ${dados.tipoCerimonia || 'não informada'} | Mesmo local da festa: ${dados.mesmoLocal ? 'sim' : 'não'}
Duração: ${dados.duracaoCerimonia || 'não informada'} | Música ao vivo: ${dados.musicaCerimoniaViva || 'não informada'}

Local: ${dados.tipoLocal || 'não informado'} | Horário: ${dados.horarioCasamento || 'não informado'}
Plano de chuva: ${dados.planoChuva ? 'sim' : 'não'} | Estacionamento: ${dados.estacionamento || 'não informado'}

Decoração: flores ${dados.flores ? 'sim' : 'não'} (${dados.locaisFlores?.join(', ') || ''}) | iluminação ${dados.iluminacao || 'não informada'} | velas ${dados.velas ? 'sim' : 'não'} | mobiliário especial ${dados.mobiliarioEspecial ? 'sim' : 'não'} | backdrop ${dados.backdrop ? 'sim' : 'não'} | têxteis ${dados.tecidos ? 'sim' : 'não'}

Mesa posta: toalha ${dados.toalha || 'não informada'} | louças ${dados.loucas || 'não informadas'} | talheres ${dados.talheres || 'não informados'} | taças ${dados.tacas || 'não informadas'} | centro de mesa ${dados.centroMesa || 'não informado'} | guardanapo ${dados.guardanapo || 'não informado'} | cartão de lugar ${dados.cartaoLugar ? 'sim' : 'não'}

Entrada dos noivos: ${dados.entradaNoivos || 'não informada'} | Acompanhamento: ${dados.acompanhamento || 'não informado'}
Música da cerimônia: ${dados.musicaCerimonia || 'não informada'} | Elementos: ${dados.elementosCerimonia?.join(', ') || 'nenhum'}
Rituais simbólicos: ${dados.rituaisSimbolicos?.join(', ') || 'nenhum'} | Saída: ${dados.saidaNoivos || 'não informada'}

Recepção: coquetel ${dados.coquetel ? 'sim' : 'não'} | Tipo de jantar: ${dados.tipoJantar || 'não informado'} | Restrições: ${dados.restricoesAlimentares?.join(', ') || 'nenhuma'}
Bolo: ${dados.bolo || 'não informado'} | Mesa de doces: ${dados.mesaDoces ? 'sim' : 'não'} | Bem-casados: ${dados.bemCasados ? 'sim' : 'não'}
Bar: ${dados.tipoBar || 'não informado'} | Bartender: ${dados.bartender ? 'sim' : 'não'} | Mesa de frios: ${dados.mesaFrios ? 'sim' : 'não'}
Música da festa: ${dados.musicaFesta || 'não informada'} | Atividades: ${dados.atividadesEntretenimento?.join(', ') || 'nenhuma'}

Vestuário: ${dados.estiloVestido || 'não informado'} | Ateliê contratado: ${dados.atelierContratado ? 'sim' : 'não'}
Beleza: maquiagem ${dados.estiloMaquiagem || 'não informada'} | cabelo ${dados.estiloCabelo || 'não informado'} | Profissional: ${dados.profissionalBeleza ? 'sim' : 'não'}
Padronização madrinhas: ${dados.padronizarMadrinhas || 'não informada'} | padrinhos: ${dados.padronizarPadrinhos || 'não informada'}

Papelaria: convite ${dados.formatoConvite || 'não informado'} | Save the date: ${dados.saveTheDate ? 'sim' : 'não'} | Monograma: ${dados.monograma || 'não informado'}
Itens digitais: ${dados.itensDigitais?.join(', ') || 'nenhum'}

Logística: alianças ${dados.aliancasEscolhidas || 'não informado'} | Civil junto: ${dados.civilJunto || 'não informado'}
Transporte noivos: ${dados.transporteEspecialNoivos ? 'sim' : 'não'} | Carro: ${dados.carroNoivos || 'não informado'}
Transporte convidados: ${dados.transporteConvidados || 'não informado'} | Segurança: ${dados.seguranca ? 'sim' : 'não'}

Lua de mel: ${dados.luaDeMel ? 'sim' : 'não'} | Destino: ${dados.destinoLuaDeMel || 'não informado'} | Fotos: ${dados.fotosLuaDeMel ? 'sim' : 'não'}

Gere o memorial com estas seções em markdown:
## Identidade Visual
## Cerimônia
## Decoração
## Mesa Posta
## Alimentação e Bebidas
## Entretenimento
## Vestuário e Beleza
## Papelaria e Identidade
## Fornecedores Necessários (lista por categoria)
## Linha do Tempo (mês a mês até a data)
## Checklist de Decisões Pendentes
## Estimativa de Orçamento por Categoria`;
}

export default { montarPayloadMemorial, montarPromptMemorial };