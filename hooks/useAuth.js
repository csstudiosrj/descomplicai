import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cerimonialista, setCerimonialista] = useState(null);
  const [isCerimonialista, setIsCerimonialista] = useState(false);

  const buscarCerimonialista = useCallback(async (usuarioId) => {
    if (!usuarioId) {
      setCerimonialista(null);
      setIsCerimonialista(false);
      return;
    }
    const { data, error } = await supabase
      .from('cerimonialistas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .single();

    if (!error && data) {
      setCerimonialista(data);
      setIsCerimonialista(true);
    } else {
      setCerimonialista(null);
      setIsCerimonialista(false);
    }
  }, []);

  const refreshCerimonialista = useCallback(async () => {
    if (user?.id) {
      await buscarCerimonialista(user.id);
    }
  }, [user, buscarCerimonialista]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        buscarCerimonialista(session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        buscarCerimonialista(session.user.id);
      } else {
        setCerimonialista(null);
        setIsCerimonialista(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [buscarCerimonialista]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCerimonialista(null);
    setIsCerimonialista(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, cerimonialista, isCerimonialista, signOut, refreshCerimonialista }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
