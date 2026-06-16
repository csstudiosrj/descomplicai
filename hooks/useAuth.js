// hooks/useAuth.js — Autenticação com Supabase
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await buscarEvento(session.user.id);
      }
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        buscarEvento(session.user.id);
      } else {
        setEvento(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const buscarEvento = useCallback(async (userId) => {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .single();
    setEvento(data);
  }, []);

  const login = useCallback(async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (data?.user) await buscarEvento(data.user.id);
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEvento(null);
  }, []);

  // CORRECAO: Painel = EXCLUSIVO para assinantes. PDF nao da acesso ao painel.
  const hasAccess = Boolean(evento && evento.assinatura_ativa === true);

  return { user, evento, loading, carregando: loading, hasAccess, login, signOut, supabase };
}

export { supabase };