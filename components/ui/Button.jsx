// Componente Button reutilizável — variantes, estados e acessibilidade
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';

function LoadingSpinner() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
        opacity="0.3"
      />
      <path
        d="M10 2a8 8 0 0 1 8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
  ariaLabel,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  const baseStyles = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-medium)',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    width: fullWidth ? '100%' : 'auto',
    opacity: isDisabled ? 0.6 : 1,
  };

  const sizeStyles = {
    sm: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)', minHeight: '36px' },
    md: { padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-base)', minHeight: '44px' },
    lg: { padding: 'var(--space-4) var(--space-6)', fontSize: 'var(--text-lg)', minHeight: '52px' },
  };

  const variantStyles = {
    primary: { backgroundColor: 'var(--color-brand)', color: 'var(--color-white)', borderColor: 'var(--color-brand)' },
    secondary: { backgroundColor: 'transparent', color: 'var(--color-text-primary)', borderColor: 'var(--color-border-strong)' },
    ghost: { backgroundColor: 'transparent', color: 'var(--color-text-primary)', borderColor: 'transparent' },
    danger: { backgroundColor: 'var(--color-danger)', color: 'var(--color-white)', borderColor: 'var(--color-danger)' },
  };

  const hoverStyles = {
    primary: { backgroundColor: 'var(--color-brand-dark)' },
    secondary: { backgroundColor: 'var(--color-surface)' },
    ghost: { backgroundColor: 'var(--color-surface)' },
    danger: { backgroundColor: '#9A3A3A' },
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const dynamicHover = isHovered && !isDisabled ? hoverStyles[variant] : {};
  const dynamicActive = isActive && !isDisabled ? { transform: 'scale(0.98)' } : {};

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...dynamicHover,
    ...dynamicActive,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={className}
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...rest}
    >
      {loading && (
        <span style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </span>
      )}
      <span style={{ opacity: loading ? 0 : 1, transition: 'opacity var(--transition-fast)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {children}
      </span>
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  children: PropTypes.node,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
};

export { Button };