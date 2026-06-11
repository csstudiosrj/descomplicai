// hooks/useAutoSave.js
import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'descomplicai-memorial-draft';
const DEBOUNCE_MS = 1500;

function draftValido(dados) {
  return dados && dados.perfilCasal != null && dados.etapaAtual != null;
}

export default function useAutoSave(estado) {
  const [salvandoAgora, setSalvandoAgora] = useState(false);
  const [temDraft, setTemDraft] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const timerRef = useRef(null);
  const estadoRef = useRef(estado);

  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  // Hidratação: só roda no cliente (useEffect só executa no browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const dados = raw ? JSON.parse(raw) : null;
      setTemDraft(draftValido(dados));
    } catch {
      setTemDraft(false);
    } finally {
      setIsHydrated(true);
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

  useEffect(() => {
    if (!estado || !draftValido(estado)) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      salvarLocal(estadoRef.current);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [estado, salvarLocal]);

  const carregarDraft = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const dados = raw ? JSON.parse(raw) : null;
      if (!draftValido(dados)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return dados;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  const limparDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    setTemDraft(false);
  }, []);

  return { isHydrated, temDraft, carregarDraft, limparDraft, salvandoAgora };
}