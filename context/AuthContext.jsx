import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { apiPath } from '../utils/apiPath';

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

      let userIsAdmin = false;
      try {
        const res = await fetch(apiPath('/admin/verificar'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
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

      if (userIsAdmin) {
        setCerimonialista(null);
        setIsCerimonialista(false);
        setEvento(null);
        setCarregando(false);
        return;
      }

      const [cerimRes, eventoRes] = await Promise.all([
        supabase
          .from('cerimonialistas')
          .select('*')
          .eq('usuario_id', usuarioId)
          .maybeSingle(),
        supabase
          .from('eventos')
          .select('*')
          .eq('usuario_id', usuarioId)
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle(),
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
        .maybeSingle();
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
      (event, session) => {
        // CORREÇÃO: Ignora refresh de token para evitar loop de requisições
        if (event === 'TOKEN_REFRESHED') return;

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

  // CORREÇÃO: Limpa TODO o progresso do memorial do localStorage
  const limparProgressoMemorial = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Remove todas as chaves relacionadas ao memorial (todas as versões)
    localStorage.removeItem('memorial_progresso');
    localStorage.removeItem('memorial_progresso_v5');
    localStorage.removeItem('descomplicai-memorial-draft');
    localStorage.removeItem('descomplicai-evento-id');
    localStorage.removeItem('memorial-voltou-step00');

    // Limpa qualquer outra chave que comece com 'memorial_' ou 'descomplicai-memorial'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('memorial_') || key.startsWith('descomplicai-memorial')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const signOut = useCallback(async () => {
    // CORREÇÃO: Limpa o progresso do memorial ANTES de fazer logout
    limparProgressoMemorial();

    await supabase.auth.signOut();
    Object.keys(localStorage)
      .filter(k =>
        k.startsWith('sb-') ||
        k.includes('supabase')
      )
      .forEach(k => localStorage.removeItem(k));
    setUsuario(null);
    setCerimonialista(null);
    setIsCerimonialista(false);
    setEvento(null);
    setIsAdmin(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/descomplicai';
    }
  }, [limparProgressoMemorial]);

  const logout = useCallback(async () => {
    // CORREÇÃO: Limpa o progresso do memorial ANTES de redirecionar
    limparProgressoMemorial();

    await signOut();
    if (typeof window !== 'undefined') {
      window.location.href = '/descomplicai/login';
    }
  }, [signOut, limparProgressoMemorial]);

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
        redirectTo: typeof window !== 'undefined'
          ? window.location.origin + '/descomplicai/memorial'
          : undefined,
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
    limparProgressoMemorial,
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
