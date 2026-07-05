import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTableAdmin from '@/components/admin/DataTableAdmin';
import Link from 'next/link';

export default function AdminUsuarios() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('todos');

  useEffect(() => {
    loadUsuarios();
  }, [page, search, tipo]);

  async function loadUsuarios() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.append('search', search);
      if (tipo && tipo !== 'todos') params.append('tipo', tipo);

      const res = await fetch(`/api/admin/usuarios?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar usuários');
      const json = await res.json();
      setData(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const tipoBadge = (tipo) => {
    const colors = {
      casal: 'bg-rose-100 text-rose-700',
      cerimonialista: 'bg-purple-100 text-purple-700',
      fornecedor: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[tipo] || 'bg-gray-100 text-gray-700'}`}>
        {tipo === 'casal' ? 'Casal' : tipo === 'cerimonialista' ? 'Cerimonialista' : 'Fornecedor'}
      </span>
    );
  };

  const statusBadge = (status) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
      status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
    }`}>
      {status === 'ativo' ? 'Ativo' : 'Inativo'}
    </span>
  );

  const columns = [
    { key: 'tipo', label: 'Tipo', render: (row) => tipoBadge(row.tipo) },
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'total_eventos', label: 'Eventos' },
    { key: 'ultimo_acesso', label: 'Último Acesso', render: (row) => new Date(row.ultimo_acesso).toLocaleDateString('pt-BR') },
    { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
    { key: 'acoes', label: '', render: (row) => (
      <Link
        href={`/admin/eventos?usuario_id=${row.id}`}
        className="text-rose-600 hover:text-rose-700 text-sm font-medium"
      >
        Ver eventos →
      </Link>
    )},
  ];

  return (
    <AdminLayout title="Usuários">
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
          <select
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="todos">Todos</option>
            <option value="casal">Casais</option>
            <option value="cerimonialista">Cerimonialistas</option>
            <option value="fornecedor">Fornecedores</option>
          </select>
        )}
      />
    </AdminLayout>
  );
}
