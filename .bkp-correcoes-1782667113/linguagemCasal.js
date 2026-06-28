// utils/linguagemCasal.js
// Adapta pronomes e termos conforme perfil do casal definido no onboarding
// Nunca hardcode "noiva/noivo" — sempre usar este utilitário

const PERFIL_MAP = {
  'noiva-noivo': {
    casal: 'os noivos',
    casalCap: 'Os noivos',
    pessoa1: 'a noiva',
    pessoa2: 'o noivo',
    pessoa1Cap: 'A noiva',
    pessoa2Cap: 'O noivo',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'os',
    artigoCap: 'Os',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'feminino',
    genero2: 'masculino',
  },
  'duas-noivas': {
    casal: 'as noivas',
    casalCap: 'As noivas',
    pessoa1: 'a primeira noiva',
    pessoa2: 'a segunda noiva',
    pessoa1Cap: 'A primeira noiva',
    pessoa2Cap: 'A segunda noiva',
    pronome: 'elas',
    pronomeCap: 'Elas',
    possessivo: 'delas',
    artigo: 'as',
    artigoCap: 'As',
    chamada: 'noivas',
    chamadaCap: 'Noivas',
    genero1: 'feminino',
    genero2: 'feminino',
  },
  'dois-noivos': {
    casal: 'os noivos',
    casalCap: 'Os noivos',
    pessoa1: 'o primeiro noivo',
    pessoa2: 'o segundo noivo',
    pessoa1Cap: 'O primeiro noivo',
    pessoa2Cap: 'O segundo noivo',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'os',
    artigoCap: 'Os',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'masculino',
    genero2: 'masculino',
  },
  'nao-especificar': {
    casal: 'o casal',
    casalCap: 'O casal',
    pessoa1: 'a primeira pessoa',
    pessoa2: 'a segunda pessoa',
    pessoa1Cap: 'A primeira pessoa',
    pessoa2Cap: 'A segunda pessoa',
    pronome: 'eles',
    pronomeCap: 'Eles',
    possessivo: 'deles',
    artigo: 'o',
    artigoCap: 'O',
    chamada: 'noivos',
    chamadaCap: 'Noivos',
    genero1: 'neutro',
    genero2: 'neutro',
  },
};

/**
 * Retorna termos adaptados conforme perfil do casal.
 * @param {string} perfilCasal - valor salvo no estado (ex: 'noiva-noivo', 'duas-noivas')
 * @returns {Object} termos linguísticos
 */
export function getTermos(perfilCasal) {
  return PERFIL_MAP[perfilCasal] || PERFIL_MAP['nao-especificar'];
}

/**
 * Retorna termo específico ou fallback neutro.
 * @param {string} perfilCasal
 * @param {string} chave - ex: 'casal', 'pessoa1', 'pronome'
 * @returns {string}
 */
export function termo(perfilCasal, chave) {
  const t = getTermos(perfilCasal);
  return t[chave] || t['casal'];
}

/**
 * Adapta uma frase com placeholders.
 * Ex: adaptarFrase('Quem são {casal}?', 'duas-noivas') → 'Quem são as noivas?'
 * @param {string} frase - com placeholders entre {chaves}
 * @param {string} perfilCasal
 * @returns {string}
 */
export function adaptarFrase(frase, perfilCasal) {
  const t = getTermos(perfilCasal);
  return frase.replace(/\{(\w+)\}/g, (_, chave) => t[chave] || `{${chave}}`);
}

export default { getTermos, termo, adaptarFrase };
