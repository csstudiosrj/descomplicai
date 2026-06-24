import { useState, useEffect, useCallback } from 'react';

/**
 * Estado inicial completo do memorial — ~145 campos
 * Blocos A-M, incluindo expansão completa do questionário
 */
const ESTADO_INICIAL = {
  // ─── BLOCO A: Perfil do Casal ───
  perfil: '',
  modoPlanejamento: '',
  nomeNoiva: '',
  nomeNoivo: '',
  dataCasamento: '',
  cidade: '',
  estado: '',
  totalConvidados: 0,
  dataPrevista: '',
  criancas: false,
  padrinhosEscolhidos: false,
  quantosPadrinhos: 0,
  // Expansão A (A7-A16)
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
  // Expansão B (B8-B18)
  reservouIgreja: '',
  cursoNoivos: '',
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
  // Expansão C (C8-C15)
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
  // Expansão D (D1-D23)
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
  criancasCerimonia: false,
  papeisCriancas: '',
  rituaisSimbolicos: [],
  saidaNoivos: '',

  // ─── BLOCO H: Recepção ───
  coquetel: false,
  duracaoCoquetel: '',
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
  lembrancinhas: false,
  kitSaida: false,
  itensKitSaida: [],
  fogosSparklers: false,
  mesaDocesExposta: false,
  aulaDanca: false,

  // ─── BLOCO I: Papelaria e Identidade ───
  formatoConvite: '',
  saveTheDate: false,
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
  // Expansão E (E1-E19)
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
};

/**
 * Hook de gerenciamento do estado do memorial
 * Persiste no localStorage antes do login, Supabase depois
 */
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

  // Autosave no localStorage a cada mudança
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('memorial_estado', JSON.stringify(estado));
    }
  }, [estado]);

  const atualizar = useCallback((campo, valor) => {
    setEstado(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const atualizarMultiplo = useCallback((atualizacoes) => {
    setEstado(prev => ({ ...prev, ...atualizacoes }));
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
      estado.paleta.length > 0
    );
  }, [estado]);

  return {
    estado,
    atualizar,
    atualizarMultiplo,
    resetar,
    estaCompleto,
    ESTADO_INICIAL,
  };
}

export default useMemorial;
