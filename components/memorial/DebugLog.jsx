// Componente temporário para debug
import { useEffect } from 'react';

export default function DebugLog({ historicoIds, noAtualId }) {
  useEffect(() => {
    console.log('=== MEMORIAL DEBUG ===');
    console.log('noAtualId:', noAtualId);
    console.log('historicoIds:', JSON.stringify(historicoIds));
    console.log('======================');
  }, [historicoIds, noAtualId]);

  return null;
}
