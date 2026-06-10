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
  restricoesAlimentares: null,
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

  // NOVA função para carregar um estado completo (draft)
  const carregarEstado = useCallback((novoEstado) => {
    setEstado((prev) => ({
      ...prev,
      ...novoEstado,
      // Garante que os arrays sejam mesclados corretamente, não sobrescritos com undefined
      paleta: novoEstado.paleta || prev.paleta,
      tomsIdentidade: novoEstado.tomsIdentidade || prev.tomsIdentidade,
      referenciasVisuais: novoEstado.referenciasVisuais || prev.referenciasVisuais,
      locaisFlores: novoEstado.locaisFlores || prev.locaisFlores,
      elementosCerimonia: novoEstado.elementosCerimonia || prev.elementosCerimonia,
      papeisCriancas: novoEstado.papeisCriancas || prev.papeisCriancas,
      rituaisSimbolicos: novoEstado.rituaisSimbolicos || prev.rituaisSimbolicos,
      estiloMusical: novoEstado.estiloMusical || prev.estiloMusical,
      atividadesEntretenimento: novoEstado.atividadesEntretenimento || prev.atividadesEntretenimento,
      itensKitSaida: novoEstado.itensKitSaida || prev.itensKitSaida,
      sinalizacaoEvento: novoEstado.sinalizacaoEvento || prev.sinalizacaoEvento,
      fontesIdentidade: novoEstado.fontesIdentidade || prev.fontesIdentidade,
      itensDigitais: novoEstado.itensDigitais || prev.itensDigitais,
      acessorios: novoEstado.acessorios || prev.acessorios,
      fornecedoresNecessarios: novoEstado.fornecedoresNecessarios || prev.fornecedoresNecessarios,
      historicoEtapas: novoEstado.historicoEtapas || prev.historicoEtapas,
    }));
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
    getSugestoes,
    resetarMemorial,
    exportarDados,
  };
}

export { useMemorial };