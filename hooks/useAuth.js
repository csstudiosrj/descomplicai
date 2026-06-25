import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cerimonialista, setCerimonialista] = useState(null);
  const [isCerimonialista, setIsCerimonialista] = useState(false);
  const [evento, setEvento] = useState(null);

  const buscarDadosUsuario = useCallback(async (usuarioId) => {
    if (!usuarioId) {
      setCerimonialista(null);
      setIsCerimonialista(false);
      setEvento(null);
      setLoading(false);
      return;
    }

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

    setLoading(false);
  }, []);

  const refreshCerimonialista = useCallback(async () => {
    if (user?.id) {
      const { data, error } = await supabase
        .from('cerimonialistas')
        .select('*')
        .eq('usuario_id', user.id)
        .single();
      if (!error && data) {
        setCerimonialista(data);
        setIsCerimonialista(true);
      }
    }
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        buscarDadosUsuario(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        buscarDadosUsuario(currentUser.id);
      } else {
        setCerimonialista(null);
        setIsCerimonialista(false);
        setEvento(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [buscarDadosUsuario]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCerimonialista(null);
    setIsCerimonialista(false);
    setEvento(null);
  };

  const login = async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, senha });
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, cerimonialista, isCerimonialista, evento, signOut, login, refreshCerimonialista }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
