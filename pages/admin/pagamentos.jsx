import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTableAdmin from '@/components/admin/DataTableAdmin';
import GraficoReceita from '@/components/admin/GraficoReceita';
import fetchAPI from '../../utils/fetchAPI';

export default function AdminPagamentos() {
  const [data, setData] = useState([]);
  const [receita, setReceita] = useState([]);
  const [totais, setTotais] = useState({ receita_total: 0, por_fonte: {}, por_mes: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tipo, setTipo] = useState('');
  const [status, setStatus] = useState('');
  const [periodo, setPeriodo] = useState(30);

  useEffect(() => {
    loadPagamentos();
  }, [page, tipo, status, periodo]);

  async function loadPagamentos() {
    setLoading(true);
    try {
      const dataInicio = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dataFim = new Date().toISOString().split('T')[0];

      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        data_inicio: dataInicio,
        data_fim: dataFim,
        agrupamento: periodo <= 30 ? 'dia' : periodo <= 90 ? 'semana' : 'mes',
      });
      if (tipo) params.append('tipo', tipo);
      if (status) params.append('status', status);

      const res = await fetchAPI(`/api/admin/pagamentos?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar pagamentos');
      const json = await res.json();
      setData(json.transacoes || []);
      setReceita(json.receita || []);
      setTotais(json.totais || { receita_total: 0, por_fonte: {}, por_mes: {} });
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = (status) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
      status === 'pago' ? 'bg-emerald-100 text-emerald-700' :
      status === 'pendente' ? 'bg-amber-100 text-amber-700' :
      'bg-red-100 text-red-700'
    }`}>
      {status === 'pago' ? 'Pago' : status === 'pendente' ? 'Pendente' : 'Falhou'}
    </span>
  );

  const columns = [
    { key: 'tipo', label: 'Tipo', render: (row) => (
      <span className="capitalize">{row.tipo}</span>
    )},
    { key: 'valor', label: 'Valor', render: (row) => `R$ ${parseFloat(row.valor).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
    { key: 'criado_em', label: 'Data', render: (row) => new Date(row.criado_em).toLocaleDateString('pt-BR') },
    { key: 'usuario', label: 'Usuário', render: (row) => row.usuarios?.email || '-' },
    { key: 'evento', label: 'Evento', render: (row) => row.eventos?.nome_evento || '-' },
  ];

  return (
    <AdminLayout title="Pagamentos">
      {/* Totalizadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Receita Total</p>
          <p className="text-2xl font-bold text-gray-900">R$ {totais.receita_total.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Por Fonte</p>
          <div className="space-y-1 text-sm">
            {Object.entries(totais.por_fonte).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize text-gray-600">{k}</span>
                <span className="font-medium">R$ {v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Por Mês</p>
          <div className="space-y-1 text-sm max-h-24 overflow-y-auto">
            {Object.entries(totais.por_mes).sort().map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-600">{k}</span>
                <span className="font-medium">R$ {v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="mb-6">
        <GraficoReceita
          data={receita}
          onPeriodChange={setPeriodo}
          periodoAtual={periodo}
        />
      </div>

      {/* Tabela */}
      <DataTableAdmin
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        filters={(
          <>
            <select
              value={tipo}
              onChange={(e) => { setTipo(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Tipo</option>
              <option value="pdf">PDF</option>
              <option value="assinatura">Assinatura</option>
              <option value="fornecedor">Fornecedor</option>
            </select>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="falhou">Falhou</option>
            </select>
          </>
        )}
      />
    </AdminLayout>
  );
}
