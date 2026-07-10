// utils/linguagemCasal.js
// Adapta pronomes e termos conforme perfil do casal / tipo de evento
// Nunca hardcode "noiva/noivo" — sempre usar este utilitário
// Compatibilidade: chamadas antigas com 1 argumento funcionam automaticamente (fallback casamento)

// ==========================================
// MAPAS DE TERMOS POR TIPO DE EVENTO
// ==========================================

const TERMOS_CASAMENTO = {
  'noiva-noivo': {
    casal: 'os noivos',
    casalCap: 'Os noivos',
    pessoa1: 'noiva',
    pessoa2: 'noivo',
    pessoa1ComArtigo: 'a noiva',
    pessoa2ComArtigo: 'o noivo',
    pessoa1Cap: 'Noiva',
    pessoa2Cap: 'Noivo',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'os',
    artigoCap: 'Os',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'feminino',
    genero2: 'masculino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  'duas-noivas': {
    casal: 'as noivas',
    casalCap: 'As noivas',
    pessoa1: 'primeira noiva',
    pessoa2: 'segunda noiva',
    pessoa1ComArtigo: 'a primeira noiva',
    pessoa2ComArtigo: 'a segunda noiva',
    pessoa1Cap: 'Primeira Noiva',
    pessoa2Cap: 'Segunda Noiva',
    pronome: 'elas',
    pronomeCap: 'Elas',
    possessivo: 'delas',
    artigo: 'as',
    artigoCap: 'As',
    chamada: 'noivas',
    chamadaCap: 'Noivas',
    genero1: 'feminino',
    genero2: 'feminino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  'dois-noivos': {
    casal: 'os noivos',
    casalCap: 'Os noivos',
    pessoa1: 'primeiro noivo',
    pessoa2: 'segundo noivo',
    pessoa1ComArtigo: 'o primeiro noivo',
    pessoa2ComArtigo: 'o segundo noivo',
    pessoa1Cap: 'Primeiro Noivo',
    pessoa2Cap: 'Segundo Noivo',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'os',
    artigoCap: 'Os',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'masculino',
    genero2: 'masculino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  'nao-especificar': {
    casal: 'o casal',
    casalCap: 'O casal',
    pessoa1: 'primeira pessoa',
    pessoa2: 'segunda pessoa',
    pessoa1ComArtigo: 'a primeira pessoa',
    pessoa2ComArtigo: 'a segunda pessoa',
    pessoa1Cap: 'Primeira Pessoa',
    pessoa2Cap: 'Segunda Pessoa',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'o',
    artigoCap: 'O',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'neutro',
    genero2: 'neutro',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
};

const TERMOS_15ANOS = {
  debutante: {
    casal: 'a debutante e sua família',
    casalCap: 'A debutante e sua família',
    pessoa1: 'debutante',
    pessoa2: 'acompanhante',
    pessoa1ComArtigo: 'a debutante',
    pessoa2ComArtigo: 'o acompanhante',
    pessoa1Cap: 'Debutante',
    pessoa2Cap: 'Acompanhante',
    pronome: 'ela',
    pronomeCap: 'Ela',
    possessivo: 'dela',
    artigo: 'a',
    artigoCap: 'A',
    chamada: 'debutante',
    chamadaCap: 'Debutante',
    genero1: 'feminino',
    genero2: 'neutro',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  'debutante-padrinho': {
    casal: 'a debutante e seu padrinho',
    casalCap: 'A debutante e seu padrinho',
    pessoa1: 'debutante',
    pessoa2: 'padrinho',
    pessoa1ComArtigo: 'a debutante',
    pessoa2ComArtigo: 'o padrinho',
    pessoa1Cap: 'Debutante',
    pessoa2Cap: 'Padrinho',
    pronome: 'ela',
    pronomeCap: 'Ela',
    possessivo: 'dela',
    artigo: 'a',
    artigoCap: 'A',
    chamada: 'debutante',
    chamadaCap: 'Debutante',
    genero1: 'feminino',
    genero2: 'masculino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
};

const TERMOS_BARMITZVAH = {
  celebrante: {
    casal: 'o bar mitzvah e sua família',
    casalCap: 'O bar mitzvah e sua família',
    pessoa1: 'bar mitzvah',
    pessoa2: 'acompanhante',
    pessoa1ComArtigo: 'o bar mitzvah',
    pessoa2ComArtigo: 'o acompanhante',
    pessoa1Cap: 'Bar Mitzvah',
    pessoa2Cap: 'Acompanhante',
    pronome: 'ele',
    pronomeCap: 'Ele',
    possessivo: 'dele',
    artigo: 'o',
    artigoCap: 'O',
    chamada: 'bar mitzvah',
    chamadaCap: 'Bar Mitzvah',
    genero1: 'masculino',
    genero2: 'neutro',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  'celebrante-padrinho': {
    casal: 'o bar mitzvah e seu padrinho',
    casalCap: 'O bar mitzvah e seu padrinho',
    pessoa1: 'bar mitzvah',
    pessoa2: 'padrinho',
    pessoa1ComArtigo: 'o bar mitzvah',
    pessoa2ComArtigo: 'o padrinho',
    pessoa1Cap: 'Bar Mitzvah',
    pessoa2Cap: 'Padrinho',
    pronome: 'ele',
    pronomeCap: 'Ele',
    possessivo: 'dele',
    artigo: 'o',
    artigoCap: 'O',
    chamada: 'bar mitzvah',
    chamadaCap: 'Bar Mitzvah',
    genero1: 'masculino',
    genero2: 'masculino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
};

const TERMOS_BATMITZVAH = {
  celebrante: {
    casal: 'a bat mitzvah e sua família',
    casalCap: 'A bat mitzvah e sua família',
    pessoa1: 'bat mitzvah',
    pessoa2: 'acompanhante',
    pessoa1ComArtigo: 'a bat mitzvah',
    pessoa2ComArtigo: 'a acompanhante',
    pessoa1Cap: 'Bat Mitzvah',
    pessoa2Cap: 'Acompanhante',
    pronome: 'ela',
    pronomeCap: 'Ela',
    possessivo: 'dela',
    artigo: 'a',
    artigoCap: 'A',
    chamada: 'bat mitzvah',
    chamadaCap: 'Bat Mitzvah',
    genero1: 'feminino',
    genero2: 'neutro',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  'celebrante-madrinha': {
    casal: 'a bat mitzvah e sua madrinha',
    casalCap: 'A bat mitzvah e sua madrinha',
    pessoa1: 'bat mitzvah',
    pessoa2: 'madrinha',
    pessoa1ComArtigo: 'a bat mitzvah',
    pessoa2ComArtigo: 'a madrinha',
    pessoa1Cap: 'Bat Mitzvah',
    pessoa2Cap: 'Madrinha',
    pronome: 'ela',
    pronomeCap: 'Ela',
    possessivo: 'dela',
    artigo: 'a',
    artigoCap: 'A',
    chamada: 'bat mitzvah',
    chamadaCap: 'Bat Mitzvah',
    genero1: 'feminino',
    genero2: 'feminino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
};

const TERMOS_FORMATURA = {
  formando: {
    casal: 'o formando e seus convidados',
    casalCap: 'O formando e seus convidados',
    pessoa1: 'formando',
    pessoa2: 'acompanhante',
    pessoa1ComArtigo: 'o formando',
    pessoa2ComArtigo: 'o acompanhante',
    pessoa1Cap: 'Formando',
    pessoa2Cap: 'Acompanhante',
    pronome: 'ele',
    pronomeCap: 'Ele',
    possessivo: 'dele',
    artigo: 'o',
    artigoCap: 'O',
    chamada: 'formando',
    chamadaCap: 'Formando',
    genero1: 'masculino',
    genero2: 'neutro',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  formanda: {
    casal: 'a formanda e seus convidados',
    casalCap: 'A formanda e seus convidados',
    pessoa1: 'formanda',
    pessoa2: 'acompanhante',
    pessoa1ComArtigo: 'a formanda',
    pessoa2ComArtigo: 'a acompanhante',
    pessoa1Cap: 'Formanda',
    pessoa2Cap: 'Acompanhante',
    pronome: 'ela',
    pronomeCap: 'Ela',
    possessivo: 'dela',
    artigo: 'a',
    artigoCap: 'A',
    chamada: 'formanda',
    chamadaCap: 'Formanda',
    genero1: 'feminino',
    genero2: 'neutro',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  formandos: {
    casal: 'os formandos e seus convidados',
    casalCap: 'Os formandos e seus convidados',
    pessoa1: 'formando',
    pessoa2: 'formanda',
    pessoa1ComArtigo: 'o formando',
    pessoa2ComArtigo: 'a formanda',
    pessoa1Cap: 'Formando',
    pessoa2Cap: 'Formanda',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'os',
    artigoCap: 'Os',
    chamada: 'formandos',
    chamadaCap: 'Formandos',
    genero1: 'masculino',
    genero2: 'feminino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
  formandas: {
    casal: 'as formandas e seus convidados',
    casalCap: 'As formandas e seus convidados',
    pessoa1: 'formanda',
    pessoa2: 'formando',
    pessoa1ComArtigo: 'a formanda',
    pessoa2ComArtigo: 'o formando',
    pessoa1Cap: 'Formanda',
    pessoa2Cap: 'Formando',
    pronome: 'elas',
    pronomeCap: 'Elas',
    possessivo: 'delas',
    artigo: 'as',
    artigoCap: 'As',
    chamada: 'formandas',
    chamadaCap: 'Formandas',
    genero1: 'feminino',
    genero2: 'masculino',
    pais: 'pais',
    paisCap: 'Pais',
    damas: 'damas',
    damasCap: 'Damas',
    pajens: 'pajens',
    pajensCap: 'Pajens',
    cavalheiros: 'cavalheiros',
    cavalheirosCap: 'Cavalheiros',
    rabino: 'rabino',
    rabinoCap: 'Rabino',
    turma: 'turma',
    turmaCap: 'Turma',
    professor: 'professor',
    professorCap: 'Professor',
    paraninfo: 'paraninfo',
    paraninfoCap: 'Paraninfo',
  },
};

// ==========================================
// MAPA GERAL
// ==========================================

const TERMOS_MAP = {
  casamento: TERMOS_CASAMENTO,
  '15anos': TERMOS_15ANOS,
  barmitzvah: TERMOS_BARMITZVAH,
  batmitzvah: TERMOS_BATMITZVAH,
  formatura: TERMOS_FORMATURA,
};

const FALLBACK_PERFIL = 'nao-especificar';
const FALLBACK_TIPO_EVENTO = 'casamento';

// ==========================================
// HELPERS INTERNOS
// ==========================================

/**
 * Resolve tipoEvento e perfilCasal a partir dos argumentos passados.
 * @private
 */
function _resolverArgs(args) {
  const count = args.length;

  // 0 args → fallback total
  if (count === 0) {
    return { tipoEvento: FALLBACK_TIPO_EVENTO, perfilCasal: FALLBACK_PERFIL };
  }

  // 1 arg → compatibilidade antiga (casamento)
  if (count === 1) {
    const arg = args[0];
    // Se for objeto (ex: { perfil: 'noivos' }), extrai .perfil
    if (arg && typeof arg === 'object') {
      const perfil = arg.perfil || FALLBACK_PERFIL;
      return { tipoEvento: FALLBACK_TIPO_EVENTO, perfilCasal: perfil };
    }
    // Se for string, assume como perfil de casamento
    if (typeof arg === 'string') {
      return { tipoEvento: FALLBACK_TIPO_EVENTO, perfilCasal: arg };
    }
    return { tipoEvento: FALLBACK_TIPO_EVENTO, perfilCasal: FALLBACK_PERFIL };
  }

  // 2 args → novo padrão (tipoEvento, perfilCasal)
  if (count >= 2) {
    const [tipoEvento, perfilCasal] = args;
    return {
      tipoEvento: tipoEvento || FALLBACK_TIPO_EVENTO,
      perfilCasal: perfilCasal || FALLBACK_PERFIL,
    };
  }

  return { tipoEvento: FALLBACK_TIPO_EVENTO, perfilCasal: FALLBACK_PERFIL };
}

/**
 * Busca termos no mapa aninhado com fallback seguro.
 * @private
 */
function _buscarTermos(tipoEvento, perfilCasal) {
  const mapaEvento = TERMOS_MAP[tipoEvento] || TERMOS_MAP[FALLBACK_TIPO_EVENTO];
  const termos = mapaEvento[perfilCasal] || mapaEvento[FALLBACK_PERFIL];
  return termos || TERMOS_MAP[FALLBACK_TIPO_EVENTO][FALLBACK_PERFIL];
}

// ==========================================
// API PÚBLICA
// ==========================================

/**
 * Retorna termos adaptados conforme tipo de evento e perfil.
 *
 * ASSINATURAS SUPORTADAS (compatibilidade 100%):
 *   getTermos()                              → casamento, 'nao-especificar'
 *   getTermos('noiva-noivo')                 → casamento, 'noiva-noivo'
 *   getTermos({ perfil: 'noivos' })          → casamento, 'noivos'
 *   getTermos('15anos', 'debutante')         → 15 anos, 'debutante'
 *   getTermos('formatura', 'formando')       → formatura, 'formando'
 *
 * @param {string} [tipoEvento] - 'casamento' | '15anos' | 'barmitzvah' | 'batmitzvah' | 'formatura'
 * @param {string} [perfilCasal] - ex: 'noiva-noivo', 'debutante', 'formando'
 * @returns {Object} termos linguísticos completos
 */
export function getTermos(...args) {
  const { tipoEvento, perfilCasal } = _resolverArgs(args);
  return _buscarTermos(tipoEvento, perfilCasal);
}

/**
 * Retorna termo específico ou fallback neutro.
 *
 * ASSINATURAS SUPORTADAS:
 *   termo('noiva-noivo', 'pessoa1')              → casamento
 *   termo('15anos', 'debutante', 'pessoa1')    → 15 anos
 *
 * @param {string} tipoEvento
 * @param {string} perfilCasal
 * @param {string} chave - ex: 'casal', 'pessoa1', 'pronome'
 * @returns {string}
 */
export function termo(...args) {
  const count = args.length;

  // Compatibilidade antiga: termo(perfilCasal, chave)
  if (count === 2) {
    const [perfilCasal, chave] = args;
    const t = _buscarTermos(FALLBACK_TIPO_EVENTO, perfilCasal);
    return t[chave] || t['casal'];
  }

  // Novo padrão: termo(tipoEvento, perfilCasal, chave)
  if (count >= 3) {
    const [tipoEvento, perfilCasal, chave] = args;
    const t = _buscarTermos(tipoEvento, perfilCasal);
    return t[chave] || t['casal'];
  }

  // Fallback
  const t = _buscarTermos(FALLBACK_TIPO_EVENTO, FALLBACK_PERFIL);
  return t['casal'];
}

/**
 * Adapta uma frase com placeholders.
 *
 * ASSINATURAS SUPORTADAS:
 *   adaptarFrase('Quem são {casal}?', 'duas-noivas')              → casamento
 *   adaptarFrase('Quem são {casal}?', '15anos', 'debutante')      → 15 anos
 *
 * @param {string} frase - com placeholders entre {chave}
 * @param {string} tipoEvento
 * @param {string} perfilCasal
 * @returns {string}
 */
export function adaptarFrase(...args) {
  const count = args.length;

  // Compatibilidade antiga: adaptarFrase(frase, perfilCasal)
  if (count === 2) {
    const [frase, perfilCasal] = args;
    const t = _buscarTermos(FALLBACK_TIPO_EVENTO, perfilCasal);
    return frase.replace(/\{(\w+)\}/g, (_, chave) => t[chave] || `{${chave}}`);
  }

  // Novo padrão: adaptarFrase(frase, tipoEvento, perfilCasal)
  if (count >= 3) {
    const [frase, tipoEvento, perfilCasal] = args;
    const t = _buscarTermos(tipoEvento, perfilCasal);
    return frase.replace(/\{(\w+)\}/g, (_, chave) => t[chave] || `{${chave}}`);
  }

  return args[0] || '';
}

// ==========================================
// ALIAS DE COMPATIBILIDADE (opcional)
// ==========================================

// Mantém export default igual ao original
export default { getTermos, termo, adaptarFrase };