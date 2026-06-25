import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import FinanceiroResumo from '../../components/cerimonialista/FinanceiroResumo';
import FinanceiroLista from '../../components/cerimonialista/FinanceiroLista';
import FinanceiroModal from '../../components/cerimonialista/FinanceiroModal';
import { supabase } from '../../lib/supabase';

const TIPOS = [
  { id: 'receita', label: 'Receita', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  { id: 'despesa', label: 'Despesa', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
];

const CATEGORIAS = {
  receita: [
    { id: 'contrato', label: 'Contrato' },
    { id: 'sinal', label: 'Sinal' },
    { id: 'parcela', label: 'Parcela' },
    { id: 'adicional', label: 'Adicional' },
    { id: 'outro', label: 'Outro' },
  ],
  despesa: [
    { id: 'fornecedor', label: 'Fornecedor' },
    { id: 'equipe', label: 'Equipe' },
    { id: 'transporte', label: 'Transporte' },
    { id: 'material', label: 'Material' },
    { id: 'imposto', label: 'Imposto' },
    { id: 'outro', label: 'Outro' },
  ],
};

export default function FinanceiroCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista } = useAuth();
  const [lancamentos, setLancamentos] = useState([]);
  const [lancamentosLoading, setLancamentosLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [lancamentoEditando, setLancamentoEditando] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarLancamentos = useCallback(async () => {
    if (!cerimonialista?.id) return;
    setLancamentosLoading(true);
    const { data, error } = await supabase
      .from('cerimonialista_financeiro')
      .select('*')
      .eq('cerimonialista_id', cerimonialista.id)
      .order('data_vencimento', { ascending: false });

    if (!error && data) {
      setLancamentos(data);
    }
    setLancamentosLoading(false);
  }, [cerimonialista]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isCerimonialista && cerimonialista) {
      buscarLancamentos();
    }
  }, [isCerimonialista, cerimonialista, buscarLancamentos]);

  const handleNovoLancamento = () => {
    setLancamentoEditando(null);
    setModalOpen(true);
  };

  const handleEditarLancamento = (lancamento) => {
    setLancamentoEditando(lancamento);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setLancamentoEditando(null);
  };

  const handleLancamentoSalvo = () => {
    buscarLancamentos();
    showToast(lancamentoEditando ? 'Lançamento atualizado' : 'Lançamento criado');
  };

  const handleTogglePago = async (id, pago) => {
    const { error } = await supabase
      .from('cerimonialista_financeiro')
      .update({ pago: !pago })
      .eq('id', id);

    if (!error) {
      buscarLancamentos();
      showToast(!pago ? 'Marcado como pago' : 'Marcado como pendente');
    } else {
      showToast('Erro ao atualizar', 'error');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;
    const { error } = await supabase
      .from('cerimonialista_financeiro')
      .delete()
      .eq('id', id);

    if (!error) {
      buscarLancamentos();
      showToast('Lançamento excluído');
    } else {
      showToast('Erro ao excluir', 'error');
    }
  };

  const lancamentosFiltrados = lancamentos.filter((l) => {
    const matchTipo = filtroTipo === 'todos' || l.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || (filtroStatus === 'pago' && l.pago) || (filtroStatus === 'pendente' && !l.pago);
    return matchTipo && matchStatus;
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
        <title>Financeiro — Descomplicaí</title>
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
                Financeiro
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Controle de receitas e despesas
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleNovoLancamento}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="plus" size={16} />
              Novo Lançamento
            </span>
          </Button>
        </header>

        {/* Conteúdo */}
        <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
          {/* Resumo */}
          <FinanceiroResumo lancamentos={lancamentos} loading={lancamentosLoading} />

          {/* Filtros */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-6)',
              marginBottom: 'var(--space-4)',
              overflowX: 'auto',
              paddingBottom: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                Tipo:
              </span>
              {['todos', 'receita', 'despesa'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: filtroTipo === t ? 'var(--color-brand)' : 'var(--color-white)',
                    color: filtroTipo === t ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                Status:
              </span>
              {['todos', 'pago', 'pendente'].map((s) => (
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
                  {s === 'todos' ? 'Todos' : s === 'pago' ? 'Pagos' : 'Pendentes'}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <FinanceiroLista
            lancamentos={lancamentosFiltrados}
            loading={lancamentosLoading}
            tipos={TIPOS}
            categorias={CATEGORIAS}
            onTogglePago={handleTogglePago}
            onEditar={handleEditarLancamento}
            onExcluir={handleExcluir}
          />
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <FinanceiroModal
          lancamento={lancamentoEditando}
          cerimonialistaId={cerimonialista.id}
          tipos={TIPOS}
          categorias={CATEGORIAS}
          onClose={handleModalClose}
          onSalvo={handleLancamentoSalvo}
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
