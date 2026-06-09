// context/AuthContext.jsx
// Provedor de autenticação global — envolve toda a aplicação e fornece
// estado do usuário, login, cadastro, logout e login social via Supabase Auth.
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarSessao = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUsuario(session?.user ?? null);
      } catch (err) {
        console.error('Erro ao recuperar sessão:', err);
      } finally {
        setCarregando(false);
      }
    };

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    return { data, error };
  }, []);

  const cadastrar = useCallback(async (email, senha, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: metadata },
    });
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
        redirectTo: window.location.origin,
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