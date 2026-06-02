// Componente Card genérico — container reutilizável com variantes visuais
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card — container visual reutilizável
 *
 * @param {string} variant - 'default' | 'elevated' | 'outlined' | 'flat'
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {boolean} interactive - adiciona cursor pointer e hover state
 * @param {boolean} selected - adiciona estado selecionado com destaque visual
 * @param {function} onClick - handler de clique (torna o card interativo)
 * @param {React.ReactNode} children - conteúdo do card
 * @param {string} className - classes CSS extras
 */
export default function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  selected = false,
  onClick,
  children,
  className = '',
  ...rest
}) {
  const isInteractive = interactive || !!onClick;

  const baseStyles = {
    borderRadius: 'var(--radius-lg)',
    transition: 'all var(--transition-base)',
    cursor: isInteractive ? 'pointer' : 'default',
    position: 'relative',
  };

  const variantStyles = {
    default: {
      backgroundColor: 'var(--color-white)',
      boxShadow: 'var(--shadow-sm)',
      border: '1.5px solid transparent',
    },
    elevated: {
      backgroundColor: 'var(--color-white)',
      boxShadow: 'var(--shadow-md)',
      border: '1.5px solid transparent',
    },
    outlined: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: '1.5px solid var(--color-border)',
    },
    flat: {
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'none',
      border: '1.5px solid transparent',
    },
  };

  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: 'var(--space-3)' },
    md: { padding: 'var(--space-5)' },
    lg: { padding: 'var(--space-8)' },
  };

  const selectedStyles = selected
    ? {
        border: '2px solid var(--color-brand)',
        boxShadow: '0 0 0 4px var(--color-brand-lighter)',
      }
    : {};

  const [isHovered, setIsHovered] = React.useState(false);

  const hoverStyles = isInteractive && isHovered && !selected
    ? {
        transform: 'translateY(-1px)',
        boxShadow:
          variant === 'default'
            ? 'var(--shadow-md)'
            : variant === 'elevated'
            ? 'var(--shadow-lg)'
            : variant === 'outlined'
            ? 'var(--shadow-sm)'
            : 'none',
      }
    : {};

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...selectedStyles,
    ...hoverStyles,
  };

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={className}
      style={combinedStyles}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  interactive: PropTypes.bool,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

export { Card };