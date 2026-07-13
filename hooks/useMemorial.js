import { useState, useEffect, useCallback, useRef } from 'react';

const ESTADO_INICIAL = {
  etapaAtual: 0,
  historicoEtapas: [],
  perfilCasal: '',
  perfil: '',
  modoPlanejamento: '',
  nomeNoiva: '',
  nomeNoivo: '',
  dataCasamento: '',
  cidade: '',
  uf: '',
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
  flores: false,
  locaisFlores: [],
  iluminacao: '',
  velas: false,
  tipoVelas: '',
  mobiliarioEspecial: false,
  backdrop: false,
  tecidos: false,
  toalha: '',
  loucas: '',
  talheres: '',
  tacas: '',
  centroMesa: '',
  guardanapo: '',
  cartaoLugar: false,
  entradaNoivos: '',
  acompanhamento: '',
  musicaCerimonia: '',
  elementosCerimonia: [],
  padrinhos: false,
  papeisCriancas: '',
  rituaisSimbolicos: [],
  saidaNoivos: '',
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
  formatoConvite: '',
  sinalizacaoEvento: false,
  monograma: '',
  fontesIdentidade: [],
  itensDigitais: [],
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
  fornecedoresNecessarios: [],
  aliancasEscolhidas: '',
  civilJunto: '',
  transporteEspecialNoivos: false,
  carroNoivos: '',
  transporteConvidados: '',
  seguranca: false,
  luaDeMel: false,
  destinoLuaDeMel: '',
  fotosLuaDeMel: false,
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
  saveTheDateEnviado: false,
  fotografoLuaDeMel: false,
  transporteNoivosContratado: false,
};

const STORAGE_KEY = 'memorial_estado';
const DEBOUNCE_MS = 500;

export function useMemorial() {
  const [estado, setEstado] = useState(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        try { return { ...ESTADO_INICIAL, ...JSON.parse(salvo) }; }
        catch { return ESTADO_INICIAL; }
      }
    }
    return ESTADO_INICIAL;
  });

  const estadoRef = useRef(estado);
  useEffect(() => { estadoRef.current = estado; }, [estado]);
  const debounceTimerRef = useRef(null);
  const pendingSaveRef = useRef(false);

  const persistir = useCallback(() => {
    if (typeof window === 'undefined') return;
    const dados = estadoRef.current;
    const executar = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); pendingSaveRef.current = false; }
      catch (e) { console.warn('[useMemorial] Falha ao persistir:', e); }
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(executar, { timeout: 2000 });
    } else { requestAnimationFrame(executar); }
  }, []);

  const agendarPersistencia = useCallback(() => {
    pendingSaveRef.current = true;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => persistir(), DEBOUNCE_MS);
  }, [persistir]);

  useEffect(() => {
    agendarPersistencia();
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [estado, agendarPersistencia]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveRef.current && typeof window !== 'undefined') {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoRef.current)); }
        catch (e) { console.warn('[useMemorial] Falha ao flush:', e); }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
      return { ...prev, historicoEtapas: novoHistorico, etapaAtual: etapaAnterior };
    });
  }, []);

  const resetar = useCallback(() => {
    setEstado(ESTADO_INICIAL);
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }, []);

  const estaCompleto = useCallback(() => {
    return !!(estado.perfil && estado.tipoCerimonia && estado.tipoLocal && estado.estilo && estado.paleta && estado.paleta.length > 0);
  }, [estado]);

  return {
    estado, setRespostas, atualizarMultiplo, carregarEstado,
    irParaEtapa, voltarEtapa, resetar, estaCompleto, ESTADO_INICIAL,
  };
}

export default useMemorial;
