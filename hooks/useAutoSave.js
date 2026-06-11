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
  const [verificandoDraft, setVerificandoDraft] = useState(true); // NOVO
  const timerRef = useRef(null);
  const ultimoSalvoRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    async function verificarDrafts() {
      setVerificandoDraft(true);
      // 1. Verifica localStorage (síncrono)
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const dados = raw ? JSON.parse(raw) : null;
          if (draftValido(dados)) {
            if (ativo) {
              setTemDraft(true);
              setVerificandoDraft(false);
            }
            return;
          }
        } catch (e) { /* ignora */ }
      }

      // 2. Se logado, verifica Supabase (assíncrono)
      if (usuario?.id) {
        try {
          const { data: memorias } = await supabase
            .from('memoriais')
            .select('estado')
            .eq('user_id', usuario.id)
            .maybeSingle();
          if (ativo && memorias?.estado && draftValido(memorias.estado)) {
            setTemDraft(true);
            setVerificandoDraft(false);
            return;
          }
        } catch (e) { /* ignora */ }
      }

      if (ativo) {
        setTemDraft(false);
        setVerificandoDraft(false);
      }
    }

    verificarDrafts();
    return () => { ativo = false; };
  }, [usuario]); // reexecuta quando usuario muda

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
      const { data: existente } = await supabase
        .from('memoriais')
        .select('id')
        .eq('user_id', usuario.id)
        .maybeSingle();

      if (existente) {
        await supabase
          .from('memoriais')
          .update({
            estado: dados,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', existente.id);
      } else {
        await supabase
          .from('memoriais')
          .insert({
            user_id: usuario.id,
            estado: dados,
            concluido: false,
          });
      }
      setTemDraft(true);
    } catch (e) {
      setErro(e.message || 'Erro ao salvar no servidor');
      salvarLocal(dados);
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

  const salvarAgora = useCallback(async () => {
    if (!estado || !draftValido(estado)) return;
    ultimoSalvoRef.current = JSON.stringify(estado);
    if (usuario) {
      await salvarSupabase(estado);
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

  return { salvar, carregarDraft, limparDraft, salvandoAgora, temDraft, erro, salvarAgora, verificandoDraft };
}

export { useAutoSave };