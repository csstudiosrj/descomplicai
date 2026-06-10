// hooks/useEtapaInterna.js
// Hook reutilizável para componentes com múltiplas sub-etapas baseadas em respostas.
// Retorna a etapa atual (índice) e funções para navegar.

import { useState, useCallback } from 'react';

/**
 * @param {object} estadoAtual — estado completo do memorial
 * @param {string[]} chaves — lista de chaves de estado na ordem das sub-etapas.
 *   Ex: ['flores', 'iluminacao', 'velas', 'mobiliarioEspecial']
 * @returns {{ etapa: number, avancar: function, voltar: function }}
 */
export default function useEtapaInterna(estadoAtual, chaves = []) {
  // Determina a etapa inicial: primeira chave que ainda não foi respondida.
  const etapaInicial = chaves.findIndex((chave) => {
    const valor = estadoAtual?.[chave];
    // Se o valor for null ou undefined, significa que ainda não foi respondido.
    return valor === null || valor === undefined;
  });

  // Se todas foram respondidas, assume a última etapa.
  const indiceInicial = etapaInicial === -1 ? chaves.length - 1 : etapaInicial;

  const [etapa, setEtapa] = useState(indiceInicial);

  const avancar = useCallback(() => {
    setEtapa((prev) => Math.min(prev + 1, chaves.length - 1));
  }, [chaves.length]);

  const voltar = useCallback(() => {
    setEtapa((prev) => Math.max(prev - 1, 0));
  }, []);

  return { etapa, avancar, voltar };
}