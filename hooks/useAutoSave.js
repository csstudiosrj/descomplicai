/**
 * Hook que persiste o estado do memorial — localStorage (anônimo) ou Supabase (logado)
 * @module hooks/useAutoSave
 * @dependencies React, supabase.js
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'descomplicai-memorial-draft';
const DEBOUNCE_MS = 1500;

/**
 * @param {Object} estado — estado atual do memorial
 * @param {Object|null} usuario — usuário logado (null se anônimo)
 * @returns {{ salvar: function, carregarDraft: function, limparDraft: function, salvandoAgora: boolean, temDraft: boolean, erro: string|null }}
 */
export default function useAutoSave(estado, usuario = null) {
  const [salvandoAgora, setSalvandoAgora] = useState(false);
  const [erro, setErro] = useState(null);
  const [temDraft, setTemDraft] = useState(false);
  const timerRef = useRef(null);
  const ultimoSalvoRef = useRef(null);
  const salvandoRef = useRef(false);

  // Verifica se existe draft no localStorage ao montar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    setTemDraft(!!raw && raw !== '{}');
  }, []);

  const salvarLocal = useCallback((dados) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
      setTemDraft(true);
    } catch (e) {
      console.warn('Falha ao salvar no localStorage:', e);
    }
  }, []);

  const salvarSupabase = useCallback(async (dados) => {
    if (!usuario?.id) return;
    setSalvandoAgora(true);
    setErro(null);
    try {
      const { error } = await supabase
        .from('memoriais')
        .upsert(
          {
            user_id: usuario.id,
            estado: dados,
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    } catch (e) {
      setErro(e.message || 'Erro ao salvar no servidor');
      // Fallback: garante localStorage mesmo se Supabase falhar
      salvarLocal(dados);
    } finally {
      setSalvandoAgora(false);
    }
  }, [usuario, salvarLocal]);

  const salvar = useCallback(() => {
    if (!estado || salvandoRef.current) return;
    const serializado = JSON.stringify(estado);

    if (serializado === ultimoSalvoRef.current) return;
    ultimoSalvoRef.current = serializado;

    if (!usuario) {
      salvarLocal(estado);
      return;
    }

    // Logado: debounce para Supabase
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      salvarSupabase(estado);
    }, DEBOUNCE_MS);
  }, [estado, usuario, salvarLocal, salvarSupabase]);

  const carregarDraft = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
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

  // Autosave automático a cada mudança de estado
  useEffect(() => {
    salvar();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [salvar]);

  return { salvar, carregarDraft, limparDraft, salvandoAgora, temDraft, erro };
}

export { useAutoSave };