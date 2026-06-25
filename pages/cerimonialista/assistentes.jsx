import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import AssistenteCard from '../../components/cerimonialista/AssistenteCard';
import AssistenteModal from '../../components/cerimonialista/AssistenteModal';
import { supabase } from '../../lib/supabase';

const ACESSOS = [
  { id: 'operacional', label: 'Operacional', color: 'var(--color-brand)', bg: 'var(--color-brand-light)' },
  { id: 'admin', label: 'Administrador', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
  { id: 'visualizador', label: 'Visualizador', color: 'var(--color-info)', bg: 'var(--color-info-light)' },
];

export default function AssistentesCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista } = useAuth();
  const [assistentes, setAssistentes] = useState([]);
  const [assistentesLoading, setAssistentesLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAcesso, setFiltroAcesso] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [assistenteEditando, setAssistenteEditando] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarAssistentes = useCallback(async () => {
    if (!cerimonialista?.id) return;
    setAssistentesLoading(true);
    const { data, error } = await supabase
      .from('cerimonialista_assistentes')
      .select('*')
      .eq('cerimonialista_id', cerimonialista.id)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setAssistentes(data);
    }
    setAssistentesLoading(false);
  }, [cerimonialista]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isCerimonialista && cerimonialista) {
      buscarAssistentes();
    }
  }, [isCerimonialista, cerimonialista, buscarAssistentes]);

  const handleNovoAssistente = () => {
    setAssistenteEditando(null);
    setModalOpen(true);
  };

  const handleEditarAssistente = (assistente) => {
    setAssistenteEditando(assistente);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setAssistenteEditando(null);
  };

  const handleAssistenteSalvo = () => {
    buscarAssistentes();
    showToast(assistenteEditando ? 'Assistente atualizado' : 'Assistente adicionado');
  };

  const handleToggleAtivo = async (id, ativo) => {
    const { error } = await supabase
      .from('cerimonialista_assistentes')
      .update({ ativo: !ativo })
      .eq('id', id);

    if (!error) {
      buscarAssistentes();
      showToast(!ativo ? 'Assistente ativado' : 'Assistente desativado');
    } else {
      showToast('Erro ao atualizar', 'error');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este assistente?')) return;
    const { error } = await supabase
      .from('cerimonialista_assistentes')
      .delete()
      .eq('id', id);

    if (!error) {
      buscarAssistentes();
      showToast('Assistente removido');
    } else {
      showToast('Erro ao remover', 'error');
    }
  };

  const assistentesFiltrados = assistentes.filter((a) => {
    const matchBusca = !busca || a.nome.toLowerCase().includes(busca.toLowerCase()) || a.email.toLowerCase().includes(busca.toLowerCase());
    const matchAcesso = filtroAcesso === 'todos' || a.acesso === filtroAcesso;
    const matchStatus = filtroStatus === 'todos' || (filtroStatus === 'ativo' && a.ativo) || (filtroStatus === 'inativo' && !a.ativo);
    return matchBusca && matchAcesso && matchStatus;
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
        <title>Equipe — Descomplicaí</title>
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
                Equipe
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Gerencie assistentes e permissões
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleNovoAssistente}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="userPlus" size={16} />
              Novo Assistente
            </span>
          </Button>
        </header>

        {/* Conteúdo */}
        <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                placeholder="Buscar por nome ou e-mail..."
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

            {/* Filtros de acesso e status */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                overflowX: 'auto',
                paddingBottom: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                  Acesso:
                </span>
                {['todos', 'operacional', 'admin', 'visualizador'].map((a) => (
                  <button
                    key={a}
                    onClick={() => setFiltroAcesso(a)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: filtroAcesso === a ? 'var(--color-brand)' : 'var(--color-white)',
                      color: filtroAcesso === a ? 'var(--color-white)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {a === 'todos' ? 'Todos' : ACESSOS.find((ac) => ac.id === a)?.label || a}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                  Status:
                </span>
                {['todos', 'ativo', 'inativo'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFiltroStatus(s)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: filtroStatus === s ? 'var(--color-brand)' : 'var(--color-white)',
                      color: filtroStatus === s ? 'var(--color-white)' : 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Inativos'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista */}
          {assistentesLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando equipe...</p>
            </div>
          ) : assistentesFiltrados.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-12) var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Icon name="users" size={48} color="var(--color-text-muted)" />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text-primary)',
                  marginTop: 'var(--space-4)',
                }}
              >
                {busca || filtroAcesso !== 'todos' || filtroStatus !== 'todos' ? 'Nenhum resultado' : 'Nenhum assistente'}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
                {busca || filtroAcesso !== 'todos' || filtroStatus !== 'todos'
                  ? 'Tente ajustar os filtros.'
                  : 'Adicione seu primeiro assistente.'}
              </p>
              {!busca && filtroAcesso === 'todos' && filtroStatus === 'todos' && (
                <Button variant="primary" onClick={handleNovoAssistente} style={{ marginTop: 'var(--space-6)' }}>
                  Adicionar assistente
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
              {assistentesFiltrados.map((assistente) => (
                <AssistenteCard
                  key={assistente.id}
                  assistente={assistente}
                  acessos={ACESSOS}
                  onToggleAtivo={handleToggleAtivo}
                  onEditar={handleEditarAssistente}
                  onExcluir={handleExcluir}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <AssistenteModal
          assistente={assistenteEditando}
          cerimonialistaId={cerimonialista.id}
          acessos={ACESSOS}
          onClose={handleModalClose}
          onSalvo={handleAssistenteSalvo}
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
