/**
 * Hook que persiste o estado do memorial com debounce
 * @module hooks/useAutoSave
 * @dependencies React
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'descomplicai-memorial-draft';
const DEBOUNCE_MS = 1500;

/**
 * @param {Object} estado — estado atual do memorial
 * @param {boolean} logado — se o usuário já fez login
 * @returns {{ salvar: function, carregarDraft: function, limparDraft: function, salvandoAgora: boolean }}
 */
export default function useAutoSave(estado, logado = false) {
  const [salvandoAgora, setSalvandoAgora] = useState(false);
  const timerRef = useRef(null);
  const ultimoSalvoRef = useRef(null);

  const salvar = useCallback(() => {
    if (typeof window === 'undefined') return;

    const serializado = JSON.stringify(estado);

    if (serializado === ultimoSalvoRef.current) return;

    setSalvandoAgora(true);

    if (!logado) {
      localStorage.setItem(STORAGE_KEY, serializado);
      ultimoSalvoRef.current = serializado;
      setSalvandoAgora(false);
      return;
    }

    // Após login: debounce para Supabase (placeholder para integração futura)
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, serializado);
      ultimoSalvoRef.current = serializado;
      setSalvandoAgora(false);
    }, DEBOUNCE_MS);
  }, [estado, logado]);

  const carregarDraft = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const draft = localStorage.getItem(STORAGE_KEY);
    if (!draft) return null;
    try {
      return JSON.parse(draft);
    } catch {
      return null;
    }
  }, []);

  const limparDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    ultimoSalvoRef.current = null;
  }, []);

  useEffect(() => {
    salvar();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [salvar]);

  return { salvar, carregarDraft, limparDraft, salvandoAgora };
}

export { useAutoSave };