import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { temAcessoPainel } from '../../utils/acesso';

export default function ProtectedRoute({ children }) {
  const { user, loading, evento } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!temAcessoPainel(evento)) {
        router.push('/memorial/conclusao');
      }
    }
  }, [user, loading, evento, router]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Carregando...</p>
      </div>
    );
  }

  if (!user || !temAcessoPainel(evento)) {
    return (
      <div style={styles.loading}>
        <p style={styles.loadingText}>Redirecionando...</p>
      </div>
    );
  }

  return children;
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--color-secondary)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: 'var(--color-text-soft)',
  },
};