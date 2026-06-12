// hooks/useMemorial.js
import { useState, useCallback } from 'react';

const ESTADO_INICIAL = {
  perfilCasal: null,
  modoPlanejamento: null,
  nomePessoa1: '',
  nomePessoa2: '',
  nomeJuntos: '',
  dataEvento: null,
  periodoAno: null,
  cidadeEvento: '',
  estadoEvento: '',
  regiaoEvento: '',
  totalConvidados: null,
  faixaOrcamento: null,
  tipoCerimonia: null,
  tipoLocal: null,
  ceremoniaFestaMesmoLocal: null,
  horarioCasamento: null,
  planoChuva: null,
  estilo: null,
  formalidade: null,
  paleta: [],
  tomsIdentidade: [],
  referenciasVisuais: [],
  flores: null,
  locaisFlores: [],
  tipoFlores: null,
  floricultura: '',
  iluminacao: null,
  velas: null,
  tipoVelas: null,
  mobiliarioEspecial: null,
  tipoMesa: null,
  lounge: null,
  backdrop: null,
  tecidos: null,
  toalha: null,
  loucas: null,
  talheres: null,
  tacas: null,
  centroMesa: null,
  guardanapo: null,
  cartaoLugar: null,
  menuImpresso: null,
  entradaNoivos: null,
  acompanhamento: null,
  musicaCerimonia: null,
  elementosCerimonia: [],
  padrinhos: null,
  criancasCerimonia: null,
  papeisCriancas: [],
  rituaisSimbolicos: [],
  saidaNoivos: null,
  coquetel: null,
  duracaoCoquetel: null,
  tipoJantar: null,
  restricoesAlimentares: [],
  bolo: null,
  saborBolo: '',
  mesaDoces: null,
  bemCasados: null,
  tipoBar: null,
  bartender: null,
  musicaFesta: null,
  estiloMusical: [],
  atividadesEntretenimento: [],
  lembrancinhas: null,
  kitSaida: null,
  itensKitSaida: [],
  formatoConvite: null,
  saveTheDate: null,
  sinalizacaoEvento: [],
  monograma: null,
  fontesIdentidade: [],
  itensDigitais: [],
  estiloVestido: null,
  atelierContratado: null,
  acessorios: [],
  estiloMaquiagem: null,
  estiloCabelo: null,
  profissionalBeleza: null,
  padronizarMadrinhas: null,
  padronizarPadrinhos: null,
  fornecedoresNecessarios: [],
  etapaAtual: 0,
  historicoEtapas: [],
  loginFeito: false,
  memorialConcluido: false,
};

export default function useMemorial() {
  const [estado, setEstado] = useState(ESTADO_INICIAL);

  const setRespostas = useCallback((campo, valor) => {
    setEstado((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === 'cidadeEvento' && valor) {
        next.regiaoEvento = '';
      }
      return next;
    });
  }, []);

  const carregarEstado = useCallback((novoEstado) => {
    setEstado((prev) => {
      // Mescla o estado anterior com o novo, garantindo que arrays e objetos sejam preservados
      return {
        ...prev,
        ...novoEstado,
        // Arrays: se vierem no novoEstado, usa eles; senão mantém os anteriores
        paleta: Array.isArray(novoEstado.paleta) ? novoEstado.paleta : prev.paleta,
        tomsIdentidade: Array.isArray(novoEstado.tomsIdentidade) ? novoEstado.tomsIdentidade : prev.tomsIdentidade,
        referenciasVisuais: Array.isArray(novoEstado.referenciasVisuais) ? novoEstado.referenciasVisuais : prev.referenciasVisuais,
        locaisFlores: Array.isArray(novoEstado.locaisFlores) ? novoEstado.locaisFlores : prev.locaisFlores,
        elementosCerimonia: Array.isArray(novoEstado.elementosCerimonia) ? novoEstado.elementosCerimonia : prev.elementosCerimonia,
        papeisCriancas: Array.isArray(novoEstado.papeisCriancas) ? novoEstado.papeisCriancas : prev.papeisCriancas,
        rituaisSimbolicos: Array.isArray(novoEstado.rituaisSimbolicos) ? novoEstado.rituaisSimbolicos : prev.rituaisSimbolicos,
        estiloMusical: Array.isArray(novoEstado.estiloMusical) ? novoEstado.estiloMusical : prev.estiloMusical,
        atividadesEntretenimento: Array.isArray(novoEstado.atividadesEntretenimento) ? novoEstado.atividadesEntretenimento : prev.atividadesEntretenimento,
        itensKitSaida: Array.isArray(novoEstado.itensKitSaida) ? novoEstado.itensKitSaida : prev.itensKitSaida,
        sinalizacaoEvento: Array.isArray(novoEstado.sinalizacaoEvento) ? novoEstado.sinalizacaoEvento : prev.sinalizacaoEvento,
        fontesIdentidade: Array.isArray(novoEstado.fontesIdentidade) ? novoEstado.fontesIdentidade : prev.fontesIdentidade,
        itensDigitais: Array.isArray(novoEstado.itensDigitais) ? novoEstado.itensDigitais : prev.itensDigitais,
        acessorios: Array.isArray(novoEstado.acessorios) ? novoEstado.acessorios : prev.acessorios,
        fornecedoresNecessarios: Array.isArray(novoEstado.fornecedoresNecessarios) ? novoEstado.fornecedoresNecessarios : prev.fornecedoresNecessarios,
        restricoesAlimentares: Array.isArray(novoEstado.restricoesAlimentares) ? novoEstado.restricoesAlimentares : prev.restricoesAlimentares,
        historicoEtapas: Array.isArray(novoEstado.historicoEtapas) ? novoEstado.historicoEtapas : prev.historicoEtapas,
        // Garante que etapaAtual seja um número válido
        etapaAtual: typeof novoEstado.etapaAtual === 'number' ? novoEstado.etapaAtual : prev.etapaAtual,
      };
    });
  }, []);

  const avancarEtapa = useCallback(() => {
    setEstado((prev) => ({
      ...prev,
      historicoEtapas: [...prev.historicoEtapas, prev.etapaAtual],
      etapaAtual: prev.etapaAtual + 1,
    }));
  }, []);

  const voltarEtapa = useCallback(() => {
    setEstado((prev) => {
      if (prev.historicoEtapas.length === 0) return prev;
      const historico = [...prev.historicoEtapas];
      const etapaAnterior = historico.pop();
      return { ...prev, historicoEtapas: historico, etapaAtual: etapaAnterior };
    });
  }, []);

  const pularEtapa = useCallback(() => {
    setEstado((prev) => ({
      ...prev,
      etapaAtual: prev.etapaAtual + 1,
    }));
  }, []);

  const irParaEtapa = useCallback((indice) => {
    setEstado((prev) => {
      if (indice === prev.etapaAtual) return prev;
      return {
        ...prev,
        historicoEtapas: [...prev.historicoEtapas, prev.etapaAtual],
        etapaAtual: indice,
      };
    });
  }, []);

  const getSugestoes = useCallback((categoria) => {
    return [];
  }, []);

  const resetarMemorial = useCallback(() => {
    setEstado(ESTADO_INICIAL);
  }, []);

  const exportarDados = useCallback(() => {
    const { etapaAtual, etapasTotais, historicoEtapas, loginFeito, memorialConcluido, ...dadosLimpos } = estado;
    return dadosLimpos;
  }, [estado]);

  return {
    estado,
    setRespostas,
    carregarEstado,
    avancarEtapa,
    voltarEtapa,
    pularEtapa,
    irParaEtapa,
    getSugestoes,
    resetarMemorial,
    exportarDados,
  };
}

export { useMemorial };