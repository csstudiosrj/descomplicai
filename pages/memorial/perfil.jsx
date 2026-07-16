// pages/memorial/perfil.jsx
// REDIRECT: Perfil agora é um step da árvore (StepPerfil).
// Esta página existe apenas para não quebrar links antigos/bookmarks.
// Redireciona pro memorial principal onde o Orchestrator gerencia o fluxo.

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PerfilRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Preserva qualquer query param que possa existir
    router.replace('/memorial');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'var(--font-body)',
      color: 'var(--color-text-secondary)',
    }}>
      <p>Redirecionando...</p>
    </div>
  );
}
