import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ── Estados de autenticação base ──
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // ── Estados de enriquecimento (movidos do hooks/useAuth.js) ──
  const [cerimonialista, setCerimonialista] = useState(null);
  const [isCerimonialista, setIsCerimonialista] = useState(false);
  const [evento, setEvento] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Aliases para compatibilidade com consumidores antigos do hook useAuth ──
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
      // 1. Verificar se é admin primeiro
      const { data: adminData, error: adminErr } = await supabase
        .from('admins')
        .select('id')
        .eq('usuario_id', usuarioId)
        .single();

      const userIsAdmin = !adminErr && adminData;
      setIsAdmin(userIsAdmin);

      // 2. Se for admin, não busca eventos/cerimonialistas (evita 406 do RLS)
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
      console.error('Erro ao buscar dados do usuário:', err);
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
    // Tenta recuperar a sessão ao montar
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

    // ── ÚNICO listener de onAuthStateChange em toda a aplicação ──
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

  // hasAccess: admin sempre tem acesso; casal precisa de evento
  const hasAccess = useMemo(() => {
    if (isAdmin) return true;
    return !!usuario && !!evento;
  }, [usuario, evento, isAdmin]);

  const valor = {
    // ── Compatibilidade total com antigo hooks/useAuth.js ──
    user,
    loading,
    cerimonialista,
    isCerimonialista,
    evento,
    signOut,
    refreshCerimonialista,
    supabase,
    hasAccess,

    // ── Compatibilidade total com antigo context/AuthContext.jsx ──
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

// ── Hook unificado — apenas consome o contexto centralizado ──
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}