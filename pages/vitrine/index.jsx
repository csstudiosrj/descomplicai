import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Vitrine() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 12;

  useEffect(() => {
    fetchFornecedores();
  }, [categoria, busca, page]);

  async function fetchFornecedores() {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (busca) params.append('busca', busca);
    params.append('page', String(page));
    params.append('limit', String(limit));

    try {
      const res = await fetch(`/api/vitrine?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFornecedores(data.fornecedores);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Erro ao carregar vitrine:', err);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Head>
        <title>Vitrine de Fornecedores — Descomplicaí</title>
        <meta name="description" content="Encontre os melhores fornecedores para seu casamento" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm py-6">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800">Vitrine de Fornecedores</h1>
            <p className="text-gray-500 mt-1">Encontre os melhores profissionais para o seu grande dia</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPage(1); }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <select
              value={categoria}
              onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todas as categorias</option>
              <option value="buffet">Buffet</option>
              <option value="fotografia">Fotografia</option>
              <option value="musica">Música / DJ</option>
              <option value="decoracao">Decoração</option>
              <option value="vestuario">Vestuário</option>
              <option value="beleza">Beleza</option>
              <option value="transporte">Transporte</option>
              <option value="cerimonial">Cerimonial</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Carregando fornecedores...</p>
            </div>
          ) : fornecedores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum fornecedor encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fornecedores.map((f) => (
                <div key={f.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl">
                      {f.nome_fantasia?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{f.nome_fantasia}</h3>
                      <p className="text-sm text-gray-500 capitalize">{f.categoria} — {f.subcategoria}</p>
                    </div>
                  </div>
                  {f.descricao && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{f.descricao}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    {f.cidade && <span>📍 {f.cidade}{f.estado ? `, ${f.estado}` : ''}</span>}
                    {f.media_avaliacao > 0 && (
                      <span>⭐ {f.media_avaliacao.toFixed(1)} ({f.total_avaliacoes})</span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {f.site && (
                      <a href={f.site} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline text-sm">
                        Site
                      </a>
                    )}
                    {f.instagram && (
                      <a href={`https://instagram.com/${f.instagram}`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline text-sm">
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    page === i + 1
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
