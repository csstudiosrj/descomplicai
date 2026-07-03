import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [cerimonialista, setCerimonialista] = useState(null);
  const [isCerimonialista, setIsCerimonialista] = useState(false);
  const [evento, setEvento] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const user = usuario;
  const loading = carregando;

  const buscarDadosUsuario = useCallback(async (usuarioId) => {
    if (!usuarioId) {
      setCerimonialista(null);
      setIsCerimonialista(false);
      setEvento(null);
      setIsAdmin(false);
      setCarregando(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // 1. Verificar se é admin via API que já existe
      let userIsAdmin = false;
      try {
        const res = await fetch('/api/admin/verificar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: accessToken }),
        });
        if (res.ok) {
          const data = await res.json();
          userIsAdmin = data.isAdmin === true;
        }
      } catch (apiErr) {
        console.error('Erro ao verificar admin:', apiErr);
      }

      setIsAdmin(userIsAdmin);

      // 2. Se for admin, não busca mais nada
      if (userIsAdmin) {
        setCerimonialista(null);
        setIsCerimonialista(false);
        setEvento(null);
        setCarregando(false);
        return;
      }

      // 3. Se não for admin, busca dados normais
      const [cerimRes, eventoRes] = await Promise.all([
        supabase
          .from('cerimonialistas')
          .select('*')
          .eq('usuario_id', usuarioId)
          .single(),
        supabase
          .from('eventos')
          .select('*')
          .eq('usuario_id', usuarioId)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single(),
      ]);

      if (!cerimRes.error && cerimRes.data) {
        setCerimonialista(cerimRes.data);
        setIsCerimonialista(true);
      } else {
        setCerimonialista(null);
        setIsCerimonialista(false);
      }

      if (!eventoRes.error && eventoRes.data) {
        setEvento(eventoRes.data);
      } else {
        setEvento(null);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setCerimonialista(null);
      setIsCerimonialista(false);
      setEvento(null);
      setIsAdmin(false);
    } finally {
      setCarregando(false);
    }
  }, []);

  const refreshCerimonialista = useCallback(async () => {
    if (usuario?.id && !isAdmin) {
      const { data, error } = await supabase
        .from('cerimonialistas')
        .select('*')
        .eq('usuario_id', usuario.id)
        .single();
      if (!error && data) {
        setCerimonialista(data);
        setIsCerimonialista(true);
      }
    }
  }, [usuario, isAdmin]);

  useEffect(() => {
    const carregarSessao = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUsuario(currentUser);
        if (currentUser) {
          await buscarDadosUsuario(currentUser.id);
        } else {
          setCarregando(false);
        }
      } catch (err) {
        console.error('Erro ao recuperar sessão:', err);
        setCarregando(false);
      }
    };

    carregarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUsuario(currentUser);
        if (currentUser) {
          buscarDadosUsuario(currentUser.id);
        } else {
          setCerimonialista(null);
          setIsCerimonialista(false);
          setEvento(null);
          setIsAdmin(false);
          setCarregando(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [buscarDadosUsuario]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setCerimonialista(null);
    setIsCerimonialista(false);
    setEvento(null);
    setIsAdmin(false);
  }, []);

  const logout = signOut;

  const login = useCallback(async (email, senha) => {
    setCarregando(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (!error && data?.session) {
      setUsuario(data.session.user);
      await buscarDadosUsuario(data.session.user.id);
    } else {
      setCarregando(false);
    }
    return { data, error };
  }, [buscarDadosUsuario]);

  const cadastrar = useCallback(async (email, senha, metadata = {}) => {
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: metadata },
    });
    if (!error && data?.session) {
      setUsuario(data.session.user);
      await buscarDadosUsuario(data.session.user.id);
    } else {
      setCarregando(false);
    }
    return { data, error };
  }, [buscarDadosUsuario]);

  const loginSocial = useCallback(async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/memorial' : undefined,
      },
    });
    return { data, error };
  }, []);

  const assinaturaAtiva = usuario?.user_metadata?.assinatura_ativa === true;

  const hasAccess = useMemo(() => {
    if (isAdmin) return true;
    return !!usuario && !!evento;
  }, [usuario, evento, isAdmin]);

  const valor = {
    user,
    loading,
    cerimonialista,
    isCerimonialista,
    evento,
    signOut,
    refreshCerimonialista,
    supabase,
    hasAccess,
    usuario,
    carregando,
    assinaturaAtiva,
    login,
    cadastrar,
    logout,
    loginSocial,
    isAdmin,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}