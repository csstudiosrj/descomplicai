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
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-surface)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <Icon name="arrow-left" size={20} ariaHidden={false} ariaLabel="Voltar" />
    </button>
  );
}

BackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export { BackButton };