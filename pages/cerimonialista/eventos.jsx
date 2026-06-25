import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export default function EventosCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista, signOut } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventosLoading, setEventosLoading] = useState(true);
  const [mensagensPorEvento, setMensagensPorEvento] = useState({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function buscarEventos() {
      if (!cerimonialista?.id) {
        setEventosLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('eventos')
        .select('id, nome_evento, data_evento, orcamento, casal_confirmado, memorial_concluido, usuario_id')
        .eq('cerimonialista_id', cerimonialista.id)
        .eq('casal_confirmado', true)
        .order('data_evento', { ascending: true });

      if (!error && data) {
        setEventos(data);

        // Busca mensagens não lidas por evento
        if (data.length > 0) {
          const eventoIds = data.map((e) => e.id);
          const { data: msgData } = await supabase
            .from('mensagens')
            .select('evento_id, lida, remetente_id')
            .in('evento_id', eventoIds)
            .eq('lida', false);

          const contagem = {};
          msgData?.forEach((m) => {
            if (m.remetente_id !== user.id) {
              contagem[m.evento_id] = (contagem[m.evento_id] || 0) + 1;
            }
          });
          setMensagensPorEvento(contagem);
        }
      }

      setEventosLoading(false);
    }

    if (isCerimonialista && cerimonialista) {
      buscarEventos();
    }
  }, [isCerimonialista, cerimonialista, user]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Carregando...</p>
      </div>
    );
  }

  if (!isCerimonialista || !cerimonialista) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-warning)" />
          <h2 style={styles.tituloRestrito}>Acesso restrito</h2>
          <p style={styles.descricaoRestrita}>Esta área é exclusiva para cerimonialistas.</p>
          <Button variant="primary" onClick={() => router.push('/painel')} style={{ marginTop: 'var(--space-6)' }}>
            Ir para o painel do casal
          </Button>
        </div>
      </div>
    );
  }

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Data não definida';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const calcularDiasRestantes = (dataStr) => {
    if (!dataStr) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataEvento = new Date(dataStr + 'T00:00:00');
    const diff = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <>
      <Head>
        <title>Meus Eventos — Descomplicaí</title>
      </Head>

      <div style={styles.page}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              onClick={() => router.push('/cerimonialista/painel')}
              style={styles.btnVoltar}
              aria-label="Voltar ao painel"
            >
              <Icon name="arrowLeft" size={20} />
            </button>
            <h1 style={styles.headerTitulo}>Meus Eventos</h1>
          </div>
          <button onClick={signOut} style={styles.btnSair} aria-label="Sair">
            <Icon name="logout" size={22} />
          </button>
        </header>

        {/* Conteúdo */}
        <main style={styles.main}>
          {eventosLoading ? (
            <p style={styles.loadingText}>Carregando eventos...</p>
          ) : eventos.length === 0 ? (
            <div style={styles.emptyState}>
              <Icon name="calendar" size={48} color="var(--color-text-muted)" />
              <h2 style={styles.emptyTitulo}>Nenhum evento ativo</h2>
              <p style={styles.emptyDesc}>
                Quando um casal confirmar seu convite, o evento aparecerá aqui.
              </p>
            </div>
          ) : (
            <div style={styles.lista}>
              {eventos.map((evento) => {
                const dias = calcularDiasRestantes(evento.data_evento);
                const naoLidas = mensagensPorEvento[evento.id] || 0;

                return (
                  <div
                    key={evento.id}
                    style={styles.card}
                    onClick={() => router.push(`/cerimonialista/espelho/${evento.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && router.push(`/cerimonialista/espelho/${evento.id}`)}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.cardIcone}>
                        <Icon name="calendar" size={20} color="var(--color-brand)" />
                      </div>
                      <div style={styles.cardInfo}>
                        <h3 style={styles.cardTitulo}>{evento.nome_evento || 'Evento sem nome'}</h3>
                        <p style={styles.cardData}>{formatarData(evento.data_evento)}</p>
                      </div>
                      {naoLidas > 0 && (
                        <span style={styles.badgeMensagens} aria-label={`${naoLidas} mensagens não lidas`}>
                          {naoLidas > 99 ? '99+' : naoLidas}
                        </span>
                      )}
                    </div>

                    <div style={styles.cardBody}>
                      {dias !== null && (
                        <div style={styles.diasBadge(dias)}>
                          <Icon name="clock" size={14} />
                          <span>
                            {dias < 0
                              ? `Evento realizado há ${Math.abs(dias)} dias`
                              : dias === 0
                              ? 'Hoje é o grande dia'
                              : `${dias} dias restantes`}
                          </span>
                        </div>
                      )}
                      <div style={styles.cardMeta}>
                        <span style={styles.metaItem}>
                          <Icon name="dollar" size={14} color="var(--color-text-muted)" />
                          {evento.orcamento
                            ? `R$ ${Number(evento.orcamento).toLocaleString('pt-BR')}`
                            : 'Orçamento não definido'}
                        </span>
                        {evento.memorial_concluido && (
                          <span style={styles.metaItem}>
                            <Icon name="memorial" size={14} color="var(--color-success)" />
                            Memorial completo
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={styles.cardFooter}>
                      <span style={styles.verEspelho}>
                        <Icon name="arrowRight" size={14} />
                        Acessar painel espelhado
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' },

  header: {
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: 'var(--space-4) var(--space-5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' },
  btnVoltar: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    padding: 'var(--space-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  btnSair: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    padding: 'var(--space-2)',
  },

  main: { padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' },

  loadingContainer: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-off-white)',
  },
  loadingText: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-muted)',
  },

  tituloRestrito: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    color: 'var(--color-text-primary)',
    marginTop: 'var(--space-4)',
  },
  descricaoRestrita: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-2)',
  },

  emptyState: {
    textAlign: 'center',
    padding: 'var(--space-12) var(--space-4)',
  },
  emptyTitulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-lg)',
    color: 'var(--color-text-primary)',
    marginTop: 'var(--space-4)',
  },
  emptyDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-2)',
  },

  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },

  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'box-shadow 200ms ease, transform 100ms ease',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border-light)',
  },
  cardIcone: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-brand-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardTitulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardData: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0',
  },
  badgeMensagens: {
    background: 'var(--color-danger)',
    color: 'var(--color-white)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-bold)',
    minWidth: '20px',
    height: '20px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    flexShrink: 0,
  },

  cardBody: {
    padding: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  diasBadge: (dias) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-full)',
    backgroundColor: dias < 0 ? 'var(--color-text-muted-light)' : dias <= 30 ? 'var(--color-danger-light)' : 'var(--color-success-light)',
    color: dias < 0 ? 'var(--color-text-muted)' : dias <= 30 ? 'var(--color-danger)' : 'var(--color-success)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    alignSelf: 'flex-start',
  }),
  cardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-3)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },

  cardFooter: {
    padding: 'var(--space-3) var(--space-4)',
    borderTop: '1px solid var(--color-border-light)',
    backgroundColor: 'var(--color-off-white)',
  },
  verEspelho: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-brand)',
    fontWeight: 'var(--font-semibold)',
  },
};
