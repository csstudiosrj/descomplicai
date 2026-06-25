import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export default function PainelCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista, signOut } = useAuth();
  const [leadsCount, setLeadsCount] = useState(0);
  const [modelosCount, setModelosCount] = useState(0);
  const [saldoFinanceiro, setSaldoFinanceiro] = useState(0);
  const [assistentesCount, setAssistentesCount] = useState(0);
  const [convitesPendentes, setConvitesPendentes] = useState(0);
  const [eventosAtivos, setEventosAtivos] = useState(0);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [modelosLoading, setModelosLoading] = useState(true);
  const [financeiroLoading, setFinanceiroLoading] = useState(true);
  const [assistentesLoading, setAssistentesLoading] = useState(true);
  const [convitesLoading, setConvitesLoading] = useState(true);
  const [eventosLoading, setEventosLoading] = useState(true);
  const [mensagensLoading, setMensagensLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function buscarDados() {
      if (!cerimonialista?.id) {
        setLeadsLoading(false);
        setModelosLoading(false);
        setFinanceiroLoading(false);
        setAssistentesLoading(false);
        setConvitesLoading(false);
        setEventosLoading(false);
        setMensagensLoading(false);
        return;
      }

      const [leadsRes, modelosRes, finRes, assistRes, convitesRes, eventosRes] = await Promise.all([
        supabase
          .from('cerimonialista_leads')
          .select('*', { count: 'exact', head: true })
          .eq('cerimonialista_id', cerimonialista.id)
          .neq('estagio', 'descartado'),
        supabase
          .from('cerimonialista_modelos')
          .select('*', { count: 'exact', head: true })
          .eq('cerimonialista_id', cerimonialista.id),
        supabase
          .from('cerimonialista_financeiro')
          .select('tipo, valor')
          .eq('cerimonialista_id', cerimonialista.id),
        supabase
          .from('cerimonialista_assistentes')
          .select('*', { count: 'exact', head: true })
          .eq('cerimonialista_id', cerimonialista.id)
          .eq('ativo', true),
        supabase
          .from('cerimonialista_leads')
          .select('*', { count: 'exact', head: true })
          .eq('cerimonialista_id', cerimonialista.id)
          .eq('estagio', 'contratado')
          .is('convertido_evento_id', null),
        supabase
          .from('eventos')
          .select('id')
          .eq('cerimonialista_id', cerimonialista.id)
          .eq('casal_confirmado', true),
      ]);

      if (!leadsRes.error) setLeadsCount(leadsRes.count || 0);
      if (!modelosRes.error) setModelosCount(modelosRes.count || 0);

      if (!finRes.error && finRes.data) {
        const receitas = finRes.data.filter((f) => f.tipo === 'receita').reduce((s, f) => s + (f.valor || 0), 0);
        const despesas = finRes.data.filter((f) => f.tipo === 'despesa').reduce((s, f) => s + (f.valor || 0), 0);
        setSaldoFinanceiro(receitas - despesas);
      }

      if (!assistRes.error) setAssistentesCount(assistRes.count || 0);
      if (!convitesRes.error) setConvitesPendentes(convitesRes.count || 0);
      if (!eventosRes.error) setEventosAtivos(eventosRes.data?.length || 0);

      if (eventosRes.data && eventosRes.data.length > 0) {
        const eventoIds = eventosRes.data.map((e) => e.id);
        const { count } = await supabase
          .from('mensagens')
          .select('*', { count: 'exact', head: true })
          .in('evento_id', eventoIds)
          .eq('lida', false)
          .neq('remetente_id', user.id);
        setMensagensNaoLidas(count || 0);
      }

      setLeadsLoading(false);
      setModelosLoading(false);
      setFinanceiroLoading(false);
      setAssistentesLoading(false);
      setConvitesLoading(false);
      setEventosLoading(false);
      setMensagensLoading(false);
    }

    if (isCerimonialista && cerimonialista) {
      buscarDados();
    }
  }, [isCerimonialista, cerimonialista, user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando...</p>
      </div>
    );
  }

  if (!isCerimonialista || !cerimonialista) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-4)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="alertCircle" size={48} color="var(--color-warning)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            Acesso restrito
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Esta área é exclusiva para cerimonialistas.
          </p>
          <Button variant="primary" onClick={() => router.push('/painel')} style={{ marginTop: 'var(--space-6)' }}>
            Ir para o painel do casal
          </Button>
        </div>
      </div>
    );
  }

  const diasRestantes = () => {
    if (!cerimonialista.trial_inicio) return 15;
    const inicio = new Date(cerimonialista.trial_inicio);
    const hoje = new Date();
    const diff = Math.ceil((inicio.getTime() + 15 * 24 * 60 * 60 * 1000 - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <>
      <Head>
        <title>Painel do Cerimonialista — Descomplicaí</title>
      </Head>

      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--color-text-primary)',
              }}
            >
              Bem-vindo, {cerimonialista.nome_empresa}
            </h1>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                marginTop: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
              }}
            >
              <Icon name="shield" size={14} />
              Trial — {diasRestantes()} dias grátis
            </div>
          </div>
          <button
            onClick={signOut}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-2)',
            }}
            aria-label="Sair"
          >
            <Icon name="logout" size={22} />
          </button>
        </header>

        {/* Conteúdo */}
        <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Card Eventos Ativos */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="calendar" size={20} color="var(--color-brand)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Eventos ativos</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {eventosLoading ? '...' : eventosAtivos}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth disabled>
                Novo evento
              </Button>
            </div>

            {/* Card Leads */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-success-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="trendingUp" size={20} color="var(--color-success)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Leads no funil</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {leadsLoading ? '...' : leadsCount}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/cerimonialista/funil')}>
                Ver funil
              </Button>
            </div>

            {/* Card Biblioteca */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-info-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="bookOpen" size={20} color="var(--color-info)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Modelos salvos</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {modelosLoading ? '...' : modelosCount}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/cerimonialista/biblioteca')}>
                Ver biblioteca
              </Button>
            </div>

            {/* Card Financeiro */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-success-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="wallet" size={20} color="var(--color-success)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Saldo</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {financeiroLoading ? '...' : formatarValor(saldoFinanceiro)}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/cerimonialista/financeiro')}>
                Ver financeiro
              </Button>
            </div>

            {/* Card Equipe */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-lighter)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="users" size={20} color="var(--color-brand)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Equipe ativa</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {assistentesLoading ? '...' : assistentesCount}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/cerimonialista/assistentes')}>
                Gerenciar equipe
              </Button>
            </div>

            {/* Card Convites */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-warning-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="mailOpen" size={20} color="var(--color-warning)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Convites pendentes</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {convitesLoading ? '...' : convitesPendentes}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/cerimonialista/convites')}>
                Gerenciar convites
              </Button>
            </div>

            {/* Card Chat */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
                position: 'relative',
              }}
            >
              {mensagensNaoLidas > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
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
                    zIndex: 2,
                  }}
                  aria-label={`${mensagensNaoLidas} mensagens não lidas`}
                >
                  {mensagensNaoLidas > 99 ? '99+' : mensagensNaoLidas}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-lighter)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="chat" size={20} color="var(--color-brand)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {mensagensNaoLidas > 0
                      ? `${mensagensNaoLidas} mensagem${mensagensNaoLidas > 1 ? 's' : ''} nova${mensagensNaoLidas > 1 ? 's' : ''}`
                      : 'Chat com casais'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {mensagensLoading ? '...' : (mensagensNaoLidas > 0 ? mensagensNaoLidas : 'Tudo lido')}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/cerimonialista/chat')}>
                Abrir chat
              </Button>
            </div>

            {/* Card Roteiro do Evento */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-info-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="timeline" size={20} color="var(--color-info)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Roteiro do evento</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    Timeline
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth onClick={() => router.push('/cerimonialista/roteiro')}>
                Gerenciar roteiro
              </Button>
            </div>

            {/* NOVO: Card Eventos dos Casais */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                border: '1px solid var(--color-border)',
                gridColumn: '1 / -1',
                cursor: 'pointer',
              }}
              onClick={() => router.push('/cerimonialista/eventos')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/cerimonialista/eventos')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-brand-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="mirror" size={20} color="var(--color-brand)" />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Eventos dos casais</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>
                    {eventosLoading ? '...' : eventosAtivos}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/cerimonialista/eventos');
                }}
              >
                Ver painéis espelhados
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
