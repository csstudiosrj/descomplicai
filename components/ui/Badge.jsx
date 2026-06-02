// Componente Badge — indicadores de status e categorias
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: { bg: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: 'var(--color-border)' },
  primary: { bg: 'var(--color-brand-lighter)', color: 'var(--color-brand)', border: 'var(--color-brand-light)' },
  success: { bg: 'var(--color-success-light)', color: 'var(--color-success)', border: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', border: 'var(--color-warning)' },
  danger: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)', border: 'var(--color-danger)' },
  info: { bg: 'var(--color-info-light)', color: 'var(--color-info)', border: 'var(--color-info)' },
};

export default function Badge({ children, variant = 'default', size = 'sm', pill = false }) {
  const style = VARIANTS[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: size === 'sm' ? '2px var(--space-2)' : 'var(--space-1) var(--space-3)',
        borderRadius: pill ? '9999px' : 'var(--radius-md)',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontFamily: 'var(--font-body)',
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md']),
  pill: PropTypes.bool,
};

export { Badge };