// Painel do Fornecedor — visão geral, métricas, assinatura, avaliações, oportunidades
// Dependências: React, next/head, next/router, useAuth, Icon, GraficoMetricas, MetricasCardPainel, EstrelasAvaliacao

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import GraficoMetricas from '../../components/fornecedores/GraficoMetricas';
import MetricasCardPainel from '../../components/fornecedores/MetricasCardPainel';
import EstrelasAvaliacao from '../../components/fornecedores/EstrelasAvaliacao';
import fetchAPI from '../../utils/fetchAPI';

export default function PainelFornecedorPage() {
  const router = useRouter();
  const { user, loading: authLoading, supabase } = useAuth();
  const [dados, setDados] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perfilCompletude, setPerfilCompletude] = useState(60);

  const fetchDados = useCallback(async () => {
    if (!user) return;
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;

      const [metricasRes, avaliacoesRes] = await Promise.all([
        fetchAPI('/api/fornecedores/metricas', { headers: { Authorization: `Bearer ${token}` } }),
        fetchAPI('/api/fornecedores/avaliacoes', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (metricasRes.ok) {
        const m = await metricasRes.json();
        setDados(m);
        setPerfilCompletude(m.metricas?.totalAvaliacoes > 0 ? 75 : 60);
      }
      if (avaliacoesRes.ok) {
        setAvaliacoes(await avaliacoesRes.json());
      }
    } catch (err) {
      console.error('Erro ao carregar painel:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) fetchDados();
  }, [user, authLoading, router, fetchDados]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando painel...</div>
      </div>
    );
  }

  if (!dados) return null;

  const { fornecedor, metricas, grafico, oportunidades } = dados;
  const planoLabel = { gratuito: 'Gratuito', basico: 'Básico', premium: 'Premium' }[fornecedor.plano] || fornecedor.plano;

  const badgeStyle = {
    gratuito: { background: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
    basico: { background: 'var(--color-brand-lighter)', color: 'var(--color-brand-dark)', border: '1px solid var(--color-brand-light)' },
    premium: { background: 'var(--color-success-light)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }
  }[fornecedor.plano] || {};

  return (
    <>
      <Head><title>Painel do Fornecedor — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', paddingBottom: 'var(--space-12)' }}>

        <header style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-4) var(--space-6)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  {fornecedor.nomeEmpresa}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 'var(--font-medium)', 
                    padding: '4px 10px', 
                    borderRadius: 'var(--radius-full)', 
                    ...badgeStyle 
                  }}>
                    Plano {planoLabel}
                  </span>
                  {perfilCompletude < 100 && (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Perfil {perfilCompletude}% completo — adicione fotos para aparecer melhor
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push('/fornecedor/perfil')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-brand)',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-brand)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-brand-lighter)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-white)'; }}
              >
                <Icon name="eye" size={16} />
                Ver meu perfil público
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

          <section aria-labelledby="metricas-titulo">
            <h2 id="metricas-titulo" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="chart" size={20} color="var(--color-brand)" />
              Métricas dos últimos 30 dias
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <MetricasCardPainel titulo="Visualizações do perfil" valor={metricas.visualizacoes} variacao={12} />
              <MetricasCardPainel titulo="Cliques no contato" valor={metricas.cliques} variacao={-5} />
              <MetricasCardPainel titulo="Avaliações recebidas" valor={`${metricas.avaliacaoMedia} (${metricas.totalAvaliacoes})`} variacao={8} />
            </div>
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>Visualizações por dia</h3>
              <GraficoMetricas dados={grafico} />
            </div>
          </section>

          <section aria-labelledby="assinatura-titulo">
            <h2 id="assinatura-titulo" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="dollar" size={20} color="var(--color-brand)" />
              Status da assinatura
            </h2>

            {fornecedor.plano === 'gratuito' && (
              <div style={{ backgroundColor: 'var(--color-warning-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', border: '1px solid var(--color-warning)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
                  Seu perfil está invisível nas buscas
                </div>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', maxWidth: '500px', margin: '0 auto var(--space-5)' }}>
                  Casais não conseguem encontrar você enquanto estiver no plano Gratuito. Ative seu perfil para começar a receber leads qualificados.
                </p>
                <button
                  onClick={() => { /* TODO: redirecionar para checkout MP */ }}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'var(--color-brand)',
                    color: 'var(--color-white)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-bold)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-brand-dark)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-brand)'; }}
                >
                  Ativar perfil — R$ 19,90/mês
                </button>
              </div>
            )}

            {fornecedor.plano === 'basico' && (
              <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Plano atual</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>Básico — R$ 19,90/mês</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>Próxima cobrança: em 30 dias</div>
                  </div>
                  <button
                    onClick={() => { /* TODO: redirecionar para upgrade */ }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-brand)',
                      backgroundColor: 'var(--color-white)',
                      color: 'var(--color-brand)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer'
                    }}
                  >
                    Upgrade para Premium
                  </button>
                </div>
              </div>
            )}

            {fornecedor.plano === 'premium' && (
              <div style={{ backgroundColor: 'var(--color-success-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--color-success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-success)' }}>Plano atual</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-success)' }}>Premium</div>
                  </div>
                  <button
                    onClick={() => { /* TODO: gerenciar assinatura */ }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-success)',
                      backgroundColor: 'var(--color-white)',
                      color: 'var(--color-success)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer'
                    }}
                  >
                    Gerenciar assinatura
                  </button>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="avaliacoes-titulo">
            <h2 id="avaliacoes-titulo" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="users" size={20} color="var(--color-brand)" />
              Avaliações recentes
            </h2>

            {avaliacoes && avaliacoes.totalAvaliacoes > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <EstrelasAvaliacao nota={avaliacoes.mediaFornecedor} tamanho={20} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
                      {avaliacoes.mediaFornecedor}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Média da categoria na plataforma: {avaliacoes.mediaCategoria}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {avaliacoes.avaliacoes.map((av) => (
                    <div key={av.id} style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        <EstrelasAvaliacao nota={av.nota} tamanho={14} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(av.criado_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-2)' }}>
                        {av.comentario || 'Sem comentário'}
                      </p>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Casal: {av.nome_casal || 'Anônimo'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <Icon name="users" size={32} color="var(--color-text-muted)" />
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}>
                  Nenhuma avaliação ainda. Complete mais eventos para receber avaliações.
                </p>
              </div>
            )}
          </section>

          <section aria-labelledby="oportunidades-titulo">
            <h2 id="oportunidades-titulo" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="search" size={20} color="var(--color-brand)" />
              Oportunidades
            </h2>
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{oportunidades} casamentos</strong> planejados em {fornecedor.cidade || 'sua cidade'} nos próximos 6 meses ainda sem {fornecedor.categoria || 'fornecedor'} definido.
              </p>
              <button
                onClick={() => {
                  if (fornecedor.plano === 'gratuito') {
                    alert('Ative seu perfil para aparecer para esses casais');
                  } else {
                    alert('Seu perfil já está ativo e visível para esses casais!');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--color-brand)',
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-brand-dark)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-brand)'; }}
              >
                Quero aparecer para esses casais
              </button>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
