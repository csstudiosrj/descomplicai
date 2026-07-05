import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTableAdmin from '@/components/admin/DataTableAdmin';
import fetchAPI from '../../utils/fetchAPI';

export default function AdminEventos() {
  const router = useRouter();
  const { usuario_id } = router.query;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [plano, setPlano] = useState('');
  const [memorial, setMemorial] = useState('');

  useEffect(() => {
    loadEventos();
  }, [page, search, status, plano, memorial, usuario_id]);

  async function loadEventos() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (plano) params.append('plano', plano);
      if (memorial) params.append('memorial_concluido', memorial);
      if (usuario_id) params.append('usuario_id', usuario_id);

      const res = await fetchAPI(`/api/admin/eventos?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar eventos');
      const json = await res.json();
      setData(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const memorialBadge = (concluido) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
      concluido ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {concluido ? 'Concluído' : 'Pendente'}
    </span>
  );

  const columns = [
    { key: 'nome_evento', label: 'Evento' },
    { key: 'data_evento', label: 'Data', render: (row) => row.data_evento ? new Date(row.data_evento).toLocaleDateString('pt-BR') : '-' },
    { key: 'status', label: 'Status' },
    { key: 'plano', label: 'Plano' },
    { key: 'memorial_concluido', label: 'Memorial', render: (row) => memorialBadge(row.memorial_concluido) },
    { key: 'casal', label: 'Casal', render: (row) => row.usuarios?.email || '-' },
    { key: 'cerimonialista', label: 'Cerimonialista', render: (row) => row.cerimonialistas?.nome || '-' },
    { key: 'criado_em', label: 'Criado em', render: (row) => new Date(row.criado_em).toLocaleDateString('pt-BR') },
  ];

  return (
    <AdminLayout title="Eventos">
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
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Status</option>
              <option value="rascunho">Rascunho</option>
              <option value="ativo">Ativo</option>
              <option value="concluido">Concluído</option>
            </select>
            <select
              value={plano}
              onChange={(e) => { setPlano(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Plano</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={memorial}
              onChange={(e) => { setMemorial(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Memorial</option>
              <option value="true">Concluído</option>
              <option value="false">Pendente</option>
            </select>
          </>
        )}
      />
    </AdminLayout>
  );
}
