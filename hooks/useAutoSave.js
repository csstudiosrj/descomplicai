// hooks/useAutoSave.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'descomplicai-memorial-draft';
const DEBOUNCE_MS = 1500;

function draftValido(dados) {
  return dados && dados.perfilCasal != null;
}

export default function useAutoSave(estado, usuario = null) {
  const [salvandoAgora, setSalvandoAgora] = useState(false);
  const [erro, setErro] = useState(null);
  const [temDraft, setTemDraft] = useState(false);
  const timerRef = useRef(null);
  const ultimoSalvoRef = useRef(null);

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

  const salvarSupabase = useCallback(async (dados) => {
    if (!usuario?.id) return;
    setSalvandoAgora(true);
    setErro(null);

    try {
      // Garante sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Sessão não encontrada');

      // 1. Busca existente com maybeSingle (não quebra se não achar)
      const { data: existente, error: errBusca } = await supabase
        .from('memoriais')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (errBusca) throw errBusca;

      if (existente) {
        // Atualiza o registro existente
        const { error: errUpdate } = await supabase
          .from('memoriais')
          .update({
            estado: dados,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', existente.id);

        if (errUpdate) throw errUpdate;
      } else {
        // Insere novo registro com payload mínimo
        const { error: errInsert } = await supabase
          .from('memoriais')
          .insert({
            user_id: userId,
            estado: dados,
            concluido: false,
          });

        if (errInsert) throw errInsert;
      }
    } catch (e) {
      setErro(e.message || 'Erro ao salvar no servidor');
      salvarLocal(dados); // fallback para localStorage
    } finally {
      setSalvandoAgora(false);
    }
  }, [usuario, salvarLocal]);

  const salvar = useCallback(() => {
    if (!estado || !draftValido(estado)) return;
    const serializado = JSON.stringify(estado);
    if (serializado === ultimoSalvoRef.current) return;
    ultimoSalvoRef.current = serializado;

    if (usuario) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        salvarSupabase(estado);
      }, DEBOUNCE_MS);
    } else {
      salvarLocal(estado);
    }
  }, [estado, usuario, salvarLocal, salvarSupabase]);

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

  return { salvar, carregarDraft, limparDraft, salvandoAgora, temDraft, erro };
}

export { useAutoSave };