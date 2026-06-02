// Provider global do estado do memorial — disponibiliza useMemorial para toda a árvore
// Dependências diretas: React, useMemorial

import React, { createContext, useContext } from 'react';
import useMemorial from '../hooks/useMemorial';

const MemorialContext = createContext(null);

export function MemorialProvider({ children }) {
  const memorial = useMemorial();
  return (
    <MemorialContext.Provider value={memorial}>
      {children}
    </MemorialContext.Provider>
  );
}

export function useMemorialContext() {
  const context = useContext(MemorialContext);
  if (!context) {
    throw new Error('useMemorialContext deve ser usado dentro de MemorialProvider');
  }
  return context;
}