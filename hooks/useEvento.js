/**
 * Hook de gestão do evento — dados consolidados do casamento
 * @module hooks/useEvento
 */

import { useState, useCallback } from 'react';

export default function useEvento() {
  const [evento, setEvento] = useState({
    nome: '',
    data: null,
    local: null,
    convidados: 0,
    confirmados: 0,
    orcamentoTotal: 0,
    gastoAtual: 0,
    fornecedoresContratados: 0,
    tarefasPendentes: 0,
  });

  const atualizarEvento = useCallback((campo, valor) => {
    setEvento(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const calcularProgresso = useCallback(() => {
    const { tarefasTotal = 1, tarefasConcluidas = 0 } = evento;
    return Math.round((tarefasConcluidas / tarefasTotal) * 100);
  }, [evento]);

  return {
    evento,
    atualizarEvento,
    calcularProgresso,
  };
}

export { useEvento };