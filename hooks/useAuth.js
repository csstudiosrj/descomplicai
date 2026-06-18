import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { temAcessoPainel } from '../utils/acesso';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await buscarEvento(session.user.id);
        }
      } catch (err) {
        console.error('useAuth: erro ao buscar sessão:', err);
      } finally {
        setLoading(false);
      }
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
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('usuario_id', userId)
        .order('criado_em', { ascending: false })
        .limit(1);

      if (error) {
        console.error('useAuth: erro ao buscar evento:', error);
        setEvento(null);
        return;
      }

      if (data && data.length > 0) {
        console.log('useAuth: evento encontrado:', data[0].id, 'plano:', data[0].plano, 'expira:', data[0].acesso_expira_em);
        setEvento(data[0]);
      } else {
        console.log('useAuth: nenhum evento encontrado para usuario_id:', userId);
        setEvento(null);
      }
    } catch (err) {
      console.error('useAuth: exceção ao buscar evento:', err);
      setEvento(null);
    }
  }, []);

  const login = useCallback(async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEvento(null);
  }, []);

  const hasAccess = temAcessoPainel(evento);

  return { user, evento, loading, carregando: loading, hasAccess, login, signOut, supabase };
}

export { supabase };