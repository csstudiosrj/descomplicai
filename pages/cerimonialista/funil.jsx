import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import FunilKanban from '../../components/cerimonialista/FunilKanban';
import LeadModal from '../../components/cerimonialista/LeadModal';
import { supabase } from '../../lib/supabase';

const ESTAGIOS = [
  { id: 'contato_inicial', label: 'Contato Inicial', color: 'var(--color-brand)', bg: 'var(--color-brand-light)' },
  { id: 'orcamento_enviado', label: 'Orçamento Enviado', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  { id: 'contratado', label: 'Contratado', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  { id: 'descartado', label: 'Descartado', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
];

export default function FunilCerimonialista() {
  const router = useRouter();
  const { user, loading, cerimonialista, isCerimonialista } = useAuth();
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [leadEditando, setLeadEditando] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const buscarLeads = useCallback(async () => {
    if (!cerimonialista?.id) return;
    setLeadsLoading(true);
    const { data, error } = await supabase
      .from('cerimonialista_leads')
      .select('*')
      .eq('cerimonialista_id', cerimonialista.id)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
    setLeadsLoading(false);
  }, [cerimonialista]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (isCerimonialista && cerimonialista) {
      buscarLeads();
    }
  }, [isCerimonialista, cerimonialista, buscarLeads]);

  const handleNovoLead = () => {
    setLeadEditando(null);
    setModalOpen(true);
  };

  const handleEditarLead = (lead) => {
    setLeadEditando(lead);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setLeadEditando(null);
  };

  const handleLeadSalvo = () => {
    buscarLeads();
    showToast(leadEditando ? 'Lead atualizado com sucesso' : 'Lead criado com sucesso');
  };

  const handleMoverEstagio = async (leadId, novoEstagio) => {
    const { error } = await supabase
      .from('cerimonialista_leads')
      .update({ estagio: novoEstagio, atualizado_em: new Date().toISOString() })
      .eq('id', leadId);

    if (!error) {
      buscarLeads();
      showToast('Lead movido com sucesso');
    } else {
      showToast('Erro ao mover lead', 'error');
    }
  };

  const handleExcluirLead = async (leadId) => {
    if (!window.confirm('Tem certeza que deseja excluir este lead?')) return;
    const { error } = await supabase
      .from('cerimonialista_leads')
      .delete()
      .eq('id', leadId);

    if (!error) {
      buscarLeads();
      showToast('Lead excluído com sucesso');
    } else {
      showToast('Erro ao excluir lead', 'error');
    }
  };

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
        <title>Funil de Leads — Descomplicaí</title>
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
                Funil de Leads
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Gerencie seus leads de vendas
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleNovoLead}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="userPlus" size={16} />
              Novo Lead
            </span>
          </Button>
        </header>

        {/* Conteúdo */}
        <main style={{ padding: 'var(--space-5)', maxWidth: '960px', margin: '0 auto' }}>
          {leadsLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Carregando leads...</p>
            </div>
          ) : (
            <FunilKanban
              leads={leads}
              estagios={ESTAGIOS}
              onEditar={handleEditarLead}
              onMover={handleMoverEstagio}
              onExcluir={handleExcluirLead}
            />
          )}
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <LeadModal
          lead={leadEditando}
          cerimonialistaId={cerimonialista.id}
          estagios={ESTAGIOS}
          onClose={handleModalClose}
          onSalvo={handleLeadSalvo}
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
