import React from 'react';
import Icon from '../ui/Icon';
import FinanceiroForm from './FinanceiroForm';

export default function FinanceiroModal({ lancamento, cerimonialistaId, tipos, categorias, onClose, onSalvo }) {
  const isEditando = !!lancamento;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="financeiro-modal-title"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        backgroundColor: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalIn 250ms ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-5) var(--space-5) var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id="financeiro-modal-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {isEditando ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label="Fechar modal"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: 'var(--space-5)' }}>
          <FinanceiroForm
            lancamento={lancamento}
            cerimonialistaId={cerimonialistaId}
            tipos={tipos}
            categorias={categorias}
            onSalvo={onSalvo}
            onClose={onClose}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
