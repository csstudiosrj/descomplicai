import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTableAdmin from '@/components/admin/DataTableAdmin';
import fetchAPI from '../../utils/fetchAPI';

export default function AdminFornecedores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [ativo, setAtivo] = useState('');
  const [plano, setPlano] = useState('');

  useEffect(() => {
    loadFornecedores();
  }, [page, search, ativo, plano]);

  async function loadFornecedores() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.append('search', search);
      if (ativo !== '') params.append('ativo', ativo);
      if (plano) params.append('plano', plano);

      const res = await fetchAPI(`/api/admin/fornecedores?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar fornecedores');
      const json = await res.json();
      setData(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAtivo(id, novoStatus) {
    try {
      const res = await fetchAPI('/api/admin/fornecedores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo: novoStatus }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      loadFornecedores();
    } catch (err) {
      alert(err.message);
    }
  }

  const statusBadge = (ativo) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
      ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
    }`}>
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  );

  const planoBadge = (plano) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
      plano === 'trial' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {plano === 'trial' ? 'Trial' : plano === 'premium' ? 'Premium' : 'Free'}
    </span>
  );

  const columns = [
    { key: 'nome_empresa', label: 'Empresa' },
    { key: 'email', label: 'Email' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'UF' },
    { key: 'ativo', label: 'Status', render: (row) => statusBadge(row.ativo) },
    { key: 'plano', label: 'Plano', render: (row) => planoBadge(row.plano) },
    { key: 'avaliacao_media', label: 'Avaliação', render: (row) => row.avaliacao_media ? `⭐ ${row.avaliacao_media}` : '-' },
    { key: 'total_avaliacoes', label: 'Avaliações' },
    { key: 'acoes', label: '', render: (row) => (
      <button
        onClick={() => handleToggleAtivo(row.id, !row.ativo)}
        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
          row.ativo
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
        }`}
      >
        {row.ativo ? 'Suspender' : 'Aprovar'}
      </button>
    )},
  ];

  return (
    <AdminLayout title="Fornecedores">
      <DataTableAdmin
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSearch={setSearch}
        searchValue={search}
        filters={(
          <>
            <select
              value={ativo}
              onChange={(e) => { setAtivo(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Status</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
            <select
              value={plano}
              onChange={(e) => { setPlano(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Plano</option>
              <option value="trial">Trial</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </>
        )}
      />
    </AdminLayout>
  );
}
