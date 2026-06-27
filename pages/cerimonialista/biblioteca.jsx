import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import ModeloCard from '../../components/cerimonialista/ModeloCard';
import ModeloModal from '../../components/cerimonialista/ModeloModal';
import BibliotecaFornecedores from '../../components/cerimonialista/BibliotecaFornecedores';
import { supabase } from '../../lib/supabase';

const TIPOS = [
  { id: 'contrato', label: 'Contrato', color: 'var(--color-brand)', bg: 'var(--color-brand-light)' },
  { id: 'roteiro', label: 'Roteiro', color: 'var(--color-info)', bg: 'var(--color-info-light)' },
  { id: 'checklist', label: 'Checklist', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  { id: 'proposta', label: 'Proposta', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  { id: 'orcamento', label: 'Orçamento', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
  { id: 'outro', label: 'Outro', color: 'var(--color-text-muted)', bg: 'var(--color-off-white)' },
];

export default function BibliotecaCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista } = useAuth();
  const [modelos, setModelos] = useState([]);
  const [modelosLoading, setModelosLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [modeloEditando, setModeloEditando] = useState(null);
  const [toast, setToast] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('modelos');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarModelos = useCallback(async () => {
    if (!cerimonialista?.id) return;
    setModelosLoading(true);
    const { data, error } = await supabase
      .from('cerimonialista_modelos')
      .select('*')
      .eq('cerimonialista_id', cerimonialista.id)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setModelos(data);
    }
    setModelosLoading(false);
  }, [cerimonialista]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isCerimonialista && cerimonialista) {
      buscarModelos();
    }
  }, [isCerimonialista, cerimonialista, buscarModelos]);

  const handleNovoModelo = () => {
    setModeloEditando(null);
    setModalOpen(true);
  };

  const handleEditarModelo = (modelo) => {
    setModeloEditando(modelo);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModeloEditando(null);
  };

  const handleModeloSalvo = () => {
    buscarModelos();
    showToast(modeloEditando ? 'Modelo atualizado com sucesso' : 'Modelo criado com sucesso');
  };

  const handleExcluirModelo = async (modeloId) => {
    if (!window.confirm('Tem certeza que deseja excluir este modelo?')) return;
    const { error } = await supabase
      .from('cerimonialista_modelos')
      .delete()
      .eq('id', modeloId);

    if (!error) {
      buscarModelos();
      showToast('Modelo excluído com sucesso');
    } else {
      showToast('Erro ao excluir modelo', 'error');
    }
  };

  const handleCopiarModelo = async (modelo) => {
    const { error } = await supabase
      .from('cerimonialista_modelos')
      .insert({
        cerimonialista_id: cerimonialista.id,
        tipo: modelo.tipo,
        nome: `${modelo.nome} (cópia)`,
        conteudo: modelo.conteudo,
        variaveis: modelo.variaveis,
      });

    if (!error) {
      buscarModelos();
      showToast('Modelo duplicado com sucesso');
    } else {
      showToast('Erro ao duplicar modelo', 'error');
    }
  };

  const modelosFiltrados = modelos.filter((m) => {
    const matchBusca = !busca || m.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = tipoFiltro === 'todos' || m.tipo === tipoFiltro;
    return matchBusca && matchTipo;
  });

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

  return (
    <>
      <Head>
        <title>Biblioteca — Descomplicaí</title>
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
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => router.push('/cerimonialista/painel')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Voltar ao painel"
            >
              <Icon name="back" size={22} />
            </button>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Biblioteca
              </h1>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                <button
                  onClick={() => setAbaAtiva('modelos')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: abaAtiva === 'modelos' ? '2px solid var(--color-brand)' : '2px solid transparent',
                    color: abaAtiva === 'modelos' ? 'var(--color-brand)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer',
                    padding: 'var(--space-2) 0',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Modelos
                </button>
                <button
                  onClick={() => setAbaAtiva('fornecedores')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: abaAtiva === 'fornecedores' ? '2px solid var(--color-brand)' : '2px solid transparent',
                    color: abaAtiva === 'fornecedores' ? 'var(--color-brand)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer',
                    padding: 'var(--space-2) 0',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  Fornecedores favoritos
                </button>
              </div>
            </div>
          </div>
          {abaAtiva === 'modelos' && (
            <Button variant="primary" size="sm" onClick={handleNovoModelo}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Icon name="plus" size={16} />
                Novo Modelo
              </span>
            </Button>
          )}
        </header>

        {/* Conteúdo */}
        <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
          {abaAtiva === 'modelos' ? (
            <>
              {/* Filtros */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                {/* Busca */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name="search"
                    size={18}
                    color="var(--color-text-muted)"
                    style={{ position: 'absolute', left: 'var(--space-3)', pointerEvents: 'none' }}
                  />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar modelos..."
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
                      style={{
                        position: 'absolute',
                        right: 'var(--space-3)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                      }}
                      aria-label="Limpar busca"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>

                {/* Filtro de tipo (scroll horizontal mobile) */}
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    overflowX: 'auto',
                    paddingBottom: 'var(--space-2)',
                    scrollbarWidth: 'none',
                  }}
                >
                  <button
                    onClick={() => setTipoFiltro('todos')}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: tipoFiltro === 'todos' ? 'var(--color-brand)' : 'var(--color-white)',
                      color: tipoFiltro === 'todos' ? 'var(--color-white)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    Todos
                  </button>
                  {TIPOS.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setTipoFiltro(tipo.id)}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: tipoFiltro === tipo.id ? tipo.color : 'var(--color-white)',
                        color: tipoFiltro === tipo.id ? 'var(--color-white)' : 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de modelos */}
              {modelosLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando modelos...</p>
                </div>
              ) : modelosFiltrados.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-12) var(--space-4)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Icon name="template" size={48} color="var(--color-text-muted)" />
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-lg)',
                      color: 'var(--color-text-primary)',
                      marginTop: 'var(--space-4)',
                    }}
                  >
                    {busca || tipoFiltro !== 'todos' ? 'Nenhum modelo encontrado' : 'Nenhum modelo ainda'}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                    {busca || tipoFiltro !== 'todos'
                      ? 'Tente ajustar os filtros de busca.'
                      : 'Crie seu primeiro modelo para começar.'}
                  </p>
                  {!busca && tipoFiltro === 'todos' && (
                    <Button variant="primary" onClick={handleNovoModelo} style={{ marginTop: 'var(--space-6)' }}>
                      Criar modelo
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 'var(--space-4)',
                  }}
                >
                  {modelosFiltrados.map((modelo) => (
                    <ModeloCard
                      key={modelo.id}
                      modelo={modelo}
                      tipos={TIPOS}
                      onEditar={handleEditarModelo}
                      onCopiar={handleCopiarModelo}
                      onExcluir={handleExcluirModelo}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <BibliotecaFornecedores cerimonialistaId={cerimonialista.id} />
          )}
        </main>
      </div>

      {/* Modal */}
      {abaAtiva === 'modelos' && modalOpen && (
        <ModeloModal
          modelo={modeloEditando}
          cerimonialistaId={cerimonialista.id}
          tipos={TIPOS}
          onClose={handleModalClose}
          onSalvo={handleModeloSalvo}
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
    </>
  );
}
