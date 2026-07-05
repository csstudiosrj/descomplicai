/**
 * utils/fornecedores-inteligente.js
 * Função pura que analisa o estado do memorial e retorna a lista completa
 * de fornecedores com status (contratado | pendente | omitido).
 * 
 * Usada por:
 * - Step60Fornecedores.jsx (preview de pendentes)
 * - PDF/memorial (lista completa via montarPayloadMemorial)
 * - Painel de controle (lista completa salva no estado)
 */

/**
 * Normaliza respostas de contratação para um status padronizado
 */
function normalizarStatus(valor) {
    if (valor === undefined || valor === null || valor === '') return 'pendente';
  
    const str = String(valor).toLowerCase().trim();
  
    const contratado = [
      'sim', 's', 'yes', 'true', 'ja', 'já', 'ja_contratei', 'já contratei',
      'contratado', 'contratada', 'reservado', 'reservada', 'escolhido', 'escolhida',
      'encomendado', 'encomendada', 'comprado', 'comprada', 'definido', 'definida',
      'agendado', 'agendada', 'confirmado', 'confirmada', 'pago', 'paga',
    ];
  
    const naoPrecisa = [
      'nao', 'não', 'no', 'false', 'nao_preciso', 'não preciso', 'nao_quero',
      'não quero', 'nao_terei', 'não terei', 'sem', 'dispensar', 'dispensado',
      'nao_sei', 'não sei', 'talvez', 'depois', 'ainda_nao', 'ainda não',
    ];
  
    if (contratado.includes(str) || valor === true) return 'contratado';
    if (naoPrecisa.includes(str) || valor === false) return 'omitido';
  
    return 'pendente';
  }
  
  /**
   * Verifica se um valor indica que o casal já contratou/reservou algo
   */
  function jaContratou(valor) {
    return normalizarStatus(valor) === 'contratado';
  }
  
  /**
   * Verifica se o casal disse explicitamente que não precisa
   */
  function naoPrecisa(valor) {
    return normalizarStatus(valor) === 'omitido';
  }
  
  /**
   * Gera a lista completa de fornecedores com base nas respostas do memorial
   * @param {Object} estado - Estado completo do memorial
   * @returns {Array<{categoria: string, nome: string, status: 'contratado' | 'pendente' | 'omitido'}>}
   */
  export function gerarFornecedoresNecessarios(estado) {
    const e = estado || {};
    const fornecedores = [];
  
    // ─── Fotografia ───
    const fotografoStatus = normalizarStatus(e.fotografoContratado);
    if (fotografoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Fotografia', nome: 'Fotógrafo(a)', status: fotografoStatus });
    }
    const cabineStatus = normalizarStatus(e.cabineFotos);
    if (cabineStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Fotografia', nome: 'Cabine de fotos / Totem', status: cabineStatus });
    }
    const droneStatus = normalizarStatus(e.drone);
    if (droneStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Fotografia', nome: 'Filmagem com drone', status: droneStatus });
    }
  
    // ─── Filmagem ───
    const filmagemStatus = normalizarStatus(e.filmagemContratada);
    if (filmagemStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Filmagem', nome: 'Filmagem / Vídeo do casamento', status: filmagemStatus });
    }
  
    // ─── Espaço / Local ───
    const espacoStatus = normalizarStatus(e.espacoContratado);
    if (espacoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Espaço / Local do evento', status: espacoStatus });
    }
    // Se reservou igreja/templo/local separadamente
    const igrejaStatus = normalizarStatus(e.reservouIgreja);
    if (igrejaStatus !== 'omitido' && e.tipoCerimonia === 'catolica') {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Reserva da igreja', status: igrejaStatus });
    }
    const temploStatus = normalizarStatus(e.reservouTemplo);
    if (temploStatus !== 'omitido' && e.tipoCerimonia === 'judaica') {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Reserva do templo', status: temploStatus });
    }
    const localCerimStatus = normalizarStatus(e.reservouLocalCerimonia);
    if (localCerimStatus !== 'omitido' && !e.mesmoLocal) {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Local da cerimônia', status: localCerimStatus });
    }
    const localFestaStatus = normalizarStatus(e.reservouLocalFesta);
    if (localFestaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Local da festa', status: localFestaStatus });
    }
    const estacionamentoStatus = normalizarStatus(e.estacionamento);
    if (estacionamentoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Estacionamento / Manobrista', status: estacionamentoStatus });
    }
    const cozinhaStatus = normalizarStatus(e.cozinhaApoio);
    if (cozinhaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Cozinha de apoio / Equipe de limpeza', status: cozinhaStatus });
    }
    const geradorStatus = normalizarStatus(e.geradorLocal);
    if (geradorStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Espaço/Local', nome: 'Gerador / Nobreak', status: geradorStatus });
    }
  
    // ─── Buffet / Catering ───
    const buffetStatus = normalizarStatus(e.buffetContratado);
    if (buffetStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Buffet/Catering', nome: 'Buffet / Catering', status: buffetStatus });
    }
    const menuInfantilStatus = normalizarStatus(e.menuInfantil);
    if (menuInfantilStatus !== 'omitido' && e.criancas) {
      fornecedores.push({ categoria: 'Buffet/Catering', nome: 'Menu infantil', status: menuInfantilStatus });
    }
  
    // ─── Bolo / Doces ───
    const boloStatus = normalizarStatus(e.bolo);
    if (boloStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Bolo/Doces', nome: 'Bolo dos noivos', status: boloStatus });
    }
    const mesaDocesStatus = normalizarStatus(e.mesaDoces);
    if (mesaDocesStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Bolo/Doces', nome: 'Mesa de doces', status: mesaDocesStatus });
    }
    const mesaDocesExpostaStatus = normalizarStatus(e.mesaDocesExposta);
    if (mesaDocesExpostaStatus !== 'omitido' && e.mesaDoces) {
      fornecedores.push({ categoria: 'Bolo/Doces', nome: 'Exposição / Montagem mesa de doces', status: mesaDocesExpostaStatus });
    }
    const bemCasadosStatus = normalizarStatus(e.bemCasados);
    if (bemCasadosStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Bolo/Doces', nome: 'Bem-casados', status: bemCasadosStatus });
    }
  
    // ─── Bar ───
    const barStatus = normalizarStatus(e.tipoBar);
    if (barStatus !== 'omitido' && e.tipoBar !== 'sem_bar' && e.tipoBar !== 'nao') {
      const isContratado = jaContratou(e.tipoBar) || e.tipoBar === 'open_bar' || e.tipoBar === 'premium';
      fornecedores.push({
        categoria: 'Bar',
        nome: 'Bar / Open bar',
        status: isContratado ? 'contratado' : 'pendente',
      });
    }
    const bartenderStatus = normalizarStatus(e.bartender);
    if (bartenderStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Bar', nome: 'Bartender / Drinks especiais', status: bartenderStatus });
    }
  
    // ─── Mesa de frios ───
    const mesaFriosStatus = normalizarStatus(e.mesaFrios);
    if (mesaFriosStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Buffet/Catering', nome: 'Mesa de frios / Entradas', status: mesaFriosStatus });
    }
  
    // ─── Decoração ───
    const decoracaoStatus = normalizarStatus(e.decoracaoContratada);
    if (decoracaoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Decoração', nome: 'Decoração / Cenografia', status: decoracaoStatus });
    }
    if (e.flores) {
      const floresStatus = jaContratou(e.locaisFlores) ? 'contratado' : 'pendente';
      fornecedores.push({ categoria: 'Decoração', nome: 'Flores / Arranjos', status: floresStatus });
    }
    const iluminacaoStatus = normalizarStatus(e.iluminacao);
    if (iluminacaoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Decoração', nome: 'Iluminação cênica', status: iluminacaoStatus });
    }
    if (e.velas) {
      fornecedores.push({ categoria: 'Decoração', nome: 'Velas / Luminárias', status: 'pendente' });
    }
    const mobiliarioStatus = normalizarStatus(e.mobiliarioEspecial);
    if (mobiliarioStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Decoração', nome: 'Mobiliário especial', status: mobiliarioStatus });
    }
    const backdropStatus = normalizarStatus(e.backdrop);
    if (backdropStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Decoração', nome: 'Backdrop / Painel', status: backdropStatus });
    }
    if (e.tecidos) {
      fornecedores.push({ categoria: 'Decoração', nome: 'Tecidos / Cortinas', status: 'pendente' });
    }
  
    // ─── Música / Entretenimento ───
    const musicaStatus = normalizarStatus(e.musicaContratada);
    if (musicaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Música/Entretenimento', nome: 'Banda / DJ / Música ao vivo', status: musicaStatus });
    }
    const musicaCerimStatus = normalizarStatus(e.musicaCerimoniaViva);
    if (musicaCerimStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Música/Entretenimento', nome: 'Música da cerimônia', status: musicaCerimStatus });
    }
    const aulaDancaStatus = normalizarStatus(e.aulaDanca || e.aulasDanca);
    if (aulaDancaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Música/Entretenimento', nome: 'Aula de dança dos noivos', status: aulaDancaStatus });
    }
    const animacaoStatus = normalizarStatus(e.animacaoInfantil);
    if (animacaoStatus !== 'omitido' && e.criancas) {
      fornecedores.push({ categoria: 'Música/Entretenimento', nome: 'Animação / Recreação infantil', status: animacaoStatus });
    }
    const entretenimentoStatus = normalizarStatus(e.atividadesEntretenimento);
    if (entretenimentoStatus !== 'omitido' && Array.isArray(e.atividadesEntretenimento) && e.atividadesEntretenimento.length > 0) {
      fornecedores.push({ categoria: 'Música/Entretenimento', nome: 'Atividades extras de entretenimento', status: 'pendente' });
    }
  
    // ─── Vestuário ───
    const vestidoStatus = normalizarStatus(e.vestidoContratado);
    if (vestidoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Vestuário', nome: 'Vestido da noiva', status: vestidoStatus });
    }
    const vestidoCompradoStatus = normalizarStatus(e.vestidoComprado);
    if (vestidoCompradoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Vestuário', nome: 'Vestido / Ateliê', status: vestidoCompradoStatus });
    }
    const trajeNoivoStatus = normalizarStatus(e.trajeNoivoContratado);
    if (trajeNoivoStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Vestuário', nome: 'Traje do noivo', status: trajeNoivoStatus });
    }
    if (e.padronizarMadrinhas || e.quantasMadrinhas) {
      fornecedores.push({ categoria: 'Vestuário', nome: 'Vestidos das madrinhas', status: 'pendente' });
    }
    if (e.padronizarPadrinhos) {
      fornecedores.push({ categoria: 'Vestuário', nome: 'Trajes dos padrinhos', status: 'pendente' });
    }
    const acessoriosStatus = normalizarStatus(e.acessorios);
    if (acessoriosStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Vestuário', nome: 'Acessórios (véu, grinalda, joias)', status: acessoriosStatus });
    }
    const mudancaLookStatus = normalizarStatus(e.mudancaLook);
    if (mudancaLookStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Vestuário', nome: 'Mudança de look / Segundo vestido', status: mudancaLookStatus });
    }
  
    // ─── Beleza ───
    const belezaStatus = normalizarStatus(e.profissionalBeleza);
    if (belezaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Beleza', nome: 'Maquiagem e cabelo', status: belezaStatus });
    }
    const testeBelezaStatus = normalizarStatus(e.testeBeleza);
    if (testeBelezaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Beleza', nome: 'Teste de beleza / Ensaio', status: testeBelezaStatus });
    }
  
    // ─── Cerimonialista ───
    const cerimonialistaStatus = normalizarStatus(e.cerimonialistaContratado);
    if (cerimonialistaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Cerimonialista', nome: 'Cerimonialista / Assessoria', status: cerimonialistaStatus });
    }
  
    // ─── Transporte ───
    const transporteStatus = normalizarStatus(e.transporteContratado);
    if (transporteStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Transporte', nome: 'Transporte dos noivos', status: transporteStatus });
    }
    const transporteEspStatus = normalizarStatus(e.transporteEspecialNoivos);
    if (transporteEspStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Transporte', nome: 'Carro especial / Limousine', status: transporteEspStatus });
    }
    const carroNoivosStatus = normalizarStatus(e.carroNoivos);
    if (carroNoivosStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Transporte', nome: 'Carro dos noivos', status: carroNoivosStatus });
    }
    const transporteConvidadosStatus = normalizarStatus(e.transporteConvidados);
    if (transporteConvidadosStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Transporte', nome: 'Transporte dos convidados', status: transporteConvidadosStatus });
    }
  
    // ─── Papelaria / Identidade Visual ───
    const papelariaStatus = normalizarStatus(e.papelariaContratada);
    if (papelariaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Papelaria/Identidade Visual', nome: 'Identidade visual / Papelaria', status: papelariaStatus });
    }
    const convitesStatus = normalizarStatus(e.convitesEncomendados || e.formatoConvite);
    if (convitesStatus !== 'omitido' && e.formatoConvite && e.formatoConvite !== 'nao') {
      fornecedores.push({ categoria: 'Papelaria/Identidade Visual', nome: 'Convites', status: convitesStatus });
    }
    const saveTheDateStatus = normalizarStatus(e.saveTheDate);
    if (saveTheDateStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Papelaria/Identidade Visual', nome: 'Save the date', status: saveTheDateStatus });
    }
    const lembrancinhasStatus = normalizarStatus(e.lembrancinhas);
    if (lembrancinhasStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Papelaria/Identidade Visual', nome: 'Lembrancinhas', status: lembrancinhasStatus });
    }
    const kitSaidaStatus = normalizarStatus(e.kitSaida);
    if (kitSaidaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Papelaria/Identidade Visual', nome: 'Kit de saída', status: kitSaidaStatus });
    }
    if (e.monograma) {
      fornecedores.push({ categoria: 'Papelaria/Identidade Visual', nome: 'Monograma / Brasão', status: 'pendente' });
    }
    if (e.sinalizacaoEvento) {
      fornecedores.push({ categoria: 'Papelaria/Identidade Visual', nome: 'Sinalização do evento', status: 'pendente' });
    }
  
    // ─── Segurança ───
    const segurancaStatus = normalizarStatus(e.seguranca);
    if (segurancaStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Segurança', nome: 'Segurança / Portaria', status: segurancaStatus });
    }
  
    // ─── Fogos / Sparklers ───
    const fogosStatus = normalizarStatus(e.fogosSparklers);
    if (fogosStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Entretenimento', nome: 'Fogos de artifício / Sparklers', status: fogosStatus });
    }
  
    // ─── Lua de Mel ───
    const luaDeMelStatus = normalizarStatus(e.luaDeMel);
    if (luaDeMelStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Lua de Mel', nome: 'Lua de mel / Viagem', status: luaDeMelStatus });
    }
    const luaDeMelReservadaStatus = normalizarStatus(e.luaDeMelReservada);
    if (luaDeMelReservadaStatus !== 'omitido' && e.luaDeMel) {
      fornecedores.push({ categoria: 'Lua de Mel', nome: 'Reserva de hotel / passagens', status: luaDeMelReservadaStatus });
    }
    const passaporteStatus = normalizarStatus(e.passaporteValido);
    if (passaporteStatus !== 'omitido' && e.luaDeMel) {
      fornecedores.push({ categoria: 'Lua de Mel', nome: 'Documentação / Passaporte', status: passaporteStatus });
    }
    const vistoStatus = normalizarStatus(e.visto);
    if (vistoStatus !== 'omitido' && e.luaDeMel) {
      fornecedores.push({ categoria: 'Lua de Mel', nome: 'Visto / Documentação de viagem', status: vistoStatus });
    }
    const vacinasStatus = normalizarStatus(e.vacinas);
    if (vacinasStatus !== 'omitido' && e.luaDeMel) {
      fornecedores.push({ categoria: 'Lua de Mel', nome: 'Vacinas / Saúde para viagem', status: vacinasStatus });
    }
    const fotosLuaDeMelStatus = normalizarStatus(e.fotosLuaDeMel);
    if (fotosLuaDeMelStatus !== 'omitido' && e.luaDeMel) {
      fornecedores.push({ categoria: 'Lua de Mel', nome: 'Ensaio fotográfico na lua de mel', status: fotosLuaDeMelStatus });
    }
  
    // ─── Alianças ───
    const aliancasStatus = normalizarStatus(e.aliancasEscolhidas || e.aliancas);
    if (aliancasStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Joalheria', nome: 'Alianças', status: aliancasStatus });
    }
  
    // ─── Civil ───
    if (e.civilJunto === 'sim' || e.civilJunto === true) {
      fornecedores.push({ categoria: 'Documentação', nome: 'Cartório / Casamento civil', status: 'pendente' });
    }
  
    // ─── Celebrante / Padre / Rabino ───
    if (e.tipoCerimonia === 'catolica') {
      const padreStatus = normalizarStatus(e.padreEscolhido);
      if (padreStatus !== 'omitido') {
        fornecedores.push({ categoria: 'Cerimônia', nome: 'Padre / Celebrante', status: padreStatus });
      }
    }
    if (e.tipoCerimonia === 'judaica') {
      const chupaStatus = normalizarStatus(e.definiuChupa);
      if (chupaStatus !== 'omitido') {
        fornecedores.push({ categoria: 'Cerimônia', nome: 'Montagem da chuppah', status: chupaStatus });
      }
    }
    if (e.tipoCerimonia === 'simbolica' || e.tipoCerimonia === 'laica') {
      const celebranteStatus = normalizarStatus(e.celebranteLaico || e.escolheuCelebrante);
      if (celebranteStatus !== 'omitido') {
        fornecedores.push({ categoria: 'Cerimônia', nome: 'Celebrante / Oficiante', status: celebranteStatus });
      }
    }
  
    // ─── Documentação ───
    if (e.estadoCivilNoivo === 'divorciado' || e.estadoCivilNoiva === 'divorciado') {
      fornecedores.push({ categoria: 'Documentação', nome: 'Certidão de divórcio', status: 'pendente' });
    }
    if (e.estadoCivilNoivo === 'viuvo' || e.estadoCivilNoiva === 'viuvo') {
      fornecedores.push({ categoria: 'Documentação', nome: 'Certidão de óbito do cônjuge anterior', status: 'pendente' });
    }
    if (e.nacionalidadeNoivo === 'estrangeiro' || e.nacionalidadeNoiva === 'estrangeiro') {
      fornecedores.push({ categoria: 'Documentação', nome: 'Documentação para estrangeiro', status: 'pendente' });
    }
    if (e.tipoCerimonia === 'catolica') {
      const certidaoBatismoStatus = normalizarStatus(e.certidaoBatismo);
      if (certidaoBatismoStatus !== 'omitido') {
        fornecedores.push({ categoria: 'Documentação', nome: 'Certidão de batismo', status: certidaoBatismoStatus });
      }
    }
  
    // ─── Hotel / Hospedagem ───
    const hotelStatus = normalizarStatus(e.hotelIndicacao);
    if (hotelStatus !== 'omitido') {
      fornecedores.push({ categoria: 'Hospedagem', nome: 'Hotel / Hospedagem para convidados', status: hotelStatus });
    }
  
    // ─── Lista de convidados ───
    if (e.listaPreliminar) {
      fornecedores.push({ categoria: 'Planejamento', nome: 'Lista de convidados / RSVP', status: 'pendente' });
    }
  
    return fornecedores;
  }
  
  export default gerarFornecedoresNecessarios;