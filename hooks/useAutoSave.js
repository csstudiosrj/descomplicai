// hooks/useAutoSave.js
import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'descomplicai-memorial-draft';
const DEBOUNCE_MS = 1500;

function draftValido(dados) {
  return dados && dados.perfilCasal != null;
}

export default function useAutoSave(estado, usuario = null) {
  const [salvandoAgora, setSalvandoAgora] = useState(false);
  const [temDraft, setTemDraft] = useState(false);
  const timerRef = useRef(null);
  const ultimoSalvoRef = useRef(null);

  // Verifica localStorage ao montar (síncrono, sem espera)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const dados = raw ? JSON.parse(raw) : null;
      setTemDraft(draftValido(dados));
    } catch {
      setTemDraft(false);
    }
  }, []);

  const salvarLocal = useCallback((dados) => {
    if (typeof window === 'undefined') return;
    if (!draftValido(dados)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
      setTemDraft(true);
    } catch (e) {
      console.warn('Falha ao salvar no localStorage:', e);
    }
  }, []);

  const salvar = useCallback(() => {
    if (!estado || !draftValido(estado)) return;
    const serializado = JSON.stringify(estado);
    if (serializado === ultimoSalvoRef.current) return;
    ultimoSalvoRef.current = serializado;

    // Debounce para não salvar a cada digitação
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      salvarLocal(estado);
    }, DEBOUNCE_MS);
  }, [estado, salvarLocal]);

  const carregarDraft = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const dados = raw ? JSON.parse(raw) : null;
      return draftValido(dados) ? dados : null;
    } catch {
      return null;
    }
  }, []);

  const limparDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    ultimoSalvoRef.current = null;
    setTemDraft(false);
  }, []);

  useEffect(() => {
    salvar();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [salvar]);

  return { salvar, carregarDraft, limparDraft, salvandoAgora, temDraft };
}

export { useAutoSave };