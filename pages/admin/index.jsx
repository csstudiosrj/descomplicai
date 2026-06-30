import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import FunilMemorial from '@/components/admin/FunilMemorial';
import GraficoReceita from '@/components/admin/GraficoReceita';
import PaginaMaisAcessada from '@/components/admin/PaginaMaisAcessada';
import FornecedorAprovacao from '@/components/admin/FornecedorAprovacao';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/dashboard?dias=${periodo}`);
        if (!res.ok) {
          if (res.status === 403) {
            window.location.href = '/login';
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
    const res = await fetch('/api/admin/fornecedores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: true }),
    });
    if (!res.ok) throw new Error('Erro ao aprovar');
    // Recarrega dashboard
    const dashRes = await fetch(`/api/admin/dashboard?dias=${periodo}`);
    const dashData = await dashRes.json();
    setData(dashData);
  };

  const handleSuspender = async (id) => {
    const res = await fetch('/api/admin/fornecedores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: false }),
    });
    if (!res.ok) throw new Error('Erro ao suspender');
    const dashRes = await fetch(`/api/admin/dashboard?dias=${periodo}`);
    const dashData = await dashRes.json();
    setData(dashData);
  };

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
        </div>
      ) : (
        <>
          {/* Cards de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <AdminMetricCard
              title="Casais Ativos"
              value={getMetricValue('casais_ativos').toLocaleString('pt-BR')}
              change={0}
              icon="💑"
              color="rose"
            />
            <AdminMetricCard
              title="Memoriais Completados"
              value={getMetricValue('memoriais_completados').toLocaleString('pt-BR')}
              change={0}
              icon="✅"
              color="emerald"
            />
            <AdminMetricCard
              title="Memoriais Abandonados"
              value={getMetricValue('memoriais_abandonados').toLocaleString('pt-BR')}
              change={0}
              icon="⚠️"
              color="amber"
            />
            <AdminMetricCard
              title="Fornecedores Pagantes"
              value={getMetricValue('fornecedores_pagantes').toLocaleString('pt-BR')}
              change={0}
              icon="🏢"
              color="blue"
            />
            <AdminMetricCard
              title="Cerimonialistas Ativos"
              value={getMetricValue('cerimonialistas_ativos').toLocaleString('pt-BR')}
              change={0}
              icon="🎩"
              color="purple"
            />
            <AdminMetricCard
              title="Receita Total (30d)"
              value={`R$ ${getMetricValue('receita_total_30d').toLocaleString('pt-BR')}`}
              change={0}
              icon="💰"
              color="emerald"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <FunilMemorial data={data?.abandono || []} />
            <GraficoReceita
              data={data?.receita || []}
              onPeriodChange={setPeriodo}
              periodoAtual={periodo}
            />
          </div>

          {/* Páginas mais acessadas + Fornecedores pendentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PaginaMaisAcessada data={data?.paginas || []} />
            <FornecedorAprovacao
              fornecedores={data?.fornecedoresPendentes || []}
              onAprovar={handleAprovar}
              onSuspender={handleSuspender}
            />
          </div>

          {/* Alertas */}
          {(data?.alertas?.eventosSemMemorial?.length > 0 || data?.alertas?.trialExpirando?.length > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">⚠️ Alertas</h3>
              <div className="space-y-3">
                {data.alertas.eventosSemMemorial?.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 text-sm text-amber-700">
                    <span>📅</span>
                    <span>Evento <strong>{ev.nome_evento}</strong> sem memorial concluído há mais de 30 dias</span>
                  </div>
                ))}
                {data.alertas.trialExpirando?.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 text-sm text-amber-700">
                    <span>🏢</span>
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
