import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import FunilMemorial from '@/components/admin/FunilMemorial';
import GraficoReceita from '@/components/admin/GraficoReceita';
import PaginaMaisAcessada from '@/components/admin/PaginaMaisAcessada';
import FornecedorAprovacao from '@/components/admin/FornecedorAprovacao';
import { apiPath, appPath } from '@/utils/apiPath';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch(apiPath(`/admin/dashboard?dias=${periodo}`));
        if (!res.ok) {
          if (res.status === 403) {
            window.location.href = appPath('/login');
            return;
          }
          throw new Error('Erro ao carregar dashboard');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [periodo]);

  const getMetricValue = (key) => {
    if (!data?.metrics) return 0;
    const m = data.metrics.find((m) => m.metrica === key);
    return m?.valor || 0;
  };

  const handleAprovar = async (id) => {
    const res = await fetch(apiPath('/admin/fornecedores'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: true }),
    });
    if (!res.ok) throw new Error('Erro ao aprovar');
    const dashRes = await fetch(apiPath(`/admin/dashboard?dias=${periodo}`));
    const dashData = await dashRes.json();
    setData(dashData);
  };

  const handleSuspender = async (id) => {
    const res = await fetch(apiPath('/admin/fornecedores'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: false }),
    });
    if (!res.ok) throw new Error('Erro ao suspender');
    const dashRes = await fetch(apiPath(`/admin/dashboard?dias=${periodo}`));
    const dashData = await dashRes.json();
    setData(dashData);
  };

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-danger-light)',
          textAlign: 'center',
        }}>
          <p style={{
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--font-medium)',
          }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-danger)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {loading && !data ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '16rem',
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-brand)',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      ) : (
        <>
          {/* Cards de metricas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}>
            <AdminMetricCard
              title="Casais Ativos"
              value={getMetricValue('casais_ativos').toLocaleString('pt-BR')}
              change={0}
              icon="casais"
              color="brand"
            />
            <AdminMetricCard
              title="Memoriais Completados"
              value={getMetricValue('memoriais_completados').toLocaleString('pt-BR')}
              change={0}
              icon="memoriais"
              color="success"
            />
            <AdminMetricCard
              title="Memoriais Abandonados"
              value={getMetricValue('memoriais_abandonados').toLocaleString('pt-BR')}
              change={0}
              icon="alerta"
              color="warning"
            />
            <AdminMetricCard
              title="Fornecedores Pagantes"
              value={getMetricValue('fornecedores_pagantes').toLocaleString('pt-BR')}
              change={0}
              icon="fornecedores"
              color="info"
            />
            <AdminMetricCard
              title="Cerimonialistas Ativos"
              value={getMetricValue('cerimonialistas_ativos').toLocaleString('pt-BR')}
              change={0}
              icon="cerimonialistas"
              color="brand"
            />
            <AdminMetricCard
              title="Receita Total (30d)"
              value={`R$ ${getMetricValue('receita_total_30d').toLocaleString('pt-BR')}`}
              change={0}
              icon="receita"
              color="success"
            />
          </div>

          {/* Graficos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
          }}>
            <FunilMemorial data={data?.abandono || []} />
            <GraficoReceita
              data={data?.receita || []}
              onPeriodChange={setPeriodo}
              periodoAtual={periodo}
            />
          </div>

          {/* Paginas mais acessadas + Fornecedores pendentes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
          }}>
            <PaginaMaisAcessada data={data?.paginas || []} />
            <FornecedorAprovacao
              fornecedores={data?.fornecedoresPendentes || []}
              onAprovar={handleAprovar}
              onSuspender={handleSuspender}
            />
          </div>

          {/* Alertas */}
          {(data?.alertas?.eventosSemMemorial?.length > 0 || data?.alertas?.trialExpirando?.length > 0) && (
            <div style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-warning-light)',
              border: '1px solid var(--color-warning)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-warning)',
                marginBottom: 'var(--space-4)',
              }}>Alertas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {data.alertas.eventosSemMemorial?.map((ev) => (
                  <div key={ev.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                  }}>
                    <span role="img" aria-label="evento">📅</span>
                    <span>Evento <strong>{ev.nome_evento}</strong> sem memorial concluido ha mais de 30 dias</span>
                  </div>
                ))}
                {data.alertas.trialExpirando?.map((f) => (
                  <div key={f.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                  }}>
                    <span role="img" aria-label="fornecedor">🏢</span>
                    <span>Fornecedor <strong>{f.nome_empresa}</strong> com trial expirando</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
