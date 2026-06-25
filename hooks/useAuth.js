import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { temAcessoPainel } from '../utils/acesso';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);
  const [cerimonialista, setCerimonialista] = useState(null);
  const [isCerimonialista, setIsCerimonialista] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await Promise.all([
            buscarEvento(session.user.id),
            buscarCerimonialista(session.user.id),
          ]);
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
        Promise.all([
          buscarEvento(session.user.id),
          buscarCerimonialista(session.user.id),
        ]);
      } else {
        setEvento(null);
        setCerimonialista(null);
        setIsCerimonialista(false);
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
        setEvento(data[0]);
      } else {
        setEvento(null);
      }
    } catch (err) {
      console.error('useAuth: exceção ao buscar evento:', err);
      setEvento(null);
    }
  }, []);

  const buscarCerimonialista = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('cerimonialistas')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('useAuth: erro ao buscar cerimonialista:', error);
        }
        setCerimonialista(null);
        setIsCerimonialista(false);
        return;
      }

      if (data) {
        setCerimonialista(data);
        setIsCerimonialista(true);
      } else {
        setCerimonialista(null);
        setIsCerimonialista(false);
      }
    } catch (err) {
      console.error('useAuth: exceção ao buscar cerimonialista:', err);
      setCerimonialista(null);
      setIsCerimonialista(false);
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
    setCerimonialista(null);
    setIsCerimonialista(false);
  }, []);

  const hasAccess = temAcessoPainel(evento);

  return {
    user,
    evento,
    loading,
    carregando: loading,
    hasAccess,
    login,
    signOut,
    supabase,
    cerimonialista,
    isCerimonialista,
  };
}

export { supabase };
