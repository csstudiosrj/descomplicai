// Botão de voltar sempre visível no fluxo do memorial
// Dependências diretas: React, PropTypes, Icon.jsx

import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../ui/Icon';

export default function BackButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Voltar para a etapa anterior"
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        left: 'var(--space-6)',
        zIndex: 'var(--z-sticky)',
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-full)',
        border: disabled ? '1.5px solid var(--color-border)' : '1.5px solid var(--color-border-strong)',
        backgroundColor: disabled ? 'var(--color-surface)' : 'var(--color-white)',
        color: 'var(--color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        boxShadow: 'var(--shadow-md)',
        transition: 'background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--color-brand-lighter)';
          e.currentTarget.style.transform = 'scale(1.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = disabled ? 'var(--color-surface)' : 'var(--color-white)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1.08)';
      }}
    >
      <Icon name="arrowLeft" size={20} />
    </button>
  );
}

BackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export { BackButton };
