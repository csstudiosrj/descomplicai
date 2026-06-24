import { useState, useEffect, useCallback } from 'react';

/**
 * Estado inicial completo do memorial — ~110 campos
 * Blocos A-M, incluindo expansão do questionário
 */
const ESTADO_INICIAL = {
  // ─── BLOCO A: Perfil do Casal ───
  perfil: '',                 // A1: noiva+noivo | duas_noivas | dois_noivos | nao_especificado
  modoPlanejamento: '',       // A2: me_guiem | tenho_referencias | ambos
  nomeNoiva: '',
  nomeNoivo: '',
  dataCasamento: '',          // A3
  cidade: '',
  estado: '',
  totalConvidados: 0,         // A5
  dataPrevista: '',           // A6 (mês/ano aproximado)
  criancas: false,            // A4 (terão crianças na festa?)
  padrinhosEscolhidos: false, // A5
  quantosPadrinhos: 0,        // A5

  // ─── BLOCO B: Cerimônia ───
  tipoCerimonia: '',          // B1
  reservouIgreja: false,      // B2 ramificação
  padreEscolhido: false,      // B2 ramificação
  cursoNoivos: false,         // B2 ramificação
  celebranteLaico: false,     // B2 ramificação
  mesmoLocal: false,          // B3
  criancasCerimonia: false,   // B5 (expansão)
  duracaoCerimonia: '',       // B6: 30min | 1h | mais_1h
  musicaCerimoniaViva: '',    // B7: sim | nao | talvez

  // ─── BLOCO C: Local e Estrutura ───
  tipoLocal: '',              // C1
  horarioCasamento: '',       // C2: diurno | por_do_sol | noturno
  planoChuva: false,          // C3
  transporteNoivos: '',       // Step11b
  estacionamento: '',         // C4: sim | nao | valet
  cozinhaApoio: false,        // C5
  capacidadeLocal: 0,         // C6
  geradorLocal: '',           // C7: sim | nao | nao_sei

  // ─── BLOCO D: Identidade Visual ───
  estilo: '',
  formalidade: '',
  paleta: [],
  tom: '',
  referencias: [],

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
  criancasCerimonia: false,   // duplicado intencional — B5 e G3
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
  mesaFrios: false,           // G8 (expansão)
  bebidasPorPessoa: '',       // G9: livre | controlado
  menuInfantil: false,        // G10
  musicaFesta: '',
  estiloMusical: '',
  atividadesEntretenimento: [],
  lembrancinhas: false,
  kitSaida: false,
  itensKitSaida: [],
  fogosSparklers: false,      // H3 (expansão)
  mesaDocesExposta: false,    // H4 (expansão)
  aulaDanca: false,           // H5 (expansão)

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
  aulasDanca: false,          // I4 (expansão)
  mudancaLook: false,         // I5 (expansão)
  quantasMadrinhas: 0,        // I6 (expansão)

  // ─── BLOCO K: Fornecedores ───
  fornecedoresNecessarios: [],

  // ─── BLOCO L: Logística e Documentação ───
  aliancasEscolhidas: '',     // L1: sim | nao | buscando
  civilJunto: '',             // L2: sim | ja_casados | nao
  transporteEspecialNoivos: false, // L3
  carroNoivos: '',            // L4: sim | nao | talvez
  transporteConvidados: '',   // L5: sim | nao | alguns
  seguranca: false,           // L6

  // ─── BLOCO M: Pós-casamento ───
  luaDeMel: false,
  destinoLuaDeMel: '',
  fotosLuaDeMel: false,       // M2 (expansão)
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
    // Verifica campos obrigatórios mínimos
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