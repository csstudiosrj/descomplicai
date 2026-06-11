// context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Tenta recuperar a sessão ao montar
    const carregarSessao = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUsuario(session?.user ?? null);
      } catch (err) {
        console.error('Erro ao recuperar sessão:', err);
      } finally {
        setCarregando(false);
      }
    };

    carregarSessao();

    // Escuta mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, senha) => {
    setCarregando(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (!error && data?.session) {
      setUsuario(data.session.user);
    }
    setCarregando(false);
    return { data, error };
  }, []);

  const cadastrar = useCallback(async (email, senha, metadata = {}) => {
    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: metadata },
    });
    if (!error && data?.session) {
      setUsuario(data.session.user);
    }
    setCarregando(false);
    return { data, error };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  }, []);

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

  const valor = {
    usuario,
    carregando,
    assinaturaAtiva,
    login,
    cadastrar,
    logout,
    loginSocial,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}