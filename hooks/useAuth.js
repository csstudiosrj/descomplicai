// Hook de autenticação — login, cadastro, logout e estado do usuário
// Dependências diretas: React, supabase.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);

  useEffect(() => {
    const getSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setUsuario(user);
      setAssinaturaAtiva(user?.user_metadata?.assinatura_ativa === true);
      setCarregando(false);
    };
    getSessao();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setUsuario(user);
      setAssinaturaAtiva(user?.user_metadata?.assinatura_ativa === true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
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
    setAssinaturaAtiva(false);
  }, []);

  const loginSocial = useCallback(async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    return { data, error };
  }, []);

  return { usuario, carregando, assinaturaAtiva, login, cadastrar, logout, loginSocial };
}

export { useAuth };
