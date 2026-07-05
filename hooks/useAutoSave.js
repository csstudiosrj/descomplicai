// hooks/useAutoSave.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import fetchAPI from '../utils/fetchAPI';

const STORAGE_KEY = 'descomplicai-memorial-draft';
const DEBOUNCE_MS = 1500;

function draftValido(dados) {
  return dados && dados.perfilCasal != null && dados.etapaAtual != null;
}

export default function useAutoSave(estado, user = null, evento = null) {
  const [salvandoAgora, setSalvandoAgora] = useState(false);
  const [temDraft, setTemDraft] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const timerRef = useRef(null);
  const estadoRef = useRef(estado);

  // Mantém o ref atualizado sem disparar efeitos
  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  // Hidratação única – só roda no cliente
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

  // Salva no Supabase quando usuário está logado e tem evento
  const salvarSupabase = useCallback(async (dados) => {
    if (!user || !evento?.id) return;
    if (!draftValido(dados)) return;

    setSalvandoAgora(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        console.warn('[useAutoSave] Sem token de sessão');
        return;
      }

      const res = await fetchAPI('/api/memorial/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          evento_id: evento.id,
          estado: dados,
        }),
      });

      if (!res.ok) {
        const erro = await res.text();
        console.warn('[useAutoSave] Erro ao salvar no Supabase:', erro);
      }
    } catch (e) {
      console.warn('[useAutoSave] Exceção ao salvar no Supabase:', e);
    } finally {
      setSalvandoAgora(false);
    }
  }, [user, evento]);

  // Debounce controlado – salva local + Supabase
  useEffect(() => {
    if (!estado || !draftValido(estado)) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      salvarLocal(estadoRef.current);
      salvarSupabase(estadoRef.current);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [estado, salvarLocal, salvarSupabase]);

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