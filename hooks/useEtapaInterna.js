// hooks/useEtapaInterna.js
import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'descomplicai-etapa-';

/**
 * Hook reutilizável para componentes com múltiplas sub-etapas.
 * Agora persiste a etapa no localStorage automaticamente.
 *
 * @param {object} estadoAtual — estado completo do memorial
 * @param {string[]} chaves — lista de chaves na ordem das sub-etapas
 * @param {string} blocoId — identificador único do bloco (ex: 'G', 'H')
 * @returns {{ etapa: number, avancar: function }}
 */
export default function useEtapaInterna(estadoAtual, chaves = [], blocoId = '') {
  const storageKey = `${STORAGE_PREFIX}${blocoId}`;

  // Determina a etapa inicial:
  // 1. Tenta recuperar do localStorage
  // 2. Caso contrário, calcula a partir do estado (primeira chave não respondida)
  const etapaInicial = (() => {
    if (typeof window !== 'undefined') {
      const salva = localStorage.getItem(storageKey);
      if (salva !== null) {
        const indice = parseInt(salva, 10);
        if (!isNaN(indice) && indice >= 0 && indice < chaves.length) {
          return indice;
        }
      }
    }
    // Fallback: primeira chave com valor nulo/undefined
    const indice = chaves.findIndex((chave) => {
      const valor = estadoAtual?.[chave];
      return valor === null || valor === undefined;
    });
    return indice === -1 ? chaves.length - 1 : indice;
  })();

  const [etapa, setEtapa] = useState(etapaInicial);

  const avancar = useCallback(() => {
    setEtapa((prev) => {
      const nova = Math.min(prev + 1, chaves.length - 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, String(nova));
      }
      return nova;
    });
  }, [chaves.length, storageKey]);

  // Limpa a chave ao desmontar o componente (quando sai do bloco)
  // Isso é feito pelo próprio componente ao chamar confirmarTudo / confirmar
  // Mas podemos exportar uma função para limpar
  return { etapa, avancar, storageKey };
}