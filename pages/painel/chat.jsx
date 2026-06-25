import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/painel/ProtectedRoute';
import ChatInterface from '../../components/chat/ChatInterface';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';

export default function ChatCasalPage() {
  return (
    <ProtectedRoute>
      <ChatCasalContent />
    </ProtectedRoute>
  );
}

function ChatCasalContent() {
  const router = useRouter();
  const { evento, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-off-white)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
          Carregando...
        </p>
      </div>
    );
  }

  // Sem evento
  if (!evento) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-off-white)',
          padding: 'var(--space-4)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-warning)" />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-primary)',
              marginTop: 'var(--space-4)',
            }}
          >
            Evento não encontrado
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-2)',
            }}
          >
            Crie um evento primeiro para usar o chat.
          </p>
        </div>
      </div>
    );
  }

  // Sem cerimonialista vinculado
  if (!evento.cerimonialista_id) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-off-white)',
          padding: 'var(--space-4)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-brand-lighter)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Icon name="chat" size={28} color="var(--color-brand-light)" />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-primary)',
              marginTop: 'var(--space-4)',
            }}
          >
            Chat com cerimonialista
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-2)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            Você ainda não tem um cerimonialista vinculado ao seu evento.
            Quando contratar um, o chat será ativado automaticamente.
          </p>
          <button
            onClick={() => router.push('/painel')}
            style={{
              marginTop: 'var(--space-6)',
              background: 'var(--color-brand)',
              color: 'var(--color-white)',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              cursor: 'pointer',
            }}
          >
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Chat | descomplicaí</title>
      </Head>
      <ChatInterface eventoId={evento.id} modo="casal" />
    </>
  );
}
