import { useState, useEffect, useCallback } from 'react';

/**
 * Estado inicial completo do memorial — ~145 campos
 * Blocos A-M, incluindo expansão completa do questionário
 */
const ESTADO_INICIAL = {
  // ─── Navegação ───
  etapaAtual: 0,
  historicoEtapas: [],
  perfilCasal: false,

  // ─── BLOCO A: Perfil do Casal ───
  perfil: '',
  modoPlanejamento: '',
  nomeNoiva: '',
  nomeNoivo: '',
  dataCasamento: '',
  cidade: '',
  uf: '',              // ← antes era 'estado', renomeado para evitar conflito com coluna do banco
  totalConvidados: 0,
  dataPrevista: '',
  criancas: false,
  padrinhosEscolhidos: false,
  quantosPadrinhos: 0,
  tempoJuntos: '',
  moramJuntos: '',
  comoSeConheceram: '',
  temFilhos: '',
  temAnimais: '',
  gostamDeFazer: [],
  personalidadeNoivo: '',
  personalidadeNoiva: '',
  tradicaoFamiliar: '',
  restricaoCultural: '',

  // ─── BLOCO B: Cerimônia ───
  tipoCerimonia: '',
  reservouIgreja: false,
  padreEscolhido: false,
  cursoNoivos: false,
  celebranteLaico: false,
  mesmoLocal: false,
  criancasCerimonia: false,
  duracaoCerimonia: '',
  musicaCerimoniaViva: '',
  escolheuPadre: '',
  reservouTemplo: '',
  definiuChupa: '',
  escolheuCelebrante: '',
  agendouCartorio: '',
  padrinhosEscolhidosCerimonia: '',
  definiramEntrada: '',
  musicosCerimonia: '',
  certidaoBatismo: '',

  // ─── BLOCO C: Local e Estrutura ───
  tipoLocal: '',
  horarioCasamento: '',
  planoChuva: false,
  transporteNoivos: '',
  estacionamento: '',
  cozinhaApoio: false,
  capacidadeLocal: 0,
  geradorLocal: '',
  reservouLocalCerimonia: '',
  reservouLocalFesta: '',
  verificouMare: '',
  listaPreliminar: '',
  convidadosForaCidade: 0,
  hotelIndicacao: '',
  horarioFesta: '',
  duracaoCoquetel: '',

  // ─── BLOCO D: Identidade Visual ───
  estilo: '',
  formalidade: '',
  paleta: [],
  tom: '',
  referencias: [],
  tipoFlores: '',
  tipoIluminacao: '',
  mobiliarioQual: '',
  fotografoContratado: '',
  filmagemContratada: '',
  buffetContratado: '',
  decoracaoContratada: '',
  musicaContratada: '',
  espacoContratado: '',
  vestidoContratado: '',
  trajeNoivoContratado: '',
  cerimonialistaContratado: '',
  transporteContratado: '',
  papelariaContratada: '',
  cabineFotos: '',
  drone: '',
  animacaoInfantil: '',
  vestidoComprado: '',
  testeBeleza: '',
  convitesEncomendados: '',
  saveTheDate: '',
  lembrancinhas: '',
  kitSaida: '',

  // ─── BLOCO E: Decoração ───
  flores: false,
  locaisFlores: [],
  iluminacao: '',
  velas: false,
  tipoVelas: '',
  mobiliarioEspecial: false,
  backdrop: false,
  tecidos: false,

  // ─── BLOCO F: Mesa Posta ───
  toalha: '',
  loucas: '',
  talheres: '',
  tacas: '',
  centroMesa: '',
  guardanapo: '',
  cartaoLugar: false,

  // ─── BLOCO G: Cerimônia Detalhada ───
  entradaNoivos: '',
  acompanhamento: '',
  musicaCerimonia: '',
  elementosCerimonia: [],
  padrinhos: false,
  papeisCriancas: '',
  rituaisSimbolicos: [],
  saidaNoivos: '',

  // ─── BLOCO H: Recepção ───
  coquetel: false,
  tipoJantar: '',
  restricoesAlimentares: [],
  bolo: '',
  saborBolo: '',
  mesaDoces: false,
  bemCasados: false,
  tipoBar: '',
  bartender: false,
  mesaFrios: false,
  bebidasPorPessoa: '',
  menuInfantil: false,
  musicaFesta: '',
  estiloMusical: '',
  atividadesEntretenimento: [],
  itensKitSaida: [],
  fogosSparklers: false,
  mesaDocesExposta: false,
  aulaDanca: false,

  // ─── BLOCO I: Papelaria e Identidade ───
  formatoConvite: '',
  sinalizacaoEvento: false,
  monograma: '',
  fontesIdentidade: [],
  itensDigitais: [],

  // ─── BLOCO J: Vestuário e Beleza ───
  estiloVestido: '',
  atelierContratado: false,
  acessorios: [],
  estiloMaquiagem: '',
  estiloCabelo: '',
  profissionalBeleza: false,
  padronizarMadrinhas: '',
  padronizarPadrinhos: '',
  aulasDanca: false,
  mudancaLook: false,
  quantasMadrinhas: 0,

  // ─── BLOCO K: Fornecedores ───
  fornecedoresNecessarios: [],

  // ─── BLOCO L: Logística e Documentação ───
  aliancasEscolhidas: '',
  civilJunto: '',
  transporteEspecialNoivos: false,
  carroNoivos: '',
  transporteConvidados: '',
  seguranca: false,

  // ─── BLOCO M: Pós-casamento ───
  luaDeMel: false,
  destinoLuaDeMel: '',
  fotosLuaDeMel: false,
  // Expansão N (E1-E19)
  estadoCivilNoivo: '',
  estadoCivilNoiva: '',
  certidaoDivorcioNoivo: '',
  certidaoDivorcioNoiva: '',
  certidaoObitoNoivo: '',
  certidaoObitoNoiva: '',
  nacionalidadeNoivo: '',
  nacionalidadeNoiva: '',
  documentacaoEstrangeiro: '',
  quemPaga: '',
  formaPagamento: '',
  cronogramaDia: '',
  horarioMakingOfNoiva: '',
  horarioMakingOfNoivo: '',
  luaDeMelReservada: '',
  passaporteValido: '',
  visto: '',
  vacinas: '',
  // Campos adicionados para consistência com gerador-tarefas.js
  saveTheDateEnviado: false,
  fotografoLuaDeMel: false,
  transporteNoivosContratado: false,
};

export function useMemorial() {
  const [estado, setEstado] = useState(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('memorial_estado');
      if (salvo) {
        try {
          return { ...ESTADO_INICIAL, ...JSON.parse(salvo) };
        } catch {
          return ESTADO_INICIAL;
        }
      }
    }
    return ESTADO_INICIAL;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('memorial_estado', JSON.stringify(estado));
    }
  }, [estado]);

  const setRespostas = useCallback((campo, valor) => {
    setEstado(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const atualizarMultiplo = useCallback((atualizacoes) => {
    setEstado(prev => ({ ...prev, ...atualizacoes }));
  }, []);

  const carregarEstado = useCallback((novoEstado) => {
    setEstado(prev => ({ ...prev, ...novoEstado }));
  }, []);

  const irParaEtapa = useCallback((indice) => {
    setEstado(prev => ({
      ...prev,
      historicoEtapas: [...prev.historicoEtapas, prev.etapaAtual],
      etapaAtual: indice,
    }));
  }, []);

  const voltarEtapa = useCallback(() => {
    setEstado(prev => {
      if (!prev.historicoEtapas || prev.historicoEtapas.length === 0) return prev;
      const novoHistorico = [...prev.historicoEtapas];
      const etapaAnterior = novoHistorico.pop();
      return {
        ...prev,
        historicoEtapas: novoHistorico,
        etapaAtual: etapaAnterior,
      };
    });
  }, []);

  const resetar = useCallback(() => {
    setEstado(ESTADO_INICIAL);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('memorial_estado');
    }
  }, []);

  const estaCompleto = useCallback(() => {
    return !!(
      estado.perfil &&
      estado.tipoCerimonia &&
      estado.tipoLocal &&
      estado.estilo &&
      estado.paleta && estado.paleta.length > 0
    );
  }, [estado]);

  return {
    estado,
    setRespostas,
    atualizarMultiplo,
    carregarEstado,
    irParaEtapa,
    voltarEtapa,
    resetar,
    estaCompleto,
    ESTADO_INICIAL,
  };
}

export default useMemorial;