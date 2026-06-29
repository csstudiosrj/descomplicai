import { useState, useEffect, useCallback, useRef } from 'react';

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

// Chave usada no localStorage
const STORAGE_KEY = 'memorial_estado';

// Tempo de debounce para persistência (ms)
const DEBOUNCE_MS = 500;

/**
 * Hook otimizado para gerenciar o estado do memorial.
 *
 * Otimizações de performance aplicadas:
 * 1. Debounced write: a serialização no localStorage só ocorre após
 *    DEBOUNCE_MS sem novas alterações, eliminando o lag caractere-a-caractere.
 * 2. requestIdleCallback: quando suportado, a serialização é adiada para
 *    quando o browser está ocioso, não bloqueando a thread principal.
 * 3. beforeunload handler: garante flush síncrono imediato antes do usuário
 *    sair da página, evitando perda de dados.
 */
export function useMemorial() {
  const [estado, setEstado] = useState(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem(STORAGE_KEY);
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

  // Ref para armazenar o estado mais recente sem causar re-render
  const estadoRef = useRef(estado);
  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  // Ref para o timer de debounce
  const debounceTimerRef = useRef(null);

  // Ref para rastrear se houve mudança pendente não persistida
  const pendingSaveRef = useRef(false);

  /**
   * Função que executa a persistência real no localStorage.
   * Usa requestIdleCallback quando disponível; caso contrário, executa diretamente.
   */
  const persistir = useCallback(() => {
    if (typeof window === 'undefined') return;

    const dados = estadoRef.current;

    const executar = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        pendingSaveRef.current = false;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[useMemorial] Falha ao persistir no localStorage:', e);
      }
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(executar, { timeout: 2000 });
    } else {
      // Fallback: adia para o próximo frame livre
      requestAnimationFrame(executar);
    }
  }, []);

  /**
   * Agenda a persistência com debounce.
   * Cancela timer anterior e agenda novo após DEBOUNCE_MS.
   */
  const agendarPersistencia = useCallback(() => {
    pendingSaveRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      persistir();
    }, DEBOUNCE_MS);
  }, [persistir]);

  // Efeito principal: observa mudanças no estado e agenda persistência debounced
  useEffect(() => {
    agendarPersistencia();

    // Cleanup: se o componente desmontar, cancela o timer pendente
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [estado, agendarPersistencia]);

  // Handler beforeunload: garante flush síncrono imediato antes de sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveRef.current && typeof window !== 'undefined') {
        // Cancela debounce pendente
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        // Flush síncrono imediato
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoRef.current));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[useMemorial] Falha ao flush síncrono:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
      localStorage.removeItem(STORAGE_KEY);
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
