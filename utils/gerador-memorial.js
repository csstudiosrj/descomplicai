// utils/gerador-memorial.js
// Monta o payload completo a partir do estado do memorial para enviar à API de geração.

/**
 * Converte o estado do questionário no objeto esperado pelo endpoint /api/ia/gerar-memorial
 * @param {object} estado - Estado completo do memorial (vindo do useMemorial)
 * @returns {object} payload pronto para POST
 */
export function montarPayloadParaAPI(estado) {
  if (!estado) return {};

  return {
    perfilCasal: estado.perfilCasal || '',
    nomePessoa1: estado.nomePessoa1 || '',
    nomePessoa2: estado.nomePessoa2 || '',
    dataEvento: estado.dataEvento || '',
    cidadeEvento: estado.cidadeEvento || '',
    totalConvidados: estado.totalConvidados || '',
    faixaOrcamento: estado.faixaOrcamento || '',
    tipoCerimonia: estado.tipoCerimonia || '',
    tipoLocal: estado.tipoLocal || '',
    horarioCasamento: estado.horarioCasamento || '',
    estilo: estado.estilo || '',
    formalidade: estado.formalidade || '',
    paleta: estado.paleta || [],
    flores: estado.flores || '',
    iluminacao: estado.iluminacao || '',
    velas: estado.velas || '',
    mobiliarioEspecial: estado.mobiliarioEspecial || '',
    tipoJantar: estado.tipoJantar || '',
    tipoBar: estado.tipoBar || '',
    musicaFesta: estado.musicaFesta || '',
    atividadesEntretenimento: estado.atividadesEntretenimento || [],
    formatoConvite: estado.formatoConvite || '',
    estiloVestido: estado.estiloVestido || '',
  };
}