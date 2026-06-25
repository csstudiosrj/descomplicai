import React from 'react';
import Icon from '../ui/Icon';
import ModeloForm from './ModeloForm';

export default function ModeloModal({ modelo, cerimonialistaId, tipos, onClose, onSalvo }) {
  const isEditando = !!modelo;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modelo-modal-title"
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
          maxWidth: '600px',
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
            id="modelo-modal-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {isEditando ? 'Editar Modelo' : 'Novo Modelo'}
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
          <ModeloForm
            modelo={modelo}
            cerimonialistaId={cerimonialistaId}
            tipos={tipos}
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
