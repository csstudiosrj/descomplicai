import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import BibliotecaFornecedoresModal from './BibliotecaFornecedoresModal';
import {
  CATEGORIAS_PRINCIPAIS,
  getLabelCategoriaPrincipalPorId,
} from '../../utils/catalogoFornecedores';

export default function BibliotecaFornecedores({ cerimonialistaId }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [favoritoEditando, setFavoritoEditando] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarFavoritos = useCallback(async () => {
    if (!cerimonialistaId) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/cerimonialista/favoritos/listar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.favoritos) {
        setFavoritos(json.favoritos);
      }
    } catch (err) {
      console.error('[BibliotecaFornecedores] erro ao buscar:', err);
    } finally {
      setLoading(false);
    }
  }, [cerimonialistaId]);

  useEffect(() => {
    buscarFavoritos();
  }, [buscarFavoritos]);

  const handleNovo = () => {
    setFavoritoEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (favorito) => {
    setFavoritoEditando(favorito);
    setModalOpen(true);
  };

  const handleSalvo = () => {
    buscarFavoritos();
    showToast(favoritoEditando ? 'Fornecedor atualizado' : 'Fornecedor adicionado aos favoritos');
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este fornecedor dos favoritos?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch(`/api/cerimonialista/favoritos/deletar?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        buscarFavoritos();
        showToast('Fornecedor removido dos favoritos');
      } else {
        showToast('Erro ao remover', 'error');
      }
    } catch (err) {
      showToast('Erro ao remover', 'error');
    }
  };

  const favoritosFiltrados = favoritos.filter((f) => {
    const matchBusca = !busca || f.nome_fornecedor.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todas' || f.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  // Agrupar por categoria
  const agrupados = favoritosFiltrados.reduce((acc, f) => {
    const cat = f.categoria || 'outro';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const ordemCategorias = CATEGORIAS_PRINCIPAIS.map(c => c.id);
  const categoriasOrdenadas = Object.keys(agrupados).sort(
    (a, b) => ordemCategorias.indexOf(a) - ordemCategorias.indexOf(b)
  );

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {/* Busca */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Icon name="search" size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 'var(--space-3)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fornecedores favoritos..."
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              style={{ position: 'absolute', right: 'var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              aria-label="Limpar busca"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Filtro de categoria */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCategoriaFiltro('todas')}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: categoriaFiltro === 'todas' ? 'var(--color-brand)' : 'var(--color-white)',
              color: categoriaFiltro === 'todas' ? 'var(--color-white)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
          >
            Todas
          </button>
          {CATEGORIAS_PRINCIPAIS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: categoriaFiltro === cat.id ? 'var(--color-brand)' : 'var(--color-white)',
                color: categoriaFiltro === cat.id ? 'var(--color-white)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Botão adicionar */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Button variant="primary" size="sm" onClick={handleNovo}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="plus" size={16} />
            Adicionar fornecedor
          </span>
        </Button>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando favoritos...</p>
        </div>
      ) : favoritosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <Icon name="heart" size={48} color="var(--color-text-muted)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginTop: 'var(--space-4)' }}>
            {busca || categoriaFiltro !== 'todas' ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor favorito ainda'}
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            {busca || categoriaFiltro !== 'todas'
              ? 'Tente ajustar os filtros de busca.'
              : 'Adicione fornecedores a sua biblioteca pessoal.'}
          </p>
          {!busca && categoriaFiltro === 'todas' && (
            <Button variant="primary" onClick={handleNovo} style={{ marginTop: 'var(--space-6)' }}>
              Adicionar fornecedor
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {categoriasOrdenadas.map((catId) => (
            <div key={catId}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-brand)',
                marginBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <Icon name="tag" size={16} />
                {getLabelCategoriaPrincipalPorId(catId)}
                <Badge variant="default" size="sm" pill>{agrupados[catId].length}</Badge>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                {agrupados[catId].map((f) => (
                  <Card key={f.id} variant="default" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                      <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', margin: 0, fontSize: 'var(--text-base)' }}>
                        {f.nome_fornecedor}
                      </h4>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button
                          onClick={() => handleEditar(f)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 'var(--space-1)' }}
                          aria-label="Editar fornecedor"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletar(f.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 'var(--space-1)' }}
                          aria-label="Remover dos favoritos"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                    {f.telefone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                        <Icon name="phone" size={14} />
                        {f.telefone}
                      </div>
                    )}
                    {f.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                        <Icon name="mail" size={14} />
                        {f.email}
                      </div>
                    )}
                    {f.instagram && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                        <Icon name="link" size={14} />
                        @{f.instagram}
                      </div>
                    )}
                    {f.notas_internas && (
                      <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {f.notas_internas}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <BibliotecaFornecedoresModal
          favorito={favoritoEditando}
          cerimonialistaId={cerimonialistaId}
          onClose={() => { setModalOpen(false); setFavoritoEditando(null); }}
          onSalvo={handleSalvo}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 'var(--z-toast)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 300ms ease',
          }}
        >
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
