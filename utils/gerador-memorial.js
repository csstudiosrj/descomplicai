// utils/gerador-memorial.js
// Monta o payload para a API e fornece lógica de fornecedores necessários.

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

// Função que o Step60 precisa para listar os fornecedores com base no estado.
export function listarFornecedoresNecessarios(estado) {
  if (!estado) return [];
  const lista = [];
  const adicionar = (categoria, nome) => {
    if (!lista.find((f) => f.nome === nome)) lista.push({ categoria, nome });
  };

  adicionar('Fotografia', 'Fotógrafo');
  adicionar('Buffet', 'Buffet');
  adicionar('Espaço', 'Espaço / Venue');

  if (estado.tipoCerimonia === 'religiosa-catolica' || estado.tipoCerimonia === 'religiosa-evangelica' || estado.tipoCerimonia === 'religiosa-judaica')
    adicionar('Oficializante', 'Oficializante');
  if (estado.tipoCerimonia === 'simbolica') adicionar('Celebrante', 'Celebrante laico');
  if (estado.flores) adicionar('Decoração', 'Floricultura / Decoração');
  if (estado.musicaFesta === 'dj') adicionar('Música', 'DJ');
  if (estado.musicaFesta === 'banda') adicionar('Música', 'Banda');
  if (estado.tipoLocal && ['praia', 'sitio', 'jardim', 'rooftop', 'haras'].includes(estado.tipoLocal)) {
    adicionar('Infraestrutura', 'Iluminação cênica');
    adicionar('Infraestrutura', 'Som profissional');
  }
  if (estado.totalConvidados === 'grande' || estado.totalConvidados === 'mega') {
    adicionar('Segurança', 'Segurança');
    adicionar('Transporte', 'Transporte');
  }
  if (estado.atividadesEntretenimento?.includes('cabine-fotos')) adicionar('Entretenimento', 'Cabine de fotos');
  if (estado.atividadesEntretenimento?.includes('drone')) adicionar('Filmagem', 'Drone');
  if (estado.estiloVestido) adicionar('Moda', 'Atelier / Vestido');
  if (estado.formatoConvite === 'fisico') adicionar('Papelaria', 'Gráfica / Papelaria');
  if (estado.tipoJantar === 'empratado') adicionar('Alimentação', 'Louças e talheres especiais');

  return lista;
}