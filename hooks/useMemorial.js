/**
 * Hook central que gerencia todo o estado do questionário do memorial
 * @module hooks/useMemorial
 * @dependencies React, useAutoSave (a ser criado), algoritmo.js, sugestoes.js
 */

import { useState, useCallback, useEffect } from 'react';

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
  etapasTotais: 0,
  historicoEtapas: [],
  loginFeito: false,
  memorialConcluido: false,
};

export default function useMemorial() {
  const [estado, setEstado] = useState(() => {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem('descomplicai-memorial-draft');
      if (draft) {
        try {
          return { ...ESTADO_INICIAL, ...JSON.parse(draft) };
        } catch {
          return ESTADO_INICIAL;
        }
      }
    }
    return ESTADO_INICIAL;
  });

  const setRespostas = useCallback((campo, valor) => {
    setEstado((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === 'cidadeEvento' && valor) {
        // Inferir região pela cidade — placeholder para integração futura com IBGE
        next.regiaoEvento = '';
      }
      return next;
    });
  }, []);

  const avancarEtapa = useCallback(() => {
    setEstado((prev) => {
      const historico = [...prev.historicoEtapas, prev.etapaAtual];
      return { ...prev, historicoEtapas: historico, etapaAtual: prev.etapaAtual + 1 };
    });
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
    // Integração com sugestoes.js — placeholder para importação futura
    return [];
  }, []);

  const resetarMemorial = useCallback(() => {
    setEstado(ESTADO_INICIAL);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('descomplicai-memorial-draft');
    }
  }, []);

  const exportarDados = useCallback(() => {
    const { etapaAtual, etapasTotais, historicoEtapas, loginFeito, memorialConcluido, ...dadosLimpos } = estado;
    return dadosLimpos;
  }, [estado]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('descomplicai-memorial-draft', JSON.stringify(estado));
    }
  }, [estado]);

  return {
    estado,
    setRespostas,
    avancarEtapa,
    voltarEtapa,
    pularEtapa,
    getSugestoes,
    resetarMemorial,
    exportarDados,
  };
}

export { useMemorial };