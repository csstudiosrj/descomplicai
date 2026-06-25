import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import ChatInterface from '../../components/chat/ChatInterface';

export default function ChatCerimonialistaPage() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [carregandoEventos, setCarregandoEventos] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function buscarEventos() {
      if (!cerimonialista?.id) {
        setCarregandoEventos(false);
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('id, nome_evento, data_evento, usuario_id')
        .eq('cerimonialista_id', cerimonialista.id)
        .eq('casal_confirmado', true)
        .order('data_evento', { ascending: true });

      if (error) {
        console.error('[ChatCerim] erro ao buscar eventos:', error);
      } else {
        setEventos(data || []);
        if (data && data.length === 1) {
          setEventoSelecionado(data[0]);
        }
      }

      setCarregandoEventos(false);
    }

    if (isCerimonialista && cerimonialista) {
      buscarEventos();
    }
  }, [isCerimonialista, cerimonialista]);

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

  if (!isCerimonialista || !cerimonialista) {
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
            Acesso restrito
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-2)',
            }}
          >
            Esta área é exclusiva para cerimonialistas.
          </p>
        </div>
      </div>
    );
  }

  // Seletor de evento (quando há múltiplos)
  if (!eventoSelecionado && eventos.length > 1) {
    return (
      <>
        <Head>
          <title>Chat — Cerimonialista | descomplicaí</title>
        </Head>
        <div
          style={{
            minHeight: '100dvh',
            background: 'var(--color-off-white)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <header
            style={{
              background: 'var(--color-white)',
              borderBottom: '1px solid var(--color-border)',
              padding: 'var(--space-4) var(--space-5)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Chat com casais
            </h1>
          </header>

          <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Selecione um evento para iniciar a conversa:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {eventos.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setEventoSelecionado(ev)}
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-brand-light)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-brand-lighter)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="chat" size={22} color="var(--color-brand)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-primary)',
                        margin: '0 0 2px',
                        fontWeight: 'var(--font-semibold)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ev.nome_evento || 'Evento sem nome'}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        margin: 0,
                      }}
                    >
                      {ev.data_evento
                        ? new Date(ev.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Data não definida'}
                    </p>
                  </div>
                  <Icon name="arrowRight" size={20} color="var(--color-text-muted)" />
                </button>
              ))}
            </div>
          </main>
        </div>
      </>
    );
  }

  // Nenhum evento confirmado
  if (!eventoSelecionado && eventos.length === 0 && !carregandoEventos) {
    return (
      <>
        <Head>
          <title>Chat — Cerimonialista | descomplicaí</title>
        </Head>
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
              Nenhum evento ativo
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-2)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              Você ainda não tem eventos confirmados com casais.
              Os chats aparecerão aqui quando os casais aceitarem seu convite.
            </p>
            <button
              onClick={() => router.push('/cerimonialista/painel')}
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
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Chat — Cerimonialista | descomplicaí</title>
      </Head>
      {eventoSelecionado && (
        <ChatInterface eventoId={eventoSelecionado.id} modo="cerimonialista" />
      )}
    </>
  );
}
