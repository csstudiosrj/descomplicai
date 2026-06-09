// hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>');
  }
  return ctx;
}

export { useAuth };