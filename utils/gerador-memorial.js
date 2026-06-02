/**
 * Monta o objeto final do memorial a partir do estado do questionário
 * @module utils/gerador-memorial
 */

/**
 * Monta o memorial estruturado para envio à API de IA
 * @param {Object} estado — estado completo do memorial
 * @returns {Object}
 */
export function montarMemorial(estado) {
    return {
      perfil: montarPerfil(estado),
      estilo: estado.estilo || 'Não definido',
      paleta: montarPaleta(estado),
      formalidade: estado.formalidade || 'Não definida',
      cerimonia: montarCerimonia(estado),
      local: montarLocal(estado),
      horario: estado.horarioCasamento || 'Não definido',
      convidados: estado.totalConvidados || 'Não definido',
      decoracao: montarDecoracao(estado),
      mesa: montarMesa(estado),
      alimentacao: montarAlimentacao(estado),
      entretenimento: montarEntretenimento(estado),
      vestuario: montarVestuario(estado),
      papelaria: montarPapelaria(estado),
      orcamento: estado.faixaOrcamento || 'Não informado',
    };
  }
  
  function montarPerfil(estado) {
    const partes = [];
    if (estado.nomePessoa1) partes.push(estado.nomePessoa1);
    if (estado.nomePessoa2) partes.push(estado.nomePessoa2);
    if (estado.nomeJuntos) partes.push(`conhecido como ${estado.nomeJuntos}`);
    
    const perfil = partes.length > 0 ? partes.join(' e ') : 'Casal';
    const casamento = estado.perfilCasal === 'duas-noivas' ? 'duas noivas' 
      : estado.perfilCasal === 'dois-noivos' ? 'dois noivos'
      : estado.perfilCasal === 'nao-especificar' ? 'o casal'
      : 'noiva e noivo';
      
    return `${perfil}, ${casamento}, planejando casamento no modo ${estado.modoPlanejamento || 'guiado'}.`;
  }
  
  function montarPaleta(estado) {
    if (!estado.paleta || estado.paleta.length === 0) return 'Não definida';
    return `Paleta de ${estado.paleta.length} cores: ${estado.paleta.join(', ')}${estado.tomsIdentidade?.length ? ` com tons ${estado.tomsIdentidade.join(', ')}` : ''}.`;
  }
  
  function montarCerimonia(estado) {
    const partes = [];
    if (estado.tipoCerimonia) partes.push(`Cerimônia ${estado.tipoCerimonia}`);
    if (estado.tipoLocal) partes.push(`em ${estado.tipoLocal}`);
    if (estado.horarioCasamento) partes.push(`no horário ${estado.horarioCasamento}`);
    if (estado.ceremoniaFestaMesmoLocal === false) partes.push('com transporte entre locais');
    if (estado.planoChuva) partes.push('incluindo plano B para chuva');
    return partes.length > 0 ? partes.join('. ') + '.' : 'Cerimônia não detalhada.';
  }
  
  function montarLocal(estado) {
    const partes = [];
    if (estado.cidadeEvento) partes.push(`Cidade: ${estado.cidadeEvento}`);
    if (estado.estadoEvento) partes.push(`Estado: ${estado.estadoEvento}`);
    if (estado.regiaoEvento) partes.push(`Região: ${estado.regiaoEvento}`);
    if (estado.dataEvento) partes.push(`Data: ${estado.dataEvento}`);
    return partes.length > 0 ? partes.join('. ') + '.' : 'Local não definido.';
  }
  
  function montarDecoracao(estado) {
    const partes = [];
    if (estado.flores) partes.push(`Flores: ${estado.flores}`);
    if (estado.locaisFlores?.length) partes.push(`Locais: ${estado.locaisFlores.join(', ')}`);
    if (estado.iluminacao) partes.push(`Iluminação: ${estado.iluminacao}`);
    if (estado.velas) partes.push(`Velas: ${estado.tipoVelas || 'Sim'}`);
    if (estado.mobiliarioEspecial) partes.push(`Mobiliário especial: ${estado.mobiliarioEspecial}`);
    if (estado.backdrop) partes.push(`Backdrop: ${estado.backdrop}`);
    if (estado.tecidos) partes.push(`Têxteis: ${estado.tecidos}`);
    return partes.length > 0 ? partes.join('. ') + '.' : 'Decoração não detalhada.';
  }
  
  function montarMesa(estado) {
    const partes = [];
    if (estado.toalha) partes.push(`Toalha: ${estado.toalha}`);
    if (estado.loucas) partes.push(`Louças: ${estado.loucas}`);
    if (estado.talheres) partes.push(`Talheres: ${estado.talheres}`);
    if (estado.tacas) partes.push(`Taças: ${estado.tacas}`);
    if (estado.centroMesa) partes.push(`Centro de mesa: ${estado.centroMesa}`);
    if (estado.guardanapo) partes.push(`Guardanapo: ${estado.guardanapo}`);
    if (estado.cartaoLugar) partes.push(`Cartão de lugar: ${estado.cartaoLugar}`);
    if (estado.menuImpresso) partes.push(`Menu impresso: ${estado.menuImpresso}`);
    return partes.length > 0 ? partes.join('. ') + '.' : 'Mesa posta não detalhada.';
  }
  
  function montarAlimentacao(estado) {
    const partes = [];
    if (estado.coquetel) partes.push(`Coquetel: ${estado.duracaoCoquetel || 'Sim'}`);
    if (estado.tipoJantar) partes.push(`Jantar: ${estado.tipoJantar}`);
    if (estado.restricoesAlimentares) partes.push(`Restrições: ${estado.restricoesAlimentares}`);
    if (estado.bolo) partes.push(`Bolo: ${estado.saborBolo || 'Sim'}`);
    if (estado.mesaDoces) partes.push(`Mesa de doces: Sim`);
    if (estado.bemCasados) partes.push(`Bem-casados: Sim`);
    if (estado.tipoBar) partes.push(`Bar: ${estado.tipoBar}`);
    if (estado.bartender) partes.push(`Bartender: Sim`);
    return partes.length > 0 ? partes.join('. ') + '.' : 'Alimentação não detalhada.';
  }
  
  function montarEntretenimento(estado) {
    const partes = [];
    if (estado.musicaFesta) partes.push(`Música: ${estado.musicaFesta}`);
    if (estado.estiloMusical?.length) partes.push(`Estilos: ${estado.estiloMusical.join(', ')}`);
    if (estado.atividadesEntretenimento?.length) partes.push(`Atividades: ${estado.atividadesEntretenimento.join(', ')}`);
    if (estado.lembrancinhas) partes.push(`Lembrancinhas: Sim`);
    if (estado.kitSaida) partes.push(`Kit saída: ${estado.itensKitSaida?.join(', ') || 'Sim'}`);
    return partes.length > 0 ? partes.join('. ') + '.' : 'Entretenimento não detalhado.';
  }
  
  function montarVestuario(estado) {
    const partes = [];
    if (estado.estiloVestido) partes.push(`Estilo do traje: ${estado.estiloVestido}`);
    if (estado.atelierContratado) partes.push(`Atelier: ${estado.atelierContratado}`);
    if (estado.acessorios?.length) partes.push(`Acessórios: ${estado.acessorios.join(', ')}`);
    if (estado.estiloMaquiagem) partes.push(`Maquiagem: ${estado.estiloMaquiagem}`);
    if (estado.estiloCabelo) partes.push(`Cabelo: ${estado.estiloCabelo}`);
    if (estado.profissionalBeleza) partes.push(`Profissional de beleza: Sim`);
    if (estado.padronizarMadrinhas) partes.push(`Madrinhas padronizadas: Sim`);
    if (estado.padronizarPadrinhos) partes.push(`Padrinhos padronizados: Sim`);
    return partes.length > 0 ? partes.join('. ') + '.' : 'Vestuário não detalhado.';
  }
  
  function montarPapelaria(estado) {
    const partes = [];
    if (estado.formatoConvite) partes.push(`Convites: ${estado.formatoConvite}`);
    if (estado.saveTheDate) partes.push(`Save the date: Sim`);
    if (estado.sinalizacaoEvento?.length) partes.push(`Sinalização: ${estado.sinalizacaoEvento.join(', ')}`);
    if (estado.monograma) partes.push(`Monograma: Sim`);
    if (estado.fontesIdentidade?.length) partes.push(`Fontes: ${estado.fontesIdentidade.join(', ')}`);
    if (estado.itensDigitais?.length) partes.push(`Itens digitais: ${estado.itensDigitais.join(', ')}`);
    return partes.length > 0 ? partes.join('. ') + '.' : 'Papelaria não detalhada.';
  }
  
  /**
   * Lista as categorias de fornecedores necessárias com base no estado
   * @param {Object} estado
   * @returns {string[]}
   */
  export function listarFornecedoresNecessarios(estado) {
    const lista = ['Espaço/Cerimonial', 'Fotografia', 'Filmagem'];
  
    if (estado.tipoCerimonia === 'catolica') lista.push('Igreja/Paróquia');
    if (estado.tipoCerimonia === 'evangelica') lista.push('Templo Evangélico');
    if (estado.tipoCerimonia === 'judaica') lista.push('Sinagoga');
    if (estado.tipoCerimonia === 'outra-religiosa') lista.push('Local de culto');
  
    if (estado.flores !== false && estado.flores !== null) lista.push('Floricultura/Decoração');
    if (estado.iluminacao) lista.push('Iluminação');
    if (estado.mobiliarioEspecial) lista.push('Mobiliário/Locação');
  
    lista.push('Buffet/Catering');
  
    if (estado.bolo) lista.push('Bolo');
    if (estado.mesaDoces) lista.push('Mesa de doces');
    if (estado.bemCasados) lista.push('Bem-casados');
    if (estado.tipoBar) lista.push('Bar/Bebidas');
    if (estado.musicaFesta) lista.push('Música/Banda/DJ');
  
    if (estado.estiloVestido) lista.push('Vestido/Traje');
    if (estado.profissionalBeleza) lista.push('Beleza (maquiagem/cabelo)');
    if (estado.formatoConvite) lista.push('Papelaria/Convites');
  
    if (estado.ceremoniaFestaMesmoLocal === false) lista.push('Transporte');
    if (['praia','sitio','jardim','rooftop','haras'].includes(estado.tipoLocal)) {
      lista.push('Plano B / Tenda');
    }
  
    return [...new Set(lista)];
  }